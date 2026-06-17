import { useMemo } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { ColorScheme } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

type Props = {
  onPress: () => void;
  size?: number;
};

export default function RemoveButton({ onPress, size = 14 }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors, size), [colors, size]);

  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={s.remove}>✕</Text>
    </TouchableOpacity>
  );
}

function createStyles(colors: ColorScheme, size: number) {
  return StyleSheet.create({
    remove: {
      color: colors.muted,
      fontSize: size,
    },
  });
}
