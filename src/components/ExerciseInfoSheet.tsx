import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useMemo } from "react";
import { fonts, ColorScheme } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { findExercise, formatRepLabel } from "../utils/exerciseCatalogue";
import BottomSheet from "./BottomSheet";

type Props = {
  exerciseName: string | null;
  onClose: () => void;
};

export default function ExerciseInfoSheet({ exerciseName, onClose }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);

  const exercise = findExercise(exerciseName);

  if (!exerciseName || !exercise) return null;

  if (exercise.isCustom) {
    return (
      <BottomSheet visible onClose={onClose}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.title}>{exercise.name}</Text>
            <View style={s.tagRow}>
              <View style={s.tag}>
                <Text style={s.tagText}>{exercise.equipment}</Text>
              </View>
              <View style={s.tag}>
                <Text style={s.tagText}>{exercise.category}</Text>
              </View>
              <View style={s.tag}>
                <Text style={s.tagText}>{formatRepLabel(exercise.repLabel)}</Text>
              </View>
              <View style={s.tag}>
                <Text style={s.tagText}>Custom</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={s.customCard}>
          <Text style={s.customTitle}>YOUR CUSTOM EXERCISE</Text>
          <Text style={s.customText}>
            You added this exercise to your library. Form guides are only
            available for built-in catalogue moves.
          </Text>
        </View>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet visible onClose={onClose}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.title}>{exercise.name}</Text>
          <View style={s.tagRow}>
            <View style={s.tag}>
              <Text style={s.tagText}>{exercise.equipment}</Text>
            </View>
            <View style={s.tag}>
              <Text style={s.tagText}>{exercise.category}</Text>
            </View>
            <View style={s.tag}>
              <Text style={s.tagText}>{formatRepLabel(exercise.repLabel)}</Text>
            </View>
            {exercise.exerciseType && exercise.exerciseType !== "strength" && (
              <View style={s.tag}>
                <Text style={s.tagText}>{exercise.exerciseType}</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
          <Text style={s.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={s.scroll}>
        <Text style={s.sectionLabel}>MUSCLES TARGETED</Text>
        <View style={s.muscleRow}>
          {exercise.muscles.map((m, i) => (
            <View key={i} style={s.musclePill}>
              <Text style={s.musclePillText}>{m}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionLabel}>HOW TO PERFORM</Text>
        <View style={s.card}>
          {exercise.steps.map((step, i) => (
            <View key={i} style={s.stepRow}>
              <View style={s.stepNum}>
                <Text style={s.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={s.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionLabel}>TIPS</Text>
        <View style={s.card}>
          {exercise.tips.map((tip, i) => (
            <View key={i} style={s.bulletRow}>
              <Text style={s.bullet}>→</Text>
              <Text style={s.bulletText}>{tip}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionLabel}>COMMON MISTAKES</Text>
        <View style={s.card}>
          {exercise.mistakes.map((mistake, i) => (
            <View key={i} style={s.bulletRow}>
              <Text style={s.bulletDanger}>✕</Text>
              <Text style={s.bulletText}>{mistake}</Text>
            </View>
          ))}
        </View>

        <View style={s.bottomPad} />
      </ScrollView>
    </BottomSheet>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    headerLeft: {
      flex: 1,
      marginRight: 12,
    },
    title: {
      fontFamily: fonts.display,
      fontSize: 24,
      color: colors.text,
      letterSpacing: 1,
      marginBottom: 8,
    },
    tagRow: {
      flexDirection: "row",
      gap: 6,
    },
    tag: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    tagText: {
      fontFamily: fonts.body,
      fontSize: 11,
      color: colors.muted,
    },
    closeBtn: {
      padding: 4,
    },
    closeBtnText: {
      color: colors.muted,
      fontSize: 18,
    },
    scroll: {
      flexGrow: 0,
    },
    sectionLabel: {
      fontFamily: fonts.body,
      fontSize: 10,
      color: colors.muted,
      letterSpacing: 2,
      marginBottom: 8,
      marginTop: 16,
    },
    muscleRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    musclePill: {
      backgroundColor: colors.amber + "22",
      borderWidth: 1,
      borderColor: colors.amber + "44",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    musclePillText: {
      fontFamily: fonts.body,
      fontSize: 12,
      color: colors.amber,
    },
    card: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 14,
      gap: 12,
    },
    stepRow: {
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-start",
    },
    stepNum: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.amber,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      marginTop: 1,
    },
    stepNumText: {
      fontFamily: fonts.bodyMedium,
      fontSize: 11,
      color: colors.background,
    },
    stepText: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.text,
      flex: 1,
      lineHeight: 20,
    },
    bulletRow: {
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
    },
    bullet: {
      fontFamily: fonts.mono,
      fontSize: 12,
      color: colors.amber,
      marginTop: 2,
    },
    bulletDanger: {
      fontFamily: fonts.mono,
      fontSize: 12,
      color: "#ef4444",
      marginTop: 2,
    },
    bulletText: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.text,
      flex: 1,
      lineHeight: 20,
    },
    bottomPad: {
      height: 20,
    },
    customCard: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 16,
      marginTop: 8,
    },
    customTitle: {
      fontFamily: fonts.display,
      fontSize: 16,
      color: colors.amber,
      letterSpacing: 1,
      marginBottom: 8,
    },
    customText: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.muted,
      lineHeight: 20,
    },
  });
}
