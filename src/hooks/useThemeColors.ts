import { useColorScheme } from 'nativewind';

export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';

  return {
    dark,
    bgColor: dark ? '#0f172a' : '#f8fafc',
    cardBg: dark ? '#1e293b' : '#ffffff',
    textMain: dark ? '#f1f5f9' : '#0f172a',
    textSub: dark ? '#94a3b8' : '#64748b',
    borderColor: dark ? '#334155' : '#e2e8f0',
  };
}
