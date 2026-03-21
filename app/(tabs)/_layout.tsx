import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Home, List, PlusCircle } from 'lucide-react-native';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6', // blue-500
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color }) => <List size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="manage-transaction"
        options={{
          title: 'Nova',
          tabBarIcon: ({ color }) => <PlusCircle size={24} color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push({ pathname: '/(tabs)/manage-transaction', params: { id: '' } });
          },
        }}
      />
    </Tabs>
  );
}
