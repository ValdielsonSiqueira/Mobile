import React, { useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../../src/firebase/config';
import { useAuth } from '../../src/contexts/AuthContext';

export default function TransactionsScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'users', user.uid, 'transactions'),
        orderBy('date', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(docs);
    } catch (error) {
      console.error('Error fetching transactions', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions();
    }, [user])
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900 p-6 pt-12">
      <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
        Transações
      </Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text className="text-slate-500 text-center mt-10">
              Nenhuma transação encontrada.
            </Text>
          }
          renderItem={({ item }) => (
            <View className="flex-row justify-between p-4 bg-white dark:bg-slate-800 rounded-xl mb-3 shadow-sm">
              <View>
                <Text className="font-medium text-slate-900 dark:text-slate-100">{item.description}</Text>
                <Text className="text-sm text-slate-500 mt-1">{item.category}</Text>
              </View>
              <Text className={`font-semibold ${item.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                R$ {item.amount?.toFixed(2)}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
