import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { colors, fonts } from "../constants/theme";
import { useWorkoutStore } from "../store/workoutStore";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function HomeScreen() {
  const { sessions, activeSession, startSession } = useWorkoutStore();

  const weekCount = sessions.filter(
    (session) => new Date(session.date) > new Date(Date.now() - 7 * 86_400_000),
  ).length;

  const totalPRs = () => {
    const prs: Record<string, number> = {};
    sessions.forEach((session) =>
      session.exercises.forEach((exercise) =>
        exercise.sets.forEach((set) => {
          if (!prs[exercise.name] || set.weight > prs[exercise.name]) {
            prs[exercise.name] = set.weight;
          }
        }),
      ),
    );
    return Object.keys(prs).length;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.header}>
            <Text style={s.wordmark}>TONED</Text>
            <Text style={s.date}>
              {new Date()
                .toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
                .toUpperCase()}
            </Text>
          </View>

          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={s.statNum}>{sessions.length}</Text>
              <Text style={s.statLabel}>SESSIONS</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statNum}>{weekCount}</Text>
              <Text style={s.statLabel}>THIS WEEK</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statNum}>{totalPRs()}</Text>
              <Text style={s.statLabel}>PRs</Text>
            </View>
          </View>

          {activeSession ? (
            <View style={s.activeBanner}>
              <View>
                <Text style={s.activeBannerTitle}>SESSION IN PROGRESS</Text>
                <Text style={s.activeBannerSub}>
                  {activeSession.exercises.length} exercise
                  {activeSession.exercises.length !== 1 ? "s" : ""} logged
                </Text>
              </View>
              <TouchableOpacity
                style={s.resumeBtn}
                onPress={() => router.push("/session")}
              >
                <Text style={s.resumeBtnText}>RESUME →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={s.startBtn}
              onPress={() => {
                startSession();
                router.push("/session");
              }}
            >
              <Text style={s.startBtnText}>＋ START WORKOUT</Text>
            </TouchableOpacity>
          )}

          {sessions.length > 0 && (
            <View style={s.recentWrap}>
              <Text style={s.sectionLabel}>RECENT SESSIONS</Text>

              {sessions.slice(0, 3).map((session) => (
                <View style={s.sessionCard} key={session.id}>
                  <View style={s.sessionCardTop}>
                    <Text style={s.sessionDate}>
                      {new Date(session.date)
                        .toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })
                        .toUpperCase()}
                    </Text>

                    {/* <Text style={s.sessionVol}>
                      {Math.round(
                        session.exercises.reduce(
                          (acc, exercise) =>
                            acc +
                            exercise.sets.reduce(
                              (acc, set) => acc + set.weight * set.reps,
                              0,
                            ),
                          0,
                        ),
                      )}
                      kg Vol
                    </Text> */}

                    <Text style={s.sessionVol}>
                      {session.exercises.length} exercise
                      {session.exercises.length !== 1 ? "s" : ""}
                    </Text>
                  </View>
                  <View style={s.tagRow}>
                    {session.exercises.map((exercise, i) => (
                      <View style={s.tag} key={i}>
                        <Text style={s.tagText}>{exercise.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
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
  scroll: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },

  wordmark: {
    fontFamily: fonts.display,
    fontSize: 42,
    color: colors.amber,
    letterSpacing: 4,
    lineHeight: 44,
  },
  date: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 2,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  statNum: {
    fontFamily: fonts.mono,
    fontSize: 26,
    color: colors.amber,
    fontWeight: "600",
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1,
    marginTop: 4,
  },
  startBtn: {
    backgroundColor: colors.amber,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  startBtnText: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.background,
    letterSpacing: 2,
  },
  recentWrap: {
    marginTop: 24,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: 10,
  },
  sessionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  sessionCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sessionDate: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.text,
  },
  sessionVol: {
    fontFamily: fonts.mono,
    fontSize: 11,
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
  activeBanner: {
    backgroundColor: "#0c0900",
    borderWidth: 1,
    borderColor: colors.amber + "44",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeBannerTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.amber,
    letterSpacing: 1,
  },
  activeBannerSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
  },
  resumeBtn: {
    backgroundColor: colors.amber,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  resumeBtnText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.background,
    letterSpacing: 1,
  },
});
