import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  Easing,
  interpolate,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { Wallet } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

export function LoadingScreen() {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );

    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    opacity: interpolate(opacity.value, [0.3, 1], [0.1, 0.5]),
  }));

  const bgColor = dark ? '#0f172a' : '#f8fafc';
  const textColor = dark ? '#f1f5f9' : '#0f172a';
  const accentColor = '#3b82f6';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.logoContainer}>
        {/* Anel de Rotação */}
        <Animated.View style={[styles.ring, { borderColor: accentColor }, ringStyle]} />
        
        {/* Logo Central */}
        <Animated.View style={[styles.logoBox, { backgroundColor: accentColor }, logoStyle]}>
          <Wallet size={40} color="#fff" />
        </Animated.View>
      </View>

      <Animated.View style={{ opacity }}>
        <Text style={[styles.title, { color: textColor }]}>FinanceApp</Text>
        <Text style={[styles.subtitle, { color: dark ? '#94a3b8' : '#64748b' }]}>
          Organizando sua vida financeira...
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ring: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderStyle: 'dashed',
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
});
