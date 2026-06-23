import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTabBarInset } from "../constants/tabBar";

export function useTabBarInset() {
  const insets = useSafeAreaInsets();
  return getTabBarInset(insets.bottom);
}
