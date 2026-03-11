import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../src/firebase/config';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Toast } from '../../src/components/Toast';

export default function ManageTransactionScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'warning' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  const handleSave = async () => {
    if (!description || !amount || !category) {
      showToast('Preencha todos os campos obrigatórios!', 'warning');
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        description,
        amount: parseFloat(amount),
        category,
        date: new Date().toISOString(),
      });
      showToast('Transação adicionada com sucesso!', 'success');
      setDescription('');
      setAmount('');
      setCategory('');
      setTimeout(() => router.back(), 2000);
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar a transação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
      <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
        <View className="p-6 pt-12">
          <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            Nova Transação
          </Text>

          <View className="space-y-4">
            <View>
              <Text className="text-slate-700 dark:text-slate-300 font-medium mb-2">Descrição</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Ex: Supermercado"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-100"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View>
              <Text className="text-slate-700 dark:text-slate-300 font-medium mb-2">Valor (R$)</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="-150.00 ou 5000.00"
                keyboardType="numeric"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-100"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View>
              <Text className="text-slate-700 dark:text-slate-300 font-medium mb-2">Categoria</Text>
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="Ex: Alimentação, Salário"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-100"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#3b82f6" className="mt-8" />
          ) : (
            <TouchableOpacity
              onPress={handleSave}
              className="w-full bg-blue-600 rounded-lg py-4 mt-8 items-center"
            >
              <Text className="text-white font-semibold text-lg">Salvar Transação</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
