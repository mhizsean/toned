import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { ColorScheme, fonts } from "../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWorkoutStore } from "../store/workoutStore";
import { useEffect, useMemo, useState } from "react";
import { formatDate } from "../constants/storage";
import { useTheme } from "../context/ThemeContext";
import { useLocalSearchParams } from "expo-router";
import DeleteIconButton from "../components/DeleteIconButton";
import ExerciseTag, { ExerciseTagRow } from "../components/ExerciseTag";
import { formatSet, getTopWeight } from "../utils/formatWorkout";
import { findExercise } from "../utils/exerciseCatalogue";
import { useTabBarInset } from "../hooks/useTabBarInset";
import {
  getUniqueExerciseNames,
  groupSessionsByDay,
} from "../utils/sessionHistory";
import { pluralize } from "../utils/text";

export default function HistoryScreen() {
  const { sessions, deleteSessionsForDay } = useWorkoutStore();
  const { expand } = useLocalSearchParams<{ expand?: string }>();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const { colors } = useTheme();
  const tabBarInset = useTabBarInset();
  const s = useMemo(() => createStyles(colors), [colors]);
  const dayGroups = useMemo(() => groupSessionsByDay(sessions), [sessions]);

  useEffect(() => {
    if (expand) setExpandedDay(expand);
  }, [expand]);

  if (sessions.length === 0) {
    return (
      <SafeAreaView style={s.safe} edges={["top"]}>
        <View style={s.empty}>
          <Text style={s.emptyTitle}>NO HISTORY</Text>
          <Text style={s.emptySub}>Complete a session to see it here</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <Text style={s.title}>HISTORY</Text>
        <Text style={s.sub}>
          {pluralize(dayGroups.length, "day").toUpperCase()} LOGGED
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: tabBarInset }}>
        {dayGroups.map((day) => {
          const isOpen = expandedDay === day.dayKey;
          const allSets = day.sessions.flatMap((session) =>
            session.exercises.flatMap((exercise) => exercise.sets),
          );
          const topWeight = getTopWeight(allSets) ?? 0;
          const exerciseNames = getUniqueExerciseNames(day.sessions);

          return (
            <TouchableOpacity
              key={day.dayKey}
              style={[s.card, isOpen && s.cardOpen]}
              onPress={() => setExpandedDay(isOpen ? null : day.dayKey)}
              activeOpacity={0.8}
            >
              <View style={s.cardTop}>
                <View>
                  <Text style={s.cardDate}>{formatDate(day.date)}</Text>
                  {day.sessions.length > 1 ? (
                    <Text style={s.cardMeta}>
                      {pluralize(day.sessions.length, "session")}
                    </Text>
                  ) : null}
                </View>
                <View style={s.cardTopRight}>
                  {topWeight > 0 ? (
                    <Text style={s.cardWeight}>top {topWeight}kg</Text>
                  ) : null}
                  <DeleteIconButton
                    stopPropagation
                    title="Delete workout day"
                    message="Are you sure you want to delete this day's workout? This will reset your progress for that day and cannot be undone."
                    onDelete={() => {
                      deleteSessionsForDay(day.dayKey);
                      if (expandedDay === day.dayKey) setExpandedDay(null);
                    }}
                  />
                </View>
              </View>

              <ExerciseTagRow>
                {exerciseNames.map((name) => (
                  <ExerciseTag key={name} name={name} />
                ))}
              </ExerciseTagRow>

              {isOpen && (
                <View style={s.breakdown}>
                  <View style={s.divider} />
                  {day.sessions.map((session, sessionIndex) => (
                    <View key={session.id} style={s.sessionSection}>
                      {day.sessions.length > 1 ? (
                        <Text style={s.sessionLabel}>
                          Session {sessionIndex + 1}
                        </Text>
                      ) : null}
                      {session.exercises.map((ex) => (
                        <View key={`${session.id}-${ex.name}`} style={s.exSection}>
                          <Text style={s.exName}>{ex.name}</Text>
                          {ex.sets.map((set, si) => {
                            const repLabel = findExercise(ex.name)?.repLabel;
                            return (
                              <View
                                key={`${session.id}-${ex.name}-set-${si}`}
                                style={s.setRow}
                              >
                                <Text style={s.setNum}>#{si + 1}</Text>
                                <Text style={s.setInfo}>
                                  {formatSet(set.weight, set.reps, repLabel)}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
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
      borderRadius: 10,
      padding: 14,
      marginBottom: 10,
      marginHorizontal: 16,
    },
    cardOpen: {
      borderColor: colors.amber + "55",
    },
    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    cardTopRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    cardDate: {
      fontFamily: fonts.mono,
      fontSize: 12,
      color: colors.text,
    },
    cardMeta: {
      fontFamily: fonts.mono,
      fontSize: 10,
      color: colors.muted,
      marginTop: 3,
    },
    cardWeight: {
      fontFamily: fonts.mono,
      fontSize: 12,
      color: colors.amber,
    },
    breakdown: {
      marginTop: 12,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 12,
    },
    sessionSection: {
      marginBottom: 12,
    },
    sessionLabel: {
      fontFamily: fonts.bodyMedium,
      fontSize: 11,
      color: colors.muted,
      letterSpacing: 1,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    exSection: {
      marginBottom: 12,
    },
    exName: {
      fontFamily: fonts.bodyMedium,
      fontSize: 13,
      color: colors.text,
      marginBottom: 6,
    },
    setRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 4,
    },
    setNum: {
      fontFamily: fonts.mono,
      fontSize: 10,
      color: colors.muted,
      minWidth: 20,
    },
    setInfo: {
      fontFamily: fonts.mono,
      fontSize: 12,
      color: colors.text,
    },
  });
}
