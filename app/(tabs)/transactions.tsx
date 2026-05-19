import { Filter } from 'lucide-react-native';

import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { FilterModal } from '../../src/components/FilterModal';
import { TransactionListItem } from '../../src/components/TransactionListItem';
import { TransactionsFilterHeader } from '../../src/components/TransactionsFilterHeader';
import { Toast } from '../../src/components/Toast';
import { useTransactionsQuery } from '../../src/application/hooks/useTransactionsQuery';
import { useThemeColors } from '../../src/hooks/useThemeColors';

export default function TransactionsScreen() {
  const { dark, bgColor, cardBg, textMain, textSub, borderColor, palette } = useThemeColors();
  const [searchText, setSearchText] = useState('');
  const [activeType, setActiveType] = useState<'all' | 'income' | 'expense'>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<{ category?: string; startDate?: Date; endDate?: Date }>({});

  const { 
    data, 
    isLoading: loading, 
    isFetchingNextPage: loadingMore, 
    hasNextPage: hasMore, 
    fetchNextPage: fetchMore, 
    refetch: refresh,
    error: queryError
  } = useTransactionsQuery({
    search: searchText,
    type: activeType,
    category: advancedFilters.category,
    startDate: advancedFilters.startDate,
    endDate: advancedFilters.endDate
  });

  const filteredTransactions = React.useMemo(() => {
    if (!data) return [];
    let allTx = data.pages.flatMap((page) => page.transactions);
    
    if (searchText) {
      const term = searchText.toLowerCase();
      allTx = allTx.filter(t => 
        t.description.toLowerCase().includes(term) || 
        t.category.toLowerCase().includes(term)
      );
    }
    
    return allTx;
  }, [data, searchText]);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'warning' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ visible: true, message, type });
  };

  React.useEffect(() => {
    if (queryError) {
      showToast(queryError.message || 'Erro ao buscar transações', 'error');
    }
  }, [queryError]);

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleTypeChange = (type: 'all' | 'income' | 'expense') => {
    setActiveType(type);
  };

  const handleApplyAdvancedFilters = (filters: { category?: string; startDate?: Date; endDate?: Date }) => {
    setAdvancedFilters(filters);
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <TransactionsFilterHeader
        searchText={searchText}
        onSearchChange={handleSearch}
        activeType={activeType}
        onTypeChange={handleTypeChange}
        advancedFiltersCount={Object.keys(advancedFilters).length}
        onOpenAdvancedFilters={() => setShowFilterModal(true)}
      />

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionListItem transaction={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={dark ? palette.white : palette.black} />
        }
        onEndReached={fetchMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color={palette.primary.DEFAULT} style={styles.loader} />
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
                setAdvancedFilters({});
              }}
            />
          ) : null
        }
      />

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyAdvancedFilters}
        initialFilters={advancedFilters}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
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
