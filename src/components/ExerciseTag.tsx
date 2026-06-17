import { useMemo, type ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { fonts, ColorScheme } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

type Props = {
  name: string;
  size?: "sm" | "md";
};

export default function ExerciseTag({ name, size = "sm" }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors, size), [colors, size]);

  return (
    <View style={s.tag}>
      <Text style={s.tagText}>{name}</Text>
    </View>
  );
}

export function ExerciseTagRow({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors, "sm"), [colors]);

  return <View style={s.tagRow}>{children}</View>;
}

function createStyles(colors: ColorScheme, size: "sm" | "md") {
  return StyleSheet.create({
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
    },
    tag: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: size === "sm" ? 8 : 10,
      paddingVertical: size === "sm" ? 3 : 4,
    },
    tagText: {
      fontFamily: fonts.body,
      fontSize: size === "sm" ? 10 : 11,
      color: colors.muted,
    },
  });
}
