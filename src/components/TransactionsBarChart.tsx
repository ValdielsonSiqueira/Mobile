import { format, getMonth, getYear, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useMemo, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Transaction } from '../types/transaction';
import { useThemeColors } from '../hooks/useThemeColors';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface TransactionsBarChartProps {
  transactions: Transaction[];
  animStyle: any;
}

export function TransactionsBarChart({
  transactions,
  animStyle
}: TransactionsBarChartProps) {
  const { dark, cardBg, textMain, textSub, palette, borderColor } = useThemeColors();
  const [barPeriod, setBarPeriod] = useState(6);

  const barData = useMemo(() => {
    return Array.from({ length: barPeriod }, (_, i) => {
      const d = subMonths(new Date(), (barPeriod - 1) - i);
      const targetYear  = getYear(d);
      const targetMonth = getMonth(d);

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

  const groupedBarData = useMemo(() =>
    barData.map((m) => [
      { value: m.income,  label: m.label, frontColor: palette.success.DEFAULT, spacing: 4, labelWidth: 36, labelTextStyle: { color: textSub, fontSize: 11 } },
      { value: m.expense, frontColor: palette.danger.DEFAULT },
    ]).flat()
  , [barData, palette, textSub]);

  return (
    <Animated.View style={[animStyle, styles.chartCard, { backgroundColor: cardBg, shadowColor: palette.black }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <View>
          <Text style={[styles.chartTitle, { color: textMain, marginBottom: 0 }]}>Receitas × Despesas</Text>
          <Text style={{ color: textSub, fontSize: 12 }}>Tendência mensal</Text>
        </View>
        
        <View style={{ flexDirection: 'row', backgroundColor: dark ? palette.slate[700] : palette.slate[100], borderRadius: 8, padding: 2 }}>
          {[3, 6, 12].map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setBarPeriod(p)}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                backgroundColor: barPeriod === p ? palette.primary.DEFAULT : 'transparent',
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: barPeriod === p ? palette.white : textSub }}>
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
          xAxisColor={borderColor}
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
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 12, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: palette.success.DEFAULT }} />
          <Text style={{ color: textSub, fontSize: 12 }}>Receitas</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: palette.danger.DEFAULT }} />
          <Text style={{ color: textSub, fontSize: 12 }}>Despesas</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
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
