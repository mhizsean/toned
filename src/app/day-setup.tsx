import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useState, useEffect, useMemo } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { fonts, ColorScheme } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { DayType, PlannedScheduleExercise } from "../types";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useWorkoutStore } from "../store/workoutStore";
import { EXERCISE_CATALOGUE } from "../data/exerciseCatalogue";

const DAY_TYPES: { label: string; value: DayType }[] = [
  { label: "🏋🏽 Gym", value: "gym" },
  { label: "🏠 Home", value: "home" },
  { label: "😴 Rest", value: "rest" },
];

const FOCUS_OPTIONS = [
  "🍑 Glutes & Legs",
  "💪 Upper Body",
  "🧘 Core & Posture",
  "🔥 Full Body",
  "💆 Active Recovery",
];

export default function DaySetupScreen() {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { day } = useLocalSearchParams<{ day: string }>();
  const { libraryExercises, weeklySchedule, saveDaySchedule } =
    useWorkoutStore();

  const existing = weeklySchedule[day];

  const [isEditing, setIsEditing] = useState(!existing);
  const [type, setType] = useState<DayType>(existing?.type || "gym");
  const [focus, setFocus] = useState(existing?.focus || "");
  const [showFocusPicker, setShowFocusPicker] = useState(false);
  const [exercises, setExercises] = useState<PlannedScheduleExercise[]>(
    existing?.exercises || [],
  );
  const [showExPicker, setShowExPicker] = useState(false);

  const [originalType, setOriginalType] = useState<DayType>(
    existing?.type || "gym",
  );
  const [originalFocus, setOriginalFocus] = useState(existing?.focus || "");
  const [originalExercises, setOriginalExercises] = useState<
    PlannedScheduleExercise[]
  >(existing?.exercises || []);

  // strip emoji from focus to match catalogue category
  const focusCategory = focus.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();

  const filteredExercises = EXERCISE_CATALOGUE.filter(
    (ex) => ex.category === focusCategory && libraryExercises.includes(ex.name),
  );

  useEffect(() => {
    const e = weeklySchedule[day];
    setIsEditing(!e);
    setType(e?.type || "gym");
    setFocus(e?.focus || "");
    setExercises(e?.exercises || []);
    setOriginalType(e?.type || "gym");
    setOriginalFocus(e?.focus || "");
    setOriginalExercises(e?.exercises || []);
    setShowFocusPicker(false);
    setShowExPicker(false);
  }, [day]);

  const hasChanges =
    type !== originalType ||
    focus !== originalFocus ||
    JSON.stringify(exercises) !== JSON.stringify(originalExercises);

  const isRest = type === "rest";

  const addExercise = (name: string) => {
    if (exercises.find((e) => e.name === name)) return;
    setExercises((prev) => [...prev, { name, sets: 0, reps: "" }]);
    setShowExPicker(false);
  };

  const updateExercise = (
    index: number,
    field: "sets" | "reps",
    value: string,
  ) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== index
          ? ex
          : { ...ex, [field]: field === "sets" ? parseInt(value) || 0 : value },
      ),
    );
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!isRest && !focus) {
      Alert.alert("Missing Focus", "Please select a focus for this day.");
      return;
    }
    saveDaySchedule(day, {
      type,
      focus: isRest ? "Rest Day" : focus,
      exercises: isRest ? [] : exercises,
    });
    setOriginalType(type);
    setOriginalFocus(focus);
    setOriginalExercises(exercises);
    setIsEditing(false);
    router.navigate("/plan");
  };

  const handleBack = () => {
    if (isEditing && hasChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.navigate("/plan"),
          },
        ],
      );
    } else {
      router.navigate("/plan");
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={s.back}>← BACK</Text>
          </TouchableOpacity>
          <Text style={s.title}>{day.toUpperCase()}</Text>

          {isEditing ? (
            <TouchableOpacity
              onPress={handleSave}
              disabled={!!existing && !hasChanges}
            >
              <Text
                style={[s.save, !!existing && !hasChanges && s.saveDisabled]}
              >
                SAVE
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={s.edit}>EDIT</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          {/* Day type */}
          <Text style={s.sectionLabel}>DAY TYPE</Text>
          <View style={s.typeRow}>
            {DAY_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[s.typeBtn, type === t.value && s.typeBtnActive]}
                onPress={() => isEditing && setType(t.value)}
                activeOpacity={isEditing ? 0.7 : 1}
              >
                <Text
                  style={[
                    s.typeBtnText,
                    type === t.value && s.typeBtnTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {!isRest && (
            <>
              {/* Focus */}
              <Text style={s.sectionLabel}>FOCUS</Text>
              <TouchableOpacity
                style={s.focusBtn}
                onPress={() =>
                  isEditing && setShowFocusPicker(!showFocusPicker)
                }
                activeOpacity={isEditing ? 0.7 : 1}
              >
                <Text style={[s.focusBtnText, !focus && s.placeholder]}>
                  {focus || "Select focus..."}
                </Text>
                {isEditing && (
                  <Text style={s.chevron}>{showFocusPicker ? "▲" : "▼"}</Text>
                )}
              </TouchableOpacity>

              {showFocusPicker && isEditing && (
                <View style={s.focusDropdown}>
                  {FOCUS_OPTIONS.map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[
                        s.focusOption,
                        focus === f && s.focusOptionActive,
                      ]}
                      onPress={() => {
                        setFocus(f);
                        setShowFocusPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          s.focusOptionText,
                          focus === f && s.focusOptionTextActive,
                        ]}
                      >
                        {f}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Exercises */}
              <Text style={s.sectionLabel}>EXERCISES</Text>

              {exercises.length === 0 && (
                <View style={s.exEmpty}>
                  <Text style={s.exEmptyText}>No exercises added yet</Text>
                </View>
              )}

              {exercises.map((ex, i) => (
                <View key={i} style={s.exCard}>
                  <View style={s.exCardTop}>
                    <Text style={s.exName}>{ex.name}</Text>
                    {isEditing && (
                      <TouchableOpacity onPress={() => removeExercise(i)}>
                        <Text style={s.exRemove}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={s.exInputRow}>
                    <View style={s.exInputWrap}>
                      <Text style={s.exInputLabel}>SETS</Text>
                      <TextInput
                        style={[s.exInput, !isEditing && s.exInputDisabled]}
                        value={String(ex.sets)}
                        keyboardType="numeric"
                        onChangeText={(v) => updateExercise(i, "sets", v)}
                        placeholderTextColor={colors.muted}
                        editable={isEditing}
                      />
                    </View>
                    <View style={s.exInputWrap}>
                      <Text style={s.exInputLabel}>REPS</Text>
                      <TextInput
                        style={[s.exInput, !isEditing && s.exInputDisabled]}
                        value={ex.reps}
                        onChangeText={(v) => updateExercise(i, "reps", v)}
                        placeholderTextColor={colors.muted}
                        placeholder="e.g. 10-12"
                        editable={isEditing}
                      />
                    </View>
                  </View>
                </View>
              ))}

              {isEditing && (
                <TouchableOpacity
                  style={s.addExBtn}
                  onPress={() => setShowExPicker(!showExPicker)}
                >
                  <Text style={s.addExBtnText}>+ ADD EXERCISE</Text>
                </TouchableOpacity>
              )}

              {showExPicker && isEditing && (
                <View style={s.exPicker}>
                  {filteredExercises.length === 0 ? (
                    <Text style={s.exPickerEmpty}>
                      {libraryExercises.length === 0
                        ? "No exercises in your library yet. Add some in the Library tab first."
                        : focus
                          ? "No library exercises match this focus. Add relevant exercises in the Library tab."
                          : "Select a focus first to see matching exercises."}
                    </Text>
                  ) : (
                    filteredExercises.map((ex) => {
                      const added = exercises.find((e) => e.name === ex.name);
                      return (
                        <TouchableOpacity
                          key={ex.name}
                          style={[s.exPickerItem, added && s.exPickerItemAdded]}
                          onPress={() => !added && addExercise(ex.name)}
                        >
                          <Text
                            style={[
                              s.exPickerItemText,
                              added && s.exPickerItemTextAdded,
                            ]}
                          >
                            {added ? "✓ " : ""}
                            {ex.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              )}
            </>
          )}

          {isRest && (
            <View style={s.restCard}>
              <Text style={s.restEmoji}>😴</Text>
              <Text style={s.restTitle}>REST DAY</Text>
              <Text style={s.restSub}>
                Recovery is part of the process. Walk, stretch, sleep well.
              </Text>
            </View>
          )}
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
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      paddingBottom: 8,
    },
    back: {
      fontFamily: fonts.display,
      fontSize: 14,
      color: colors.muted,
      letterSpacing: 1,
    },
    title: {
      fontFamily: fonts.display,
      fontSize: 24,
      color: colors.text,
      letterSpacing: 2,
    },
    save: {
      fontFamily: fonts.display,
      fontSize: 16,
      color: colors.amber,
      letterSpacing: 1,
    },
    saveDisabled: {
      color: colors.muted,
      opacity: 0.4,
    },
    edit: {
      fontFamily: fonts.display,
      fontSize: 16,
      color: colors.amber,
      letterSpacing: 1,
    },
    scroll: {
      padding: 20,
      paddingTop: 10,
    },
    sectionLabel: {
      fontFamily: fonts.body,
      fontSize: 10,
      color: colors.muted,
      letterSpacing: 2,
      marginBottom: 8,
      marginTop: 20,
    },
    typeRow: {
      flexDirection: "row",
      gap: 8,
    },
    typeBtn: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
      alignItems: "center",
    },
    typeBtnActive: {
      backgroundColor: colors.amber + "22",
      borderColor: colors.amber + "66",
    },
    typeBtnText: {
      fontFamily: fonts.body,
      fontSize: 12,
      color: colors.muted,
    },
    typeBtnTextActive: {
      color: colors.amber,
    },
    focusBtn: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    focusBtnText: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.text,
    },
    placeholder: {
      color: colors.muted,
    },
    chevron: {
      color: colors.muted,
      fontSize: 10,
    },
    focusDropdown: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginTop: 4,
      overflow: "hidden",
    },
    focusOption: {
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    focusOptionActive: {
      backgroundColor: colors.amber + "22",
    },
    focusOptionText: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.muted,
    },
    focusOptionTextActive: {
      color: colors.amber,
    },
    exEmpty: {
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    exEmptyText: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.muted,
    },
    exCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 14,
      marginBottom: 8,
    },
    exCardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    exName: {
      fontFamily: fonts.bodyMedium,
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    exRemove: {
      color: colors.muted,
      fontSize: 14,
    },
    exInputRow: {
      flexDirection: "row",
      gap: 12,
    },
    exInputWrap: {
      flex: 1,
    },
    exInputLabel: {
      fontFamily: fonts.body,
      fontSize: 9,
      color: colors.muted,
      letterSpacing: 1,
      marginBottom: 6,
    },
    exInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      padding: 10,
      fontFamily: fonts.mono,
      fontSize: 14,
      color: colors.text,
      textAlign: "center",
    },
    exInputDisabled: {
      opacity: 0.5,
    },
    addExBtn: {
      borderWidth: 1,
      borderColor: colors.amber + "66",
      borderRadius: 8,
      padding: 14,
      alignItems: "center",
      marginTop: 4,
    },
    addExBtnText: {
      fontFamily: fonts.display,
      fontSize: 16,
      color: colors.amber,
      letterSpacing: 1,
    },
    exPicker: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginTop: 8,
      overflow: "hidden",
    },
    exPickerEmpty: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.muted,
      padding: 16,
      textAlign: "center",
      lineHeight: 20,
    },
    exPickerItem: {
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    exPickerItemAdded: {
      backgroundColor: colors.amber + "11",
    },
    exPickerItemText: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.text,
    },
    exPickerItemTextAdded: {
      color: colors.amber,
    },
    restCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 30,
      alignItems: "center",
      marginTop: 20,
    },
    restEmoji: {
      fontSize: 40,
      marginBottom: 12,
    },
    restTitle: {
      fontFamily: fonts.display,
      fontSize: 24,
      color: colors.muted,
      letterSpacing: 2,
      marginBottom: 8,
    },
    restSub: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.muted,
      textAlign: "center",
      lineHeight: 20,
    },
  });
}
