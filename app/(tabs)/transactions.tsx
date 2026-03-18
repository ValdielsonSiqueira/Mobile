import React, { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar,
  Filter
} from 'lucide-react-native';
import { useTransactions } from '../../src/contexts/TransactionContext';
import { getCategoryColor, getCategoryLabel } from '../../src/utils/categories';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EmptyState } from '../../src/components/EmptyState';
import { CategoryBadge } from '../../src/components/CategoryBadge';

export default function TransactionsScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  
  const { 
    filteredTransactions, 
    loading, 
    loadingMore, 
    hasMore, 
    fetchMore, 
    refresh,
    fetchTransactions 
  } = useTransactions();

  const [searchText, setSearchText] = useState('');
  const [activeType, setActiveType] = useState<'all' | 'income' | 'expense'>('all');

  const bgColor = dark ? '#0f172a' : '#f8fafc';
  const cardBg = dark ? '#1e293b' : '#ffffff';
  const textMain = dark ? '#f1f5f9' : '#0f172a';
  const textSub = dark ? '#94a3b8' : '#64748b';
  const borderColor = dark ? '#334155' : '#e2e8f0';

  const handleSearch = (text: string) => {
    setSearchText(text);
    fetchTransactions({ search: text, type: activeType });
  };

  const handleTypeChange = (type: 'all' | 'income' | 'expense') => {
    setActiveType(type);
    fetchTransactions({ search: searchText, type });
  };

  const renderItem = ({ item }: { item: any }) => {
    const isIncome = item.type === 'income';
    
    return (
      <TouchableOpacity 
        style={[styles.transactionItem, { backgroundColor: cardBg, borderColor }]}
        onPress={() => router.push({ pathname: './manage-transaction', params: { id: item.id } })}
      >
        <View style={[styles.iconContainer, { backgroundColor: isIncome ? '#22c55e20' : '#ef444420' }]}>
          {isIncome ? (
            <ArrowUpRight size={20} color="#22c55e" />
          ) : (
            <ArrowDownLeft size={20} color="#ef4444" />
          )}
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={[styles.description, { color: textMain }]} numberOfLines={1}>
            {item.description}
          </Text>
          <View style={styles.subDetails}>
            <CategoryBadge category={item.category} />
            <Text style={[styles.dot, { color: textSub }]}>•</Text>
            <Text style={[styles.date, { color: textSub }]}>
              {format(new Date(item.date), 'dd MMM', { locale: ptBR })}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.amount, { color: isIncome ? '#22c55e' : '#ef4444' }]}>
          {isIncome ? '+' : '-'} {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header com Busca */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <Text style={[styles.title, { color: textMain }]}>Minhas Transações</Text>
        
        <View style={[styles.searchContainer, { backgroundColor: dark ? '#1e293b' : '#f1f5f9' }]}>
          <Search size={20} color={textSub} style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar por descrição..."
            placeholderTextColor={textSub}
            style={[styles.searchInput, { color: textMain }]}
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

        {/* Filtros de Tipo */}
        <View style={styles.filterRow}>
          {(['all', 'income', 'expense'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => handleTypeChange(type)}
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
          <TouchableOpacity style={[styles.filterBtn, { borderColor, borderWidth: 1 }]}>
            <SlidersHorizontal size={18} color={textSub} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={dark ? '#fff' : '#000'} />
        }
        onEndReached={fetchMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#3b82f6" style={styles.loader} />
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon={Filter}
              title="Sem resultados"
              description="Não encontramos nenhuma transação com esses filtros. Tente mudar a busca ou o tipo."
              actionLabel="Ver Todas"
              onAction={() => {
                setSearchText('');
                setActiveType('all');
                fetchTransactions({ search: '', type: 'all' });
              }}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  detailsContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  subDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dot: {
    marginHorizontal: 6,
    fontSize: 12,
  },
  date: {
    fontSize: 12,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
  },
  loader: {
    marginVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
