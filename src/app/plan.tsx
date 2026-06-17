import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useMemo, useState } from "react";
import { ColorScheme, fonts } from "../constants/theme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { EXERCISE_CATALOGUE } from "../data/exerciseCatalogue";
import { DAYS, TODAY, getTypeBadge } from "../constants/planning";
import { useWorkoutStore } from "../store/workoutStore";
import AddExerciseSheet from "../components/AddExerciseSheet";
import { router } from "expo-router";
import { useTheme } from "../context/ThemeContext";

export default function PlanScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [tab, setTab] = useState<"schedule" | "library">("schedule");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const { libraryExercises, weeklySchedule } = useWorkoutStore();
  const typeBadge = getTypeBadge(colors);

  const libByCategory = EXERCISE_CATALOGUE.reduce(
    (acc, ex) => {
      if (libraryExercises.includes(ex.name)) {
        if (!acc[ex.category]) acc[ex.category] = [];
        acc[ex.category].push(ex.name);
      }
      return acc;
    },
    {} as Record<string, string[]>,
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>TONED</Text>
          <Text style={styles.sub}>YOUR PLAN</Text>
        </View>
        {/* tabs */}
        <View style={styles.tabs}>
          {(["schedule", "library"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <Text
                style={[styles.tabLabel, tab === t && styles.tabLabelActive]}
              >
                {t === "schedule" ? "SCHEDULE" : "LIBRARY"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* schedule tab */}
        {tab === "schedule" && (
          <View>
            {DAYS.map((day) => {
              const schedule = weeklySchedule[day];
              const isToday = day === TODAY;

              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayCard, isToday && styles.dayCardToday]}
                  onPress={() =>
                    router.push({ pathname: "/day-setup", params: { day } })
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.dayCardLeft}>
                    <View style={styles.dayLabelRow}>
                      <Text
                        style={[styles.dayName, isToday && styles.dayNameToday]}
                      >
                        {day}
                      </Text>
                      {isToday && (
                        <View style={styles.todayBadge}>
                          <Text style={styles.todayBadgeText}>TODAY</Text>
                        </View>
                      )}
                    </View>

                    {schedule ? (
                      <>
                        <Text style={styles.dayFocus}>{schedule.focus}</Text>
                        {schedule.type !== "rest" &&
                          schedule.exercises.length > 0 && (
                            <View style={styles.exTagRow}>
                              {schedule.exercises.slice(0, 3).map((ex, i) => (
                                <View key={i} style={styles.exTag}>
                                  <Text style={styles.exTagText}>
                                    {ex.name}
                                  </Text>
                                </View>
                              ))}
                              {schedule.exercises.length > 3 && (
                                <View style={styles.exTag}>
                                  <Text style={styles.exTagText}>
                                    +{schedule.exercises.length - 3} more
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}
                      </>
                    ) : (
                      <Text style={styles.dayEmpty}>
                        Tap to set up this day
                      </Text>
                    )}
                  </View>

                  <View style={styles.dayCardRight}>
                    {schedule && (
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            borderColor: typeBadge[schedule.type].color + "44",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeBadgeText,
                            { color: typeBadge[schedule.type].color },
                          ]}
                        >
                          {typeBadge[schedule.type].label}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.dayChevron}>›</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* library tab */}
        {tab === "library" && (
          <View style={styles.libWrap}>
            {libraryExercises.length === 0 ? (
              <View style={styles.libEmpty}>
                <Text style={styles.libEmptyTitle}>NO EXERCISES YET</Text>
                <Text style={styles.libEmptySub}>
                  Build your own library to use when logging sessions
                </Text>
              </View>
            ) : (
              Object.entries(libByCategory).map(([cat, exs]) => {
                const open = expandedCat === cat;
                return (
                  <View key={cat} style={styles.catCard}>
                    <TouchableOpacity
                      onPress={() => setExpandedCat(open ? null : cat)}
                      style={styles.catHeader}
                    >
                      <Text style={styles.catTitle}>{cat}</Text>
                      <Text style={styles.catCount}>
                        {open
                          ? "▲"
                          : `${exs.length} exercise${exs.length !== 1 ? "s" : ""} ▼`}
                      </Text>
                    </TouchableOpacity>
                    {open && (
                      <View style={styles.catBody}>
                        {exs.map((ex, i) => (
                          <View key={i} style={styles.libExRow}>
                            <Text style={styles.libExName}>{ex}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            )}

            <TouchableOpacity
              style={styles.addExercisesBtn}
              onPress={() => setShowAddSheet(true)}
            >
              <Text style={styles.addExercisesBtnText}>+ ADD EXERCISES</Text>
            </TouchableOpacity>
          </View>
        )}

        <AddExerciseSheet
          visible={showAddSheet}
          onClose={() => setShowAddSheet(false)}
        />
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
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
    },
    wordmark: {
      fontFamily: fonts.display,
      fontSize: 38,
      color: colors.amber,
      letterSpacing: 4,
      lineHeight: 40,
    },
    sub: {
      fontFamily: fonts.mono,
      fontSize: 10,
      color: colors.muted,
      letterSpacing: 3,
      marginTop: 2,
    },
    tabs: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderColor: colors.border,
      marginHorizontal: 20,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      borderBottomWidth: 2,
      borderColor: "transparent",
    },
    tabActive: {
      borderColor: colors.amber,
    },
    tabLabel: {
      fontFamily: fonts.display,
      fontSize: 14,
      color: colors.muted,
      letterSpacing: 1,
    },
    tabLabelActive: {
      color: colors.amber,
    },
    scroll: {
      padding: 20,
      paddingBottom: 60,
    },
    dayRow: {
      marginBottom: 16,
      marginHorizontal: -4,
      maxHeight: 45,
    },
    dayPill: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.surface,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      minWidth: 56,
    },
    dayPillActive: {
      backgroundColor: colors.amber,
      borderColor: colors.amber,
    },
    dayPillRest: {
      opacity: 0.5,
    },
    dayPillText: {
      fontFamily: fonts.display,
      fontSize: 14,
      color: colors.muted,
      letterSpacing: 1,
    },
    dayPillTextActive: {
      color: colors.background,
    },
    todayDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.amber,
      marginTop: 3,
    },
    todayDotActive: {
      backgroundColor: colors.background,
    },
    badge: {
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    badgeText: {
      fontFamily: fonts.body,
      fontSize: 12,
      fontWeight: "500",
    },
    restText: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.muted,
      lineHeight: 22,
    },
    exList: {
      gap: 14,
    },
    exRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    exLeft: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      flex: 1,
    },
    exNum: {
      fontFamily: fonts.mono,
      fontSize: 11,
      color: colors.muted,
      minWidth: 24,
      marginTop: 2,
    },
    exName: {
      fontFamily: fonts.bodyMedium,
      fontSize: 14,
      color: colors.text,
    },
    exNote: {
      fontFamily: fonts.body,
      fontSize: 11,
      color: colors.muted,
      marginTop: 2,
    },
    exSets: {
      fontFamily: fonts.mono,
      fontSize: 12,
      color: colors.amber,
    },
    libWrap: {
      gap: 10,
    },
    catCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    catHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
    },
    catTitle: {
      fontFamily: fonts.bodyMedium,
      fontSize: 14,
      color: colors.text,
    },
    catCount: {
      fontFamily: fonts.body,
      fontSize: 11,
      color: colors.muted,
    },
    catBody: {
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    libExRow: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    libExName: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.muted,
    },
    libEmpty: {
      alignItems: "center",
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    libEmptyTitle: {
      fontFamily: fonts.display,
      fontSize: 24,
      color: colors.border,
      letterSpacing: 2,
      marginBottom: 8,
    },
    libEmptySub: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.muted,
      textAlign: "center",
      lineHeight: 20,
    },
    addExercisesBtn: {
      borderWidth: 1,
      borderColor: colors.amber + "66",
      borderRadius: 8,
      padding: 14,
      alignItems: "center",
      marginTop: 8,
    },
    addExercisesBtnText: {
      fontFamily: fonts.display,
      fontSize: 16,
      color: colors.amber,
      letterSpacing: 1,
    },
    dayCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 14,
      marginBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dayCardToday: {
      borderColor: colors.amber + "55",
    },
    dayCardLeft: {
      flex: 1,
    },
    dayLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    dayName: {
      fontFamily: fonts.display,
      fontSize: 22,
      color: colors.text,
      letterSpacing: 1,
    },
    dayNameToday: {
      color: colors.amber,
    },
    todayBadge: {
      backgroundColor: colors.amber + "22",
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    todayBadgeText: {
      fontFamily: fonts.body,
      fontSize: 9,
      color: colors.amber,
      letterSpacing: 1,
    },
    dayFocus: {
      fontFamily: fonts.body,
      fontSize: 12,
      color: colors.muted,
      marginBottom: 6,
    },
    dayEmpty: {
      fontFamily: fonts.body,
      fontSize: 12,
      color: colors.muted,
    },
    exTagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
    },
    exTag: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    exTagText: {
      fontFamily: fonts.body,
      fontSize: 9,
      color: colors.muted,
    },
    dayCardRight: {
      alignItems: "flex-end",
      gap: 8,
    },
    typeBadge: {
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    typeBadgeText: {
      fontFamily: fonts.body,
      fontSize: 11,
    },
    dayChevron: {
      color: colors.muted,
      fontSize: 20,
    },
  });
}
