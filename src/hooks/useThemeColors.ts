import { useColorScheme } from "nativewind"
import { palette, themeColors } from "../assets/tokens/colors"

export function useThemeColors() {
  const { colorScheme } = useColorScheme()
  const dark = colorScheme === "dark"

  const currentTheme = dark ? themeColors.dark : themeColors.light

  return {
    dark,
    bgColor: currentTheme.background,
    cardBg: currentTheme.card,
    textMain: currentTheme.textMain,
    textSub: currentTheme.textSub,
    borderColor: currentTheme.border,
    tabBarActive: currentTheme.tabBarActive,
    tabBarInactive: currentTheme.tabBarInactive,
    tabBarBg: currentTheme.tabBarBg,
    palette,
  }
}
