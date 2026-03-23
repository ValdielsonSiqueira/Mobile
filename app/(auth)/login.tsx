import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as z from 'zod';
import { auth } from '../../src/firebase/config';

const loginSchema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório.').email('Digite um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const handleAuth = async (data: LoginFormData, isSignUp: boolean) => {
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password);
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
          <Text className="text-3xl font-bold text-slate-900 dark:text-slate-100">Finance App</Text>
          <Text className="text-base text-slate-500 dark:text-slate-400">Controle suas finanças</Text>
        </View>

        <View className="flex-col gap-4">
          <View>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="E-mail"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  style={{ padding: 8 }}
                  placeholderTextColor="#9ca3af"
                />
              )}
            />
            {errors.email && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</Text>}
          </View>

          <View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Senha"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  style={{ padding: 8 }}
                  placeholderTextColor="#9ca3af"
                />
              )}
            />
            {errors.password && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</Text>}
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" className="mt-6" />
        ) : (
          <View className="flex-col gap-3 mt-6">
            <TouchableOpacity
              onPress={handleSubmit((data) => handleAuth(data, false))}
              className="w-full bg-blue-600 rounded-lg items-center"
              style={{ padding: 8 }}
            >
              <Text className="text-white font-semibold text-lg">Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit((data) => handleAuth(data, true))}
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
