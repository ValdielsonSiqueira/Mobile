import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { AlertTriangle, Trash2, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'delete' | 'warning' | 'info';
}

export function ConfirmationModal({ 
  visible, 
  title, 
  description, 
  confirmLabel = 'Confirmar', 
  cancelLabel = 'Cancelar', 
  onConfirm, 
  onCancel,
  type = 'delete'
}: ConfirmationModalProps) {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';

  if (!visible) return null;

  const bgColor = dark ? '#1e293b' : '#ffffff';
  const textMain = dark ? '#f1f5f9' : '#0f172a';
  const textSub = dark ? '#94a3b8' : '#64748b';
  const overlayColor = 'rgba(0,0,0,0.6)';

  const getIcon = () => {
    switch (type) {
      case 'delete': return <Trash2 size={32} color="#ef4444" />;
      case 'warning': return <AlertTriangle size={32} color="#f59e0b" />;
      default: return <AlertTriangle size={32} color="#3b82f6" />;
    }
  };

  const getConfirmColor = () => {
    switch (type) {
      case 'delete': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
      <Animated.View 
        entering={FadeIn} 
        exiting={FadeOut}
        style={[styles.overlay, { backgroundColor: overlayColor }]}
      >
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onCancel} />
        
        <Animated.View 
          entering={FadeInUp.springify().damping(20).mass(0.8)} 
          exiting={FadeOutDown}
          style={[styles.modalContainer, { backgroundColor: bgColor }]}
        >
          {/* Header Icon */}
          <View style={[styles.iconWrapper, { backgroundColor: getConfirmColor() + '15' }]}>
            {getIcon()}
          </View>

          {/* Text Content */}
          <Text style={[styles.title, { color: textMain }]}>{title}</Text>
          <Text style={[styles.description, { color: textSub }]}>{description}</Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              onPress={onCancel} 
              style={[styles.button, styles.cancelButton, { borderColor: dark ? '#334155' : '#e2e8f0' }]}
            >
              <Text style={[styles.buttonText, { color: textSub }]}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onConfirm} 
              style={[styles.button, styles.confirmButton, { backgroundColor: getConfirmColor() }]}
            >
              <Text style={[styles.buttonText, styles.confirmText]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>

          {/* Optional Close Top Right */}
          <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
            <X size={20} color={textSub} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  confirmText: {
    color: '#fff',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  }
});
