import { LogOut, User as UserIcon } from 'lucide-react-native';

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { useThemeColors } from '../../src/hooks/useThemeColors';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { dark, bgColor, cardBg, textMain, textSub, borderColor } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <Text style={[styles.title, { color: textMain }]}>Meu Perfil</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={[styles.iconContainer, { backgroundColor: '#3b82f620' }]}>
            <UserIcon size={32} color="#3b82f6" />
          </View>
          <Text style={[styles.emailLabel, { color: textSub }]}>E-mail da Conta</Text>
          <Text style={[styles.emailText, { color: textMain }]}>{user?.email || 'N/A'}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: cardBg, borderColor }]} 
          onPress={signOut}
        >
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
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
  },
  content: {
    padding: 20,
    gap: 24,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emailLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 18,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
});
