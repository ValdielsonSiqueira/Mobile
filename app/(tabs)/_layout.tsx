import { Tabs } from 'expo-router';
import React from 'react';
import { Home, List, PlusCircle } from 'lucide-react-native';

export default function TabLayout() {
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
        name="explore"
        options={{
          title: 'Transações',
          tabBarIcon: ({ color }) => <List size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="manage-transaction"
        options={{
          title: 'Nova',
          tabBarIcon: ({ color }) => <PlusCircle size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
