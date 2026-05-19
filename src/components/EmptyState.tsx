import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LucideIcon, Plus } from 'lucide-react-native';
import { useThemeColors } from '../hooks/useThemeColors';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const { palette } = useThemeColors();

  return (
    <View style={styles.container}>
      <View className="bg-surface" style={styles.iconContainer}>
        <Icon size={48} className="text-primary" />
      </View>
      
      <Text className="text-text-main" style={styles.title}>{title}</Text>
      <Text className="text-text-sub" style={styles.description}>{description}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity 
          style={styles.button}
          className="bg-primary shadow-primary"
          onPress={onAction}
        >
          <Plus size={20} color={palette.white} style={{ marginRight: 8 }} />
          <Text style={[styles.buttonText, { color: palette.white }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
