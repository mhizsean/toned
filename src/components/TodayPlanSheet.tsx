import { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { fonts, ColorScheme } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { PlannedScheduleExercise } from "../types";
import BottomSheet from "./BottomSheet";

type Props = {
  visible: boolean;
  focus?: string;
  exercises: PlannedScheduleExercise[];
  onClose: () => void;
  onStartWithPlan: () => void;
  onStartBlank: () => void;
};

export default function TodayPlanSheet({
  visible,
  focus,
  exercises,
  onClose,
  onStartWithPlan,
  onStartBlank,
}: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={s.title}>TODAY'S PLAN</Text>
      <Text style={s.focus}>{focus}</Text>

      <View style={s.exList}>
        {exercises.map((ex, i) => (
          <View key={i} style={s.exRow}>
            <Text style={s.exNum}>{String(i + 1).padStart(2, "0")}</Text>
            <Text style={s.exName}>{ex.name}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.primaryBtn} onPress={onStartWithPlan}>
        <Text style={s.primaryBtnText}>START WITH TODAY'S PLAN</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.secondaryBtn} onPress={onStartBlank}>
        <Text style={s.secondaryBtnText}>START BLANK SESSION</Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    title: {
      fontFamily: fonts.display,
      fontSize: 14,
      color: colors.muted,
      letterSpacing: 2,
      marginBottom: 4,
    },
    focus: {
      fontFamily: fonts.display,
      fontSize: 28,
      color: colors.text,
      letterSpacing: 1,
      marginBottom: 20,
    },
    exList: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 14,
      marginBottom: 20,
      gap: 10,
    },
    exRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    exNum: {
      fontFamily: fonts.mono,
      fontSize: 11,
      color: colors.muted,
      minWidth: 24,
    },
    exName: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.text,
    },
    primaryBtn: {
      backgroundColor: colors.amber,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      marginBottom: 10,
    },
    primaryBtnText: {
      fontFamily: fonts.display,
      fontSize: 18,
      color: colors.background,
      letterSpacing: 1,
    },
    secondaryBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 14,
      alignItems: "center",
    },
    secondaryBtnText: {
      fontFamily: fonts.display,
      fontSize: 16,
      color: colors.muted,
      letterSpacing: 1,
    },
  });
}
