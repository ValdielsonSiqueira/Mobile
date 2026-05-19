import { Search, SlidersHorizontal } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

export type FilterType = 'all' | 'income' | 'expense';

interface TransactionsFilterHeaderProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  activeType: FilterType;
  onTypeChange: (type: FilterType) => void;
  advancedFiltersCount: number;
  onOpenAdvancedFilters: () => void;
}

export function TransactionsFilterHeader({
  searchText,
  onSearchChange,
  activeType,
  onTypeChange,
  advancedFiltersCount,
  onOpenAdvancedFilters
}: TransactionsFilterHeaderProps) {
  const { dark, textMain, textSub, borderColor } = useThemeColors();

  return (
    <View style={[styles.header, { borderBottomColor: borderColor }]}>
      <Text style={[styles.title, { color: textMain }]}>Minhas Transações</Text>
      
      <View style={[styles.searchContainer, { backgroundColor: dark ? '#1e293b' : '#f1f5f9' }]}>
        <Search size={20} color={textSub} style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar por descrição..."
          placeholderTextColor={textSub}
          style={[styles.searchInput, { color: textMain }]}
          value={searchText}
          onChangeText={onSearchChange}
        />
      </View>

      <View style={styles.filterRow}>
        {(['all', 'income', 'expense'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => onTypeChange(type)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            activeOpacity={0.7}
            style={[
              styles.filterChip,
              { backgroundColor: activeType === type ? '#3b82f6' : (dark ? '#1e293b' : '#fff') },
              activeType !== type && { borderWidth: 1, borderColor }
            ]}
          >
            <Text style={[
              styles.filterText,
              { color: activeType === type ? '#fff' : textSub }
            ]}>
              {type === 'all' ? 'Todas' : type === 'income' ? 'Receitas' : 'Despesas'}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity 
          onPress={onOpenAdvancedFilters}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.6}
          style={[
            styles.filterBtn, 
            { borderColor, borderWidth: 1 },
            advancedFiltersCount > 0 && { backgroundColor: '#3b82f620', borderColor: '#3b82f6' }
          ]}
        >
          <SlidersHorizontal size={18} color={advancedFiltersCount > 0 ? '#3b82f6' : textSub} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterBtn: {
    padding: 8,
    borderRadius: 999,
    marginLeft: 'auto',
  },
});
