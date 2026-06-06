import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { colors, fonts } from "../constants/theme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useWorkoutStore } from "../store/workoutStore";
import { useState } from "react";
import { formatDate } from "../constants/storage";

export default function HistoryScreen() {
  const { sessions } = useWorkoutStore();
  const [expanded, setExpanded] = useState<string | null>(null);

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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Text style={s.title}>HISTORY</Text>
          <Text style={s.sub}>{sessions.length} SESSIONS LOGGED</Text>
        </View>

        <ScrollView>
          {sessions.map((session) => {
            const isOpen = expanded === session.id;
            const topWeight = Math.max(
              ...session.exercises.flatMap((ex) =>
                ex.sets.map((s) => s.weight),
              ),
            );

            return (
              <TouchableOpacity
                key={session.id}
                style={[s.card, isOpen && s.cardOpen]}
                onPress={() => setExpanded(isOpen ? null : session.id)}
                activeOpacity={0.8}
              >
                <View style={s.cardTop}>
                  <Text style={s.cardDate}>{formatDate(session.date)}</Text>
                  <Text style={s.cardWeight}>top {topWeight}kg</Text>
                </View>

                <View style={s.tagRow}>
                  {session.exercises.map((ex, i) => (
                    <View key={i} style={s.tag}>
                      <Text style={s.tagText}>{ex.name}</Text>
                    </View>
                  ))}
                </View>

                {isOpen && (
                  <View style={s.breakdown}>
                    <View style={s.divider} />
                    {session.exercises.map((ex, i) => (
                      <View key={i} style={s.exSection}>
                        <Text style={s.exName}>{ex.name}</Text>
                        {ex.sets.map((set, si) => (
                          <View key={si} style={s.setRow}>
                            <Text style={s.setNum}>#{si + 1}</Text>
                            <Text style={s.setInfo}>
                              {set.weight}kg × {set.reps} reps
                            </Text>
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
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
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
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.muted,
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
