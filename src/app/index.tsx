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
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { useMemo, useState } from "react";
import { DAYS, TODAY } from "../constants/planning";
import { WorkoutSet } from "../types";
import { Modal } from "react-native";

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
    <SafeAreaProvider>
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
            <TouchableOpacity style={s.startBtn} onPress={handleStartSession}>
              <Text style={s.startBtnText}>＋ START WORKOUT</Text>
            </TouchableOpacity>
          )}
          {todayPlan && todayPlan.type !== "rest" && (
            <View style={s.todayPlanBanner}>
              <Text style={s.todayPlanText}>
                📋 {todayPlan.focus} · {todayPlan.exercises.length} exercises
                loaded
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

        {/* Today's plan prompt */}
        <Modal
          visible={showTodayPrompt}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTodayPrompt(false)}
        >
          <TouchableOpacity
            style={s.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTodayPrompt(false)}
          >
            <TouchableOpacity
              style={s.modalSheet}
              activeOpacity={1}
              onPress={() => {}}
            >
              <View style={s.modalHandle} />

              <Text style={s.modalTitle}>TODAY'S PLAN</Text>
              <Text style={s.modalFocus}>{todayPlan?.focus}</Text>

              <View style={s.modalExList}>
                {todayPlan?.exercises.map((ex, i) => (
                  <View key={i} style={s.modalExRow}>
                    <Text style={s.modalExNum}>
                      {String(i + 1).padStart(2, "0")}
                    </Text>
                    <Text style={s.modalExName}>{ex.name}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={s.modalPrimaryBtn}
                onPress={handleStartWithPlan}
              >
                <Text style={s.modalPrimaryBtnText}>
                  START WITH TODAY'S PLAN
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.modalSecondaryBtn}
                onPress={handleStartBlank}
              >
                <Text style={s.modalSecondaryBtnText}>START BLANK SESSION</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
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
    modalOverlay: {
      flex: 1,
      backgroundColor: "#000000cc",
      justifyContent: "flex-end",
    },
    modalSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      paddingBottom: 40,
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 20,
    },
    modalTitle: {
      fontFamily: fonts.display,
      fontSize: 14,
      color: colors.muted,
      letterSpacing: 2,
      marginBottom: 4,
    },
    modalFocus: {
      fontFamily: fonts.display,
      fontSize: 28,
      color: colors.text,
      letterSpacing: 1,
      marginBottom: 20,
    },
    modalExList: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 14,
      marginBottom: 20,
      gap: 10,
    },
    modalExRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    modalExNum: {
      fontFamily: fonts.mono,
      fontSize: 11,
      color: colors.muted,
      minWidth: 24,
    },
    modalExName: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.text,
    },
    modalPrimaryBtn: {
      backgroundColor: colors.amber,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      marginBottom: 10,
    },
    modalPrimaryBtnText: {
      fontFamily: fonts.display,
      fontSize: 18,
      color: colors.background,
      letterSpacing: 1,
    },
    modalSecondaryBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 14,
      alignItems: "center",
    },
    modalSecondaryBtnText: {
      fontFamily: fonts.display,
      fontSize: 16,
      color: colors.muted,
      letterSpacing: 1,
    },
  });
}
