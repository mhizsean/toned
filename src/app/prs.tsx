import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ColorScheme, fonts } from "../constants/theme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useWorkoutStore } from "../store/workoutStore";
import { formatDate } from "../constants/storage";
import { calculatePRs } from "../utils/prCalculations";
import { useTheme } from "../context/ThemeContext";
import { useMemo } from "react";

export default function PRsScreen() {
  const { sessions } = useWorkoutStore();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const entries = Object.entries(calculatePRs(sessions)).sort(
    (a, b) => b[1].weight - a[1].weight,
  );

  if (entries.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.empty}>
          <Text style={s.emptyTitle}>NO PRs YET</Text>
          <Text style={s.emptySub}>Log sessions to see your records here</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Text style={s.title}>RECORDS</Text>
          <Text style={s.sub}>
            {entries.length} LIFT{entries.length !== 1 ? "S" : ""} TRACKED
          </Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          {entries.map(([name, pr]) => (
            <View key={name} style={s.card}>
              <View style={s.cardLeft}>
                <Text style={s.exName}>{name}</Text>
                <Text style={s.prDate}>{formatDate(pr.date)}</Text>
              </View>
              <View style={s.cardRight}>
                <Text style={s.prWeight}>{pr.weight}kg</Text>
                <Text style={s.prReps}>{pr.reps} reps</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: {
      fontFamily: fonts.display,
      fontSize: 36,
      color: colors.border,
      letterSpacing: 2,
    },
    emptySub: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.muted,
      marginTop: 8,
    },
    header: {
      padding: 20,
      paddingBottom: 8,
    },
    title: {
      fontFamily: fonts.display,
      fontSize: 36,
      color: colors.text,
      letterSpacing: 2,
      lineHeight: 38,
    },
    sub: {
      fontFamily: fonts.mono,
      fontSize: 10,
      color: colors.muted,
      letterSpacing: 2,
      marginTop: 4,
    },
    scroll: {
      padding: 20,
      paddingTop: 10,
    },
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 14,
      marginBottom: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardLeft: {
      flex: 1,
    },
    exName: {
      fontFamily: fonts.bodyMedium,
      fontSize: 14,
      color: colors.text,
    },
    prDate: {
      fontFamily: fonts.mono,
      fontSize: 10,
      color: colors.muted,
      marginTop: 4,
    },
    cardRight: {
      alignItems: "flex-end",
    },
    prWeight: {
      fontFamily: fonts.mono,
      fontSize: 24,
      color: colors.amber,
      fontWeight: "600",
      lineHeight: 26,
    },
    prReps: {
      fontFamily: fonts.mono,
      fontSize: 10,
      color: colors.muted,
      marginTop: 3,
    },
  });
}
