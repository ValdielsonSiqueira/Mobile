import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface SummaryCardProps {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  animStyle: any;
  dark: boolean;
  hideValues: boolean;
}

function formatCurrency(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function SummaryCard({ label, value, color, icon, animStyle, dark, hideValues }: SummaryCardProps) {
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

const styles = StyleSheet.create({
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
});
