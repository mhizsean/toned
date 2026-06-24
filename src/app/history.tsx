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
import { useTheme } from "../context/ThemeContext";
import { useLocalSearchParams } from "expo-router";
import DeleteIconButton from "../components/DeleteIconButton";
import ExerciseTag, { ExerciseTagRow } from "../components/ExerciseTag";
import { formatSet } from "../utils/formatWorkout";
import { findExercise } from "../utils/exerciseCatalogue";
import { useTabBarInset } from "../hooks/useTabBarInset";
import {
  formatDaySummary,
  formatHistoryDayLabel,
  getDayWorkoutSummary,
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
          const summary = getDayWorkoutSummary(day.sessions);
          const exerciseNames = getUniqueExerciseNames(day.sessions);

          return (
            <TouchableOpacity
              key={day.dayKey}
              style={[s.card, isOpen && s.cardOpen]}
              onPress={() => setExpandedDay(isOpen ? null : day.dayKey)}
              activeOpacity={0.8}
            >
              <View style={s.cardTop}>
                <View style={s.cardTopLeft}>
                  <Text style={s.cardDate}>
                    {formatHistoryDayLabel(day.date)}
                  </Text>
                  <Text style={s.cardMeta}>{formatDaySummary(summary)}</Text>
                  {day.sessions.length > 1 ? (
                    <Text style={s.cardMeta}>
                      {pluralize(day.sessions.length, "session")}
                    </Text>
                  ) : null}
                </View>
                <View style={s.cardTopRight}>
                  <Text style={s.chevron}>{isOpen ? "▲" : "▼"}</Text>
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

              {!isOpen && (
                <ExerciseTagRow>
                  {exerciseNames.map((name) => (
                    <ExerciseTag key={name} name={name} />
                  ))}
                </ExerciseTagRow>
              )}

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
                      {session.exercises.map((ex) => {
                        if (ex.sets.length === 0) return null;
                        const repLabel = findExercise(ex.name)?.repLabel;

                        return (
                          <View
                            key={`${session.id}-${ex.name}`}
                            style={s.exCard}
                          >
                            <Text style={s.exName}>{ex.name}</Text>
                            {ex.sets.map((set, si) => (
                              <View
                                key={`${session.id}-${ex.name}-set-${si}`}
                                style={s.setRow}
                              >
                                <Text style={s.setInfo}>
                                  <Text style={s.setNum}>#{si + 1} </Text>
                                  {formatSet(set.weight, set.reps, repLabel)}
                                </Text>
                              </View>
                            ))}
                          </View>
                        );
                      })}
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
      alignItems: "flex-start",
      marginBottom: 8,
    },
    cardTopLeft: {
      flex: 1,
      paddingRight: 12,
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
    chevron: {
      color: colors.muted,
      fontSize: 10,
    },
    breakdown: {
      marginTop: 4,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 12,
    },
    sessionSection: {
      marginBottom: 4,
    },
    sessionLabel: {
      fontFamily: fonts.bodyMedium,
      fontSize: 11,
      color: colors.muted,
      letterSpacing: 1,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    exCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
      backgroundColor: colors.background,
    },
    exName: {
      fontFamily: fonts.bodyMedium,
      fontSize: 13,
      color: colors.text,
      marginBottom: 8,
    },
    setRow: {
      backgroundColor: colors.surface,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 8,
      marginBottom: 6,
    },
    setInfo: {
      fontFamily: fonts.mono,
      fontSize: 12,
      color: colors.text,
    },
    setNum: {
      color: colors.muted,
      fontSize: 10,
    },
  });
}
