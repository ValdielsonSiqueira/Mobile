import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

const ICONS = {
  success: <CheckCircle size={20} color="#22c55e" />,
  error: <XCircle size={20} color="#ef4444" />,
  warning: <AlertCircle size={20} color="#f59e0b" />,
};

const BG_CLASSES: Record<ToastType, string> = {
  success: 'border-success',
  error: 'border-danger',
  warning: 'border-warning',
};

export function Toast({ visible, message, type = 'success', duration = 3000, onHide }: ToastProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });

      opacity.value = withDelay(
        duration,
        withTiming(0, { duration: 300 }, (finished) => {
          if (finished) runOnJS(onHide)();
        })
      );
      translateY.value = withDelay(duration, withTiming(-20, { duration: 300 }));
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={animatedStyle}
      className={`absolute top-14 left-4 right-4 z-50 flex-row items-center gap-3 bg-surface border-l-4 ${BG_CLASSES[type]} rounded-xl p-4 shadow-lg`}
    >
      {ICONS[type]}
      <Text className="flex-1 text-text-main font-medium">{message}</Text>
    </Animated.View>
  );
}
