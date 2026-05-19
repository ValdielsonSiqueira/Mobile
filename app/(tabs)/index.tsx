import { Link } from 'expo-router';
import { Eye, EyeOff, Moon, PlusCircle, Sun, TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { SummaryCard } from '../../src/components/SummaryCard';
import { TransactionListItem } from '../../src/components/TransactionListItem';
import { TransactionsBarChart } from '../../src/components/TransactionsBarChart';
import { TransactionsPieChart } from '../../src/components/TransactionsPieChart';
import { useTransactionsQuery } from '../../src/application/hooks/useTransactionsQuery';

function formatCurrency(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

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

export default function DashboardScreen() {
  const { toggleColorScheme } = useColorScheme();
  const { dark, bgColor, cardBg, textMain, textSub, palette } = useThemeColors();

  const [hideValues, setHideValues] = useState(false);
  const { data, isLoading: loading, refetch: refresh } = useTransactionsQuery();

  const transactions = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.transactions);
  }, [data]);

  const totalIncome = useMemo(() => 
    transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc, 0), 
  [transactions]);

  const totalExpense = useMemo(() => 
    transactions.reduce((acc, t) => t.type === 'expense' ? acc + t.amount : acc, 0), 
  [transactions]);

  const balance = totalIncome - totalExpense;

  const headerAnim   = useFadeSlideIn(0);
  const balanceAnim  = useFadeSlideIn(100);
  const cardsAnim    = useFadeSlideIn(200);
  const pieAnim      = useFadeSlideIn(300);
  const barAnim      = useFadeSlideIn(400);
  const recentAnim   = useFadeSlideIn(500);

  const recentTransactions = useMemo(() => [...transactions].slice(0, 5), [transactions]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bgColor }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={palette.textMain} />}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Animated.View style={[headerAnim, { paddingHorizontal: 20, paddingTop: 56, marginBottom: 8 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 26, fontWeight: '800', color: textMain }}>Visão Geral</Text>
            <Text style={{ fontSize: 13, color: textSub, marginTop: 2 }}>Acompanhe suas finanças</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => setHideValues(prev => !prev)}
              style={{ padding: 10, backgroundColor: dark ? palette.slate[800] : palette.slate[200], borderRadius: 999 }}
            >
              {hideValues ? <EyeOff size={20} color={textSub} /> : <Eye size={20} color={textSub} />}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleColorScheme}
              style={{ padding: 10, backgroundColor: dark ? palette.slate[800] : palette.slate[200], borderRadius: 999 }}
            >
              {dark ? <Sun size={20} color={palette.warning.DEFAULT} /> : <Moon size={20} color={palette.slate[600]} />}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <View style={{ paddingHorizontal: 20 }}>

        <Animated.View style={[balanceAnim, styles.balanceCard, { backgroundColor: palette.primary.DEFAULT, shadowColor: palette.primary.DEFAULT }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Wallet size={18} color={palette.primary.light} />
            <Text style={{ color: palette.primary.light, marginLeft: 6, fontWeight: '600', fontSize: 13 }}>Saldo Total</Text>
          </View>
          <Text style={{ fontSize: 38, fontWeight: '800', color: palette.white, letterSpacing: -1 }}>
            {hideValues ? '••••••••' : formatCurrency(balance)}
          </Text>
          <Text style={{ color: palette.primary.light, marginTop: 6, fontSize: 12 }}>
            {transactions.length} transação{transactions.length !== 1 ? 'ões' : ''} registrada{transactions.length !== 1 ? 's' : ''}
          </Text>
        </Animated.View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <SummaryCard
            label="Receitas"
            value={totalIncome}
            color={palette.success.DEFAULT}
            icon={<TrendingUp size={18} color={palette.success.DEFAULT} />}
            animStyle={[cardsAnim, { flex: 1 }]}
            hideValues={hideValues}
          />
          <SummaryCard
            label="Despesas"
            value={totalExpense}
            color={palette.danger.DEFAULT}
            icon={<TrendingDown size={18} color={palette.danger.DEFAULT} />}
            animStyle={[cardsAnim, { flex: 1 }]}
            hideValues={hideValues}
          />
        </View>

        <Link href={{ pathname: '/(tabs)/manage-transaction', params: { id: '' } }} asChild>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              borderRadius: 14,
              marginBottom: 20,
              backgroundColor: dark ? palette.primary.transparent : palette.primary.light,
            }}
          >
            <PlusCircle size={20} color={palette.primary.DEFAULT} />
            <Text style={{ color: palette.primary.DEFAULT, fontWeight: '700', marginLeft: 8, fontSize: 15 }}>
              Nova Transação
            </Text>
          </TouchableOpacity>
        </Link>

        {transactions.length > 0 && (
          <TransactionsPieChart
            transactions={transactions}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            animStyle={pieAnim}
            hideValues={hideValues}
          />
        )}

        <TransactionsBarChart
          transactions={transactions}
          animStyle={barAnim}
        />

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
              <TransactionListItem key={tx.id} transaction={tx} />
            ))
          )}
        </Animated.View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
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
});
