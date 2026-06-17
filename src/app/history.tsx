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
import { useMemo, useState } from "react";
import { formatDate } from "../constants/storage";
import { useTheme } from "../context/ThemeContext";
import DeleteIconButton from "../components/DeleteIconButton";
import ExerciseTag, { ExerciseTagRow } from "../components/ExerciseTag";
import { formatSet } from "../utils/formatWorkout";
import { findExercise } from "../utils/exerciseCatalogue";

export default function HistoryScreen() {
  const { sessions, deleteSession } = useWorkoutStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);

  if (sessions.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.empty}>
          <Text style={s.emptyTitle}>NO HISTORY</Text>
          <Text style={s.emptySub}>Complete a session to see it here</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sessionItems = sessions.map((session) => {
    const weights = session.exercises.flatMap((ex) =>
      ex.sets.map((s) => s.weight),
    );
    return {
      session,
      isOpen: expanded === session.id,
      topWeight: weights.length ? Math.max(...weights) : 0,
    };
  });

  return (
    <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Text style={s.title}>HISTORY</Text>
          <Text style={s.sub}>{sessions.length} SESSIONS LOGGED</Text>
        </View>

        <ScrollView>
          {sessionItems.map(({ session, isOpen, topWeight }) => (
            <TouchableOpacity
              key={session.id}
              style={[s.card, isOpen && s.cardOpen]}
              onPress={() => setExpanded(isOpen ? null : session.id)}
              activeOpacity={0.8}
            >
              <View style={s.cardTop}>
                <Text style={s.cardDate}>{formatDate(session.date)}</Text>
                <View style={s.cardTopRight}>
                  {topWeight > 0 ? (
                    <Text style={s.cardWeight}>top {topWeight}kg</Text>
                  ) : null}
                  <DeleteIconButton
                    stopPropagation
                    title="Delete Session"
                    message="Are you sure you want to delete this session? This cannot be undone."
                    onDelete={() => {
                      deleteSession(session.id);
                      if (expanded === session.id) setExpanded(null);
                    }}
                  />
                </View>
              </View>

              <ExerciseTagRow>
                {session.exercises.map((ex, i) => (
                  <ExerciseTag key={i} name={ex.name} />
                ))}
              </ExerciseTagRow>

              {isOpen && (
                <View style={s.breakdown}>
                  <View style={s.divider} />
                  {session.exercises.map((ex, i) => (
                    <View key={i} style={s.exSection}>
                      <Text style={s.exName}>{ex.name}</Text>
                      {ex.sets.map((set, si) => {
                        const repLabel = findExercise(ex.name)?.repLabel;
                        return (
                        <View key={si} style={s.setRow}>
                          <Text style={s.setNum}>#{si + 1}</Text>
                          <Text style={s.setInfo}>
                            {formatSet(set.weight, set.reps, repLabel)}
                            {repLabel !== "seconds" ? " reps" : ""}
                          </Text>
                        </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
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
