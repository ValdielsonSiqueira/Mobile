import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { useColorScheme } from 'nativewind';
import { Moon, Sun, PlusCircle, TrendingUp, TrendingDown, Wallet, Eye, EyeOff } from 'lucide-react-native';
import { useTransactions } from '../../src/contexts/TransactionContext';
import { getCategoryColor, getCategoryLabel } from '../../src/utils/categories';
import { format, subMonths, getYear, getMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EmptyState } from '../../src/components/EmptyState';
import { CategoryBadge } from '../../src/components/CategoryBadge';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── Utilitários ───────────────────────────────────────────────────────────────
function formatCurrency(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Hook de animação de entrada ──────────────────────────────────────────────
function useFadeSlideIn(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        damping: 18,
        stiffness: 120,
      }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] };
}

// ─── Componente: Card de Sumário ──────────────────────────────────────────────
interface SummaryCardProps {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  animStyle: any;
  dark: boolean;
  hideValues: boolean;
}

function SummaryCard({ label, value, color, icon, animStyle, dark, hideValues }: SummaryCardProps) {
  return (
    <Animated.View style={[animStyle, styles.summaryCard, { backgroundColor: dark ? '#1e293b' : '#fff' }]}>
      <View style={[styles.summaryIcon, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <Text style={[styles.summaryLabel, { color: dark ? '#94a3b8' : '#64748b' }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{hideValues ? '••••••••' : formatCurrency(value)}</Text>
    </Animated.View>
  );
}

// ─── Tela Principal ───────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';

  const [hideValues, setHideValues] = useState(false);
  const [barPeriod, setBarPeriod] = useState(6);
  const [pieType, setPieType] = useState<'income' | 'expense'>('expense');
  const { transactions, loading, balance, totalIncome, totalExpense, refresh } = useTransactions();

  // Animações escalonadas
  const headerAnim   = useFadeSlideIn(0);
  const balanceAnim  = useFadeSlideIn(100);
  const cardsAnim    = useFadeSlideIn(200);
  const pieAnim      = useFadeSlideIn(300);
  const barAnim      = useFadeSlideIn(400);
  const recentAnim   = useFadeSlideIn(500);

  // ── Dados para o gráfico de pizza (top 5 categorias) ───────────────────────
  const pieData = useMemo(() => {
    const list = transactions.filter((t) => t.type === pieType);
    const byCategory: Record<string, number> = {};
    list.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
    });
    const sorted = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sorted.map(([cat, total]) => ({
      value: Math.max(0, parseFloat((total || 0).toFixed(2))),
      color: getCategoryColor(cat),
      text: getCategoryLabel(cat),
    }));
  }, [transactions, pieType]);

  // ── Dados para gráfico de barras (dinâmico por período) ───────────────────
  const barData = useMemo(() => {
    return Array.from({ length: barPeriod }, (_, i) => {
      const d = subMonths(new Date(), (barPeriod - 1) - i);
      const targetYear  = getYear(d);
      const targetMonth = getMonth(d); // 0-indexed

      const month = transactions.filter((t) => {
        try {
          const txDate = new Date(t.date);
          return getYear(txDate) === targetYear && getMonth(txDate) === targetMonth;
        } catch { return false; }
      });

      const income  = month.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = month.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      return {
        label: format(d, barPeriod > 6 ? 'MM/yy' : 'MMM', { locale: ptBR }),
        income:  Math.max(0, parseFloat((income || 0).toFixed(2))),
        expense: Math.max(0, parseFloat((expense || 0).toFixed(2))),
      };
    });
  }, [transactions, barPeriod]);

  // FlatList-style bar data (grouped bars)
  const groupedBarData = useMemo(() =>
    barData.map((m) => [
      { value: m.income,  label: m.label, frontColor: '#22c55e', spacing: 4, labelWidth: 36, labelTextStyle: { color: dark ? '#94a3b8' : '#64748b', fontSize: 11 } },
      { value: m.expense, frontColor: '#ef4444' },
    ]).flat()
  , [barData, dark]);

  // Últimas 5 transações
  const recentTransactions = useMemo(() => [...transactions].slice(0, 5), [transactions]);

  const bgColor  = dark ? '#0f172a' : '#f8fafc';
  const cardBg   = dark ? '#1e293b' : '#ffffff';
  const textMain = dark ? '#f1f5f9' : '#0f172a';
  const textSub  = dark ? '#94a3b8' : '#64748b';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bgColor }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={dark ? '#fff' : '#000'} />}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* ── Header ─────────────────────────────────── */}
      <Animated.View style={[headerAnim, { paddingHorizontal: 20, paddingTop: 56, marginBottom: 8 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 26, fontWeight: '800', color: textMain }}>Visão Geral</Text>
            <Text style={{ fontSize: 13, color: textSub, marginTop: 2 }}>Acompanhe suas finanças</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => setHideValues(prev => !prev)}
              style={{ padding: 10, backgroundColor: dark ? '#1e293b' : '#e2e8f0', borderRadius: 999 }}
            >
              {hideValues ? <EyeOff size={20} color={dark ? '#94a3b8' : '#64748b'} /> : <Eye size={20} color={dark ? '#94a3b8' : '#64748b'} />}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleColorScheme}
              style={{ padding: 10, backgroundColor: dark ? '#1e293b' : '#e2e8f0', borderRadius: 999 }}
            >
              {dark ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} color="#475569" />}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <View style={{ paddingHorizontal: 20 }}>

        {/* ── Card de Saldo ─────────────────────────── */}
        <Animated.View style={[balanceAnim, styles.balanceCard]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Wallet size={18} color="#bfdbfe" />
            <Text style={{ color: '#bfdbfe', marginLeft: 6, fontWeight: '600', fontSize: 13 }}>Saldo Total</Text>
          </View>
          <Text style={{ fontSize: 38, fontWeight: '800', color: '#fff', letterSpacing: -1 }}>
            {hideValues ? '••••••••' : formatCurrency(balance)}
          </Text>
          <Text style={{ color: '#bfdbfe', marginTop: 6, fontSize: 12 }}>
            {transactions.length} transação{transactions.length !== 1 ? 'ões' : ''} registrada{transactions.length !== 1 ? 's' : ''}
          </Text>
        </Animated.View>

        {/* ── Cards Receita / Despesa ───────────────── */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <SummaryCard
            label="Receitas"
            value={totalIncome}
            color="#22c55e"
            icon={<TrendingUp size={18} color="#22c55e" />}
            animStyle={[cardsAnim, { flex: 1 }]}
            dark={dark}
            hideValues={hideValues}
          />
          <SummaryCard
            label="Despesas"
            value={totalExpense}
            color="#ef4444"
            icon={<TrendingDown size={18} color="#ef4444" />}
            animStyle={[cardsAnim, { flex: 1 }]}
            dark={dark}
            hideValues={hideValues}
          />
        </View>

        {/* ── Botão Nova Transação ──────────────────── */}
        <Link href={{ pathname: '/(tabs)/manage-transaction', params: { id: '' } }} asChild>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              borderRadius: 14,
              marginBottom: 20,
              backgroundColor: dark ? 'rgba(37,99,235,0.25)' : '#dbeafe',
            }}
          >
            <PlusCircle size={20} color="#3b82f6" />
            <Text style={{ color: '#3b82f6', fontWeight: '700', marginLeft: 8, fontSize: 15 }}>
              Nova Transação
            </Text>
          </TouchableOpacity>
        </Link>

        {/* ── Gráfico: Por categoria (Pizza) ─ */}
        {pieData.length > 0 && (
          <Animated.View style={[pieAnim, styles.chartCard, { backgroundColor: cardBg }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.chartTitle, { color: textMain, marginBottom: 0 }]}>
                  Tipo
                </Text>
              </View>
              
              {/* Seletor de Tipo (Pizza) */}
              <View style={{ flexDirection: 'row', backgroundColor: dark ? '#334155' : '#f1f5f9', borderRadius: 8, padding: 2, flexShrink: 0 }}>
                {(['expense', 'income'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setPieType(type)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      backgroundColor: pieType === type ? (type === 'expense' ? '#ef4444' : '#22c55e') : 'transparent',
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: pieType === type ? '#fff' : textSub }}>
                      {type === 'expense' ? 'Despesas' : 'Receitas'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <PieChart
                data={pieData}
                donut
                radius={90}
                innerRadius={54}
                innerCircleColor={cardBg}
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 11, color: dark ? '#94a3b8' : '#64748b' }}>Total</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: dark ? '#f1f5f9' : '#0f172a' }}>
                      {hideValues ? '••••••••' : formatCurrency(pieType === 'expense' ? totalExpense : totalIncome)}
                    </Text>
                  </View>
                )}
              />
            </View>
            {/* Legenda */}
            <View style={{ gap: 6, marginTop: 4 }}>
              {pieData.map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
                    <Text style={{ color: textSub, fontSize: 13 }}>{item.text}</Text>
                  </View>
                  <Text style={{ color: textMain, fontWeight: '600', fontSize: 13 }}>
                    {hideValues ? '••••••••' : formatCurrency(item.value)}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ── Gráfico: Receitas x Despesas por período (Barras) */}
        <Animated.View style={[barAnim, styles.chartCard, { backgroundColor: cardBg }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <Text style={[styles.chartTitle, { color: textMain, marginBottom: 0 }]}>Receitas × Despesas</Text>
              <Text style={{ color: textSub, fontSize: 12 }}>Tendência mensal</Text>
            </View>
            
            {/* Seletor de Período */}
            <View style={{ flexDirection: 'row', backgroundColor: dark ? '#334155' : '#f1f5f9', borderRadius: 8, padding: 2 }}>
              {[3, 6, 12].map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setBarPeriod(p)}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    backgroundColor: barPeriod === p ? (dark ? '#1d4ed8' : '#3b82f6') : 'transparent',
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '700', color: barPeriod === p ? '#fff' : textSub }}>
                    {p}M
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ overflow: 'hidden', width: SCREEN_WIDTH - 80 }}>
            <BarChart
              key={`chart-${barPeriod}`}
              data={groupedBarData}
              barWidth={barPeriod > 6 ? 10 : 16}
              spacing={barPeriod > 6 ? 12 : 24}
              endSpacing={40}
              roundedTop
              xAxisThickness={1}
              yAxisThickness={0}
              xAxisColor={dark ? '#334155' : '#e2e8f0'}
              yAxisTextStyle={{ color: textSub, fontSize: 10 }}
              noOfSections={4}
              maxValue={Math.max(...barData.map((d) => Math.max(d.income, d.expense, 1))) * 1.2}
              isAnimated
              animationDuration={600}
              barBorderRadius={4}
              initialSpacing={10}
              width={SCREEN_WIDTH - 100}
              hideRules
              xAxisLabelTextStyle={{ color: textSub, fontSize: 10, width: 40, textAlign: 'center' }}
            />
          </View>
          {/* Legenda */}
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 12, justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#22c55e' }} />
              <Text style={{ color: textSub, fontSize: 12 }}>Receitas</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#ef4444' }} />
              <Text style={{ color: textSub, fontSize: 12 }}>Despesas</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Transações Recentes ───────────────────── */}
        <Animated.View style={recentAnim}>
          <Text style={[styles.chartTitle, { color: textMain, marginBottom: 12 }]}>Transações Recentes</Text>

          {recentTransactions.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: cardBg }]}>
              <EmptyState
                icon={Wallet}
                title="Sem transações"
                description="Você ainda não registrou nenhuma movimentação financeira."
              />
            </View>
          ) : (
            recentTransactions.map((tx) => (
              <TouchableOpacity 
                key={tx.id} 
                style={[styles.txRow, { backgroundColor: cardBg }]}
                onPress={() => router.push({ pathname: '/(tabs)/manage-transaction', params: { id: tx.id } })}
              >
                <View style={[styles.txDot, { backgroundColor: getCategoryColor(tx.category) + '25' }]}>
                  <View style={[styles.txDotInner, { backgroundColor: getCategoryColor(tx.category) }]} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: textMain, fontWeight: '600', fontSize: 14 }} numberOfLines={1}>
                    {hideValues ? '••••••••' : tx.description}
                  </Text>
                  <View style={{ marginTop: 2 }}>
                    <CategoryBadge category={tx.category} />
                  </View>
                </View>
                <Text style={{ fontWeight: '700', fontSize: 15, color: tx.type === 'income' ? '#22c55e' : '#ef4444' }}>
                  {hideValues ? '••••••••' : `${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}`}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </Animated.View>

      </View>
    </ScrollView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  chartCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyState: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  txDot: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});
