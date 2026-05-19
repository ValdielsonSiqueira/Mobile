import React, { useMemo, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Transaction } from '../types/transaction';
import { getCategoryColor, getCategoryLabel } from '../utils/categories';

interface TransactionsPieChartProps {
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  animStyle: any;
  dark: boolean;
  hideValues: boolean;
  cardBg: string;
  textMain: string;
  textSub: string;
}

function formatCurrency(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function TransactionsPieChart({
  transactions,
  totalIncome,
  totalExpense,
  animStyle,
  dark,
  hideValues,
  cardBg,
  textMain,
  textSub
}: TransactionsPieChartProps) {
  const [pieType, setPieType] = useState<'income' | 'expense'>('expense');

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

  return (
    <Animated.View style={[animStyle, styles.chartCard, { backgroundColor: cardBg }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.chartTitle, { color: textMain, marginBottom: 0 }]}>
            Tipo
          </Text>
        </View>
        
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
        {pieData.length > 0 ? (
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
        ) : (
          <View style={{ height: 180, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: textSub, fontSize: 14 }}>
              Nenhuma {pieType === 'expense' ? 'despesa' : 'receita'}.
            </Text>
          </View>
        )}
      </View>
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
  );
}

const styles = StyleSheet.create({
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
});
