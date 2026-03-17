import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/firebase/config';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (isSignUp: boolean) => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro de Autenticação', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
      <View className="w-full max-w-sm space-y-4">
        <View className="items-center mb-6">
          <Text className="text-3xl font-bold text-slate-900 dark:text-slate-100">Tech Challenge</Text>
          <Text className="text-base text-slate-500 dark:text-slate-400">Finance App Login</Text>
        </View>

        <View className="flex-col gap-4">
          <TextInput
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            style={{ padding: 8 }}
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            style={{ padding: 8 }}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" className="mt-6" />
        ) : (
          <View className="flex-col gap-3 mt-6">
            <TouchableOpacity
              onPress={() => handleAuth(false)}
              className="w-full bg-blue-600 rounded-lg items-center"
              style={{ padding: 8 }}
            >
              <Text className="text-white font-semibold text-lg">Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAuth(true)}
              className="w-full bg-slate-200 dark:bg-slate-800 rounded-lg items-center"
              style={{ padding: 8 }}
            >
              <Text className="text-slate-900 dark:text-slate-100 font-semibold text-lg">Criar Conta</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
