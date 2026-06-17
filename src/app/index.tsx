import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { fonts, ColorScheme } from "../constants/theme";
import { formatDate, SESSION_DATE_FORMAT } from "../constants/storage";
import { useWorkoutStore } from "../store/workoutStore";
import { calculatePRs } from "../utils/prCalculations";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { useMemo, useState } from "react";
import { TODAY } from "../constants/planning";
import { WorkoutSet } from "../types";
import TodayPlanSheet from "../components/TodayPlanSheet";
import ExerciseTag, { ExerciseTagRow } from "../components/ExerciseTag";
import { pluralize, getDayFocusLabel } from "../utils/text";

export default function HomeScreen() {
  const [showTodayPrompt, setShowTodayPrompt] = useState(false);
  const { sessions, activeSession, startSession, weeklySchedule } =
    useWorkoutStore();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const weekCount = sessions.filter(
    (session) => new Date(session.date) > new Date(Date.now() - 7 * 86_400_000),
  ).length;

  const todayPlan = weeklySchedule[TODAY];
  const totalPRs = Object.keys(calculatePRs(sessions)).length;

  const handleStartSession = () => {
    if (
      todayPlan &&
      todayPlan.type !== "rest" &&
      todayPlan.exercises.length > 0
    ) {
      setShowTodayPrompt(true);
    } else {
      startSession();
      router.push("/session");
    }
  };

  const handleStartWithPlan = () => {
    if (!todayPlan) return;
    const exercises = todayPlan.exercises.map((ex) => ({
      name: ex.name,
      sets: [] as WorkoutSet[],
    }));
    startSession(exercises);
    setShowTodayPrompt(false);
    router.push("/session");
  };

  const handleStartBlank = () => {
    startSession();
    setShowTodayPrompt(false);
    router.push("/session");
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <Text style={s.wordmark}>TONED</Text>
          <Text style={s.date}>{formatDate()}</Text>
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
            <Text style={s.statNum}>{totalPRs}</Text>
            <Text style={s.statLabel}>PRs</Text>
          </View>
        </View>

        {activeSession ? (
          <View style={s.activeBanner}>
            <View>
              <Text style={s.activeBannerTitle}>SESSION IN PROGRESS</Text>
              <Text style={s.activeBannerSub}>
                {`${pluralize(activeSession.exercises.length, "exercise")} logged`}
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
          <TouchableOpacity style={s.startBtn} onPress={handleStartSession}>
            <Text style={s.startBtnText}>＋ START WORKOUT</Text>
          </TouchableOpacity>
        )}
        {todayPlan && todayPlan.type !== "rest" && (
          <View style={s.todayPlanBanner}>
            <Text style={s.todayPlanText}>
              📋 {getDayFocusLabel(todayPlan)} · {todayPlan.exercises.length}{" "}
              exercises loaded
            </Text>
          </View>
        )}

        {todayPlan?.type === "rest" && (
          <View style={s.todayPlanBanner}>
            <Text style={s.todayPlanText}>😴 Rest day — take it easy</Text>
          </View>
        )}

        {sessions.length > 0 && (
          <View style={s.recentWrap}>
            <Text style={s.sectionLabel}>RECENT SESSIONS</Text>

            {sessions.slice(0, 3).map((session) => (
              <View style={s.sessionCard} key={session.id}>
                <View style={s.sessionCardTop}>
                  <Text style={s.sessionDate}>
                    {formatDate(session.date, SESSION_DATE_FORMAT)}
                  </Text>

                  <Text style={s.sessionVol}>
                    {pluralize(session.exercises.length, "exercise")}
                  </Text>
                </View>
                <ExerciseTagRow>
                  {session.exercises.map((exercise) => (
                    <ExerciseTag key={exercise.name} name={exercise.name} />
                  ))}
                </ExerciseTagRow>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TodayPlanSheet
        visible={showTodayPrompt}
        focus={todayPlan ? getDayFocusLabel(todayPlan) : undefined}
        exercises={todayPlan?.exercises ?? []}
        onClose={() => setShowTodayPrompt(false)}
        onStartWithPlan={handleStartWithPlan}
        onStartBlank={handleStartBlank}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
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
    activeBanner: {
      backgroundColor: colors.activeBanner,
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
    todayPlanBanner: {
      marginTop: 8,
      padding: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      alignItems: "center",
    },
    todayPlanText: {
      fontFamily: fonts.body,
      fontSize: 12,
      color: colors.muted,
    },
  });
}
