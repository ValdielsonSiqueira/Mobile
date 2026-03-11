import React, { useState } from 'react';
import { useFocusEffect, Link } from 'expo-router';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../src/firebase/config';
import { useAuth } from '../../src/contexts/AuthContext';
import { useColorScheme } from 'nativewind';
import { Moon, Sun, PlusCircle } from 'lucide-react-native';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'users', user.uid, 'transactions'),
        orderBy('date', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      let balance = 0;
      const transactions: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({ id: doc.id, ...data });
        balance += data.amount || 0;
      });
      setRecentTransactions(transactions);
      setTotalBalance(balance); // Simplified: computing balance from recent only for mockup purposes
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [user])
  );

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 dark:bg-slate-900"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="p-6 pt-12">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-3xl font-bold text-slate-900 dark:text-white">
            Visão Geral
          </Text>
          <TouchableOpacity onPress={toggleColorScheme} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full">
            {colorScheme === 'dark' ? (
              <Sun size={24} color="#e2e8f0" />
            ) : (
              <Moon size={24} color="#0f172a" />
            )}
          </TouchableOpacity>
        </View>
        <Text className="text-slate-500 dark:text-slate-400 mb-8">
          Acompanhe seu progresso financeiro.
        </Text>

        <View className="bg-blue-600 rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-blue-100 font-medium mb-1">Saldo Atual</Text>
          <Text className="text-4xl font-bold text-white mb-4">
            R$ {totalBalance.toFixed(2).replace('.', ',')}
          </Text>
        </View>

        <View className="mb-8">
          <Link href="/(tabs)/manage-transaction" asChild>
            <TouchableOpacity className="flex-row items-center justify-center bg-blue-100 dark:bg-blue-900/40 p-4 rounded-xl">
              <PlusCircle size={20} color="#3b82f6" className="mr-2" />
              <Text className="text-blue-600 dark:text-blue-400 font-semibold text-base ml-2">Nova Transação</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View>
          <Text className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
            Transações Recentes
          </Text>
          
          {recentTransactions.length === 0 ? (
            <Text className="text-slate-500 dark:text-slate-400">Nenhuma transação encontrada.</Text>
          ) : (
            recentTransactions.map((tx: any) => (
              <View key={tx.id} className="flex-row justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl mb-3 shadow-sm">
                <View>
                  <Text className="font-medium text-slate-900 dark:text-slate-100">{tx.description || 'Transação'}</Text>
                  <Text className="text-slate-500 text-sm mt-1">{tx.category || 'Geral'}</Text>
                </View>
                <Text className={`font-semibold ${tx.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {tx.amount >= 0 ? '+' : ''}R$ {tx.amount?.toFixed(2).replace('.', ',')}
                </Text>
              </View>
            ))
          )}
        </View>

      </View>
    </ScrollView>
  );
}
