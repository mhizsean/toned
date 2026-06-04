import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { colors, fonts } from "../constants/theme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { DayPlan, EXERCISE_CATEGORIES, weeklyPlan } from "../data/plans";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const TODAY = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

const TYPE_BADGE: Record<DayPlan["type"], { label: string; color: string }> = {
  gym: { label: "🏋🏽 Gym", color: colors.amber },
  home: { label: "🏠 Home", color: "#60a5fa" },
  rest: { label: "😴 Rest", color: colors.muted },
};

export default function PlanScreen() {
  const [tab, setTab] = useState<"schedule" | "library">("schedule");
  const [selectedDay, setSelectedDay] = useState<DayPlan["day"]>(TODAY);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const dayPlan = weeklyPlan.find((d) => d.day === selectedDay)!;
  const badge = TYPE_BADGE[dayPlan.type];

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
                {tab === "schedule" ? "SCHEDULE" : "LIBRARY"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* schedule tab */}
        {tab === "schedule" && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dayRow}
            >
              {DAYS.map((day) => {
                const plan = weeklyPlan.find((plan) => plan.day === day)!;
                const isSelected = day === selectedDay;
                const isToday = day === TODAY;

                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => setSelectedDay(day)}
                    style={[
                      styles.dayPill,
                      isSelected && styles.dayPillActive,
                      plan.type === "rest" && styles.dayPillRest,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayPillText,
                        isSelected && styles.dayPillTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                    {isToday && (
                      <View
                        style={[
                          styles.todayDot,
                          isSelected && styles.todayDotActive,
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.dayCard}>
              <View style={styles.dayCardTop}>
                <View>
                  <Text style={styles.dayName}>{selectedDay}</Text>
                  <Text style={styles.dayFocus}>{dayPlan.focus}</Text>
                </View>

                <View
                  style={[
                    styles.badge,
                    { backgroundColor: badge.color + "44" },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: badge.color }]}>
                    {badge.label}
                  </Text>
                </View>
              </View>

              {dayPlan.type === "rest" ? (
                <Text style={styles.restText}>
                  Take time to rest and recover!
                </Text>
              ) : (
                <View style={styles.exList}>
                  {dayPlan.exercises.map((ex, i) => (
                    <View key={i} style={styles.exRow}>
                      <View style={styles.exLeft}>
                        <Text style={styles.exNum}>
                          {String(i + 1).padStart(2, "0")}
                        </Text>
                        <View>
                          <Text style={styles.exName}>{ex.name}</Text>

                          {ex.note && (
                            <Text style={styles.exNote}>{ex.note}</Text>
                          )}
                        </View>
                      </View>
                      <Text style={styles.exSets}>
                        {ex.sets} sets x {ex.reps} reps
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* library tab */}
        {tab === "library" && (
          <View style={styles.libWrap}>
            {Object.entries(EXERCISE_CATEGORIES).map(
              ([category, exercises]) => {
                const open = expandedCat === category;
                return (
                  <View key={category} style={styles.catCard}>
                    <TouchableOpacity
                      style={styles.catHeader}
                      onPress={() => setExpandedCat(open ? null : category)}
                    >
                      <Text style={styles.catTitle}>{category}</Text>
                      <Text style={styles.catCount}>
                        {open ? "▲" : `${exercises.length} exercises ▼`}
                      </Text>
                    </TouchableOpacity>
                    {open && (
                      <View style={styles.catBody}>
                        {exercises.map((ex, i) => (
                          <View style={styles.libExRow} key={i}>
                            <Text style={styles.libExName}>{ex}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              },
            )}
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: 70,
  },
  dayPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
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
  dayCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  dayCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  dayName: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.text,
    letterSpacing: 2,
    lineHeight: 38,
  },
  dayFocus: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
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
});
