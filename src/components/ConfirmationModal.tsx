import { AlertTriangle, Trash2, X } from 'lucide-react-native';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeOut, FadeOutDown } from 'react-native-reanimated';
import { useThemeColors } from '../hooks/useThemeColors';

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
  const { bgColor, textMain, textSub, borderColor, palette } = useThemeColors();

  if (!visible) return null;

  const overlayColor = 'rgba(0,0,0,0.6)';

  const getIcon = () => {
    switch (type) {
      case 'delete': return <Trash2 size={32} color={palette.danger.DEFAULT} />;
      case 'warning': return <AlertTriangle size={32} color={palette.warning.DEFAULT} />;
      default: return <AlertTriangle size={32} color={palette.primary.DEFAULT} />;
    }
  };

  const getThemeClasses = () => {
    switch (type) {
      case 'delete': return { wrapper: 'bg-danger/15', button: 'bg-danger shadow-danger' };
      case 'warning': return { wrapper: 'bg-warning/15', button: 'bg-warning shadow-warning' };
      default: return { wrapper: 'bg-primary/15', button: 'bg-primary shadow-primary' };
    }
  };
  const themeClasses = getThemeClasses();

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
          style={[styles.modalContainer, { backgroundColor: bgColor, shadowColor: palette.black }]}
        >
          <View style={styles.iconWrapper} className={themeClasses.wrapper}>
            {getIcon()}
          </View>

          <Text style={[styles.title, { color: textMain }]}>{title}</Text>
          <Text style={[styles.description, { color: textSub }]}>{description}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              onPress={onCancel} 
              style={[styles.button, styles.cancelButton, { borderColor }]}
            >
              <Text style={[styles.buttonText, { color: textSub }]}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onConfirm} 
              style={[styles.button, styles.confirmButton, { shadowColor: palette.black }]}
              className={themeClasses.button}
            >
              <Text style={[styles.buttonText, { color: palette.white }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>

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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  }
});
