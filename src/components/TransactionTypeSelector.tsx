import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

interface TransactionTypeSelectorProps {
  currentType: 'income' | 'expense';
  onChange: (type: 'income' | 'expense') => void;
}

export function TransactionTypeSelector({ currentType, onChange }: TransactionTypeSelectorProps) {
  const { cardBg, borderColor, textSub } = useThemeColors();

  return (
    <View style={[styles.typeContainer, { backgroundColor: cardBg, borderColor }]}>
      <TouchableOpacity 
        onPress={() => onChange('expense')}
        style={[styles.typeTab, currentType === 'expense' && styles.typeTabExpense]}
      >
        <Text style={[styles.typeText, currentType === 'expense' ? styles.typeTextActive : { color: textSub }]}>Despesa</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => onChange('income')}
        style={[styles.typeTab, currentType === 'income' && styles.typeTabIncome]}
      >
        <Text style={[styles.typeText, currentType === 'income' ? styles.typeTextActive : { color: textSub }]}>Receita</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  typeContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 6,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeTabExpense: {
    backgroundColor: '#ef4444',
  },
  typeTabIncome: {
    backgroundColor: '#22c55e',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  typeTextActive: {
    color: '#fff',
  },
});
