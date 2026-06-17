import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useState, useEffect, useMemo } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { fonts, ColorScheme } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { DayType, PlannedScheduleExercise } from "../types";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWorkoutStore } from "../store/workoutStore";
import { EXERCISE_CATALOGUE } from "../data/exerciseCatalogue";
import {
  ExerciseCategory,
  EXERCISE_CATEGORIES,
  getCategoryDisplayLabel,
  getScheduleFocuses,
  toggleFocus,
} from "../data/exerciseTypes";
import ExerciseInfoButton from "../components/ExerciseInfoButton";
import RemoveButton from "../components/RemoveButton";
import ExerciseInfoSheet from "../components/ExerciseInfoSheet";
import { useExerciseInfoSheet } from "../hooks/useExerciseInfoSheet";
import { confirmDestructive } from "../utils/alerts";
import { filterPlannedExercisesByFocuses } from "../utils/exerciseCatalogue";

const DAY_TYPES: { label: string; value: DayType }[] = [
  { label: "🏋🏽 Gym", value: "gym" },
  { label: "🏠 Home", value: "home" },
  { label: "😴 Rest", value: "rest" },
];

export default function DaySetupScreen() {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { day } = useLocalSearchParams<{ day: string }>();
  const { libraryExercises, weeklySchedule, saveDaySchedule, scheduleLoaded } =
    useWorkoutStore();
  const { exerciseName, openInfo, closeInfo } = useExerciseInfoSheet();

  const existing = weeklySchedule[day];

  const [isEditing, setIsEditing] = useState(!existing);
  const [type, setType] = useState<DayType>(existing?.type || "gym");
  const [focuses, setFocuses] = useState<ExerciseCategory[]>(
    getScheduleFocuses(existing),
  );
  const [showFocusPicker, setShowFocusPicker] = useState(false);
  const [exercises, setExercises] = useState<PlannedScheduleExercise[]>(
    existing?.exercises || [],
  );
  const [showExPicker, setShowExPicker] = useState(false);

  const [originalType, setOriginalType] = useState<DayType>(
    existing?.type || "gym",
  );
  const [originalFocuses, setOriginalFocuses] = useState<ExerciseCategory[]>(
    getScheduleFocuses(existing),
  );
  const [originalExercises, setOriginalExercises] = useState<
    PlannedScheduleExercise[]
  >(existing?.exercises || []);

  const filteredExercises = EXERCISE_CATALOGUE.filter(
    (ex) => focuses.includes(ex.category) && libraryExercises.includes(ex.name),
  );

  useEffect(() => {
    const e = weeklySchedule[day];
    setIsEditing(!e);
    setType(e?.type || "gym");
    setFocuses(getScheduleFocuses(e));
    setExercises(e?.exercises || []);
    setOriginalType(e?.type || "gym");
    setOriginalFocuses(getScheduleFocuses(e));
    setOriginalExercises(e?.exercises || []);
    setShowFocusPicker(false);
    setShowExPicker(false);
  }, [day, weeklySchedule]);

  const hasChanges =
    type !== originalType ||
    JSON.stringify([...focuses].sort()) !==
      JSON.stringify([...originalFocuses].sort()) ||
    JSON.stringify(exercises) !== JSON.stringify(originalExercises);

  const isRest = type === "rest";
  const canAddExercises = isEditing && focuses.length > 0;

  const applyFocusChange = (nextFocuses: ExerciseCategory[]) => {
    setFocuses(nextFocuses);
    setExercises((prev) => filterPlannedExercisesByFocuses(prev, nextFocuses));
    if (nextFocuses.length === 0) setShowExPicker(false);
  };

  const addExercise = (name: string) => {
    if (exercises.find((e) => e.name === name)) return;
    setExercises((prev) => [...prev, { name }]);
    setShowExPicker(false);
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!scheduleLoaded) return;
    if (!isRest && focuses.length === 0) {
      Alert.alert(
        "Missing Focus",
        "Please select at least one focus for this day.",
      );
      return;
    }
    saveDaySchedule(day, {
      type,
      focuses: isRest ? [] : focuses,
      exercises: isRest ? [] : exercises,
    });
    setOriginalType(type);
    setOriginalFocuses(focuses);
    setOriginalExercises(exercises);
    setIsEditing(false);
    router.navigate("/plan");
  };

  const handleBack = () => {
    if (isEditing && hasChanges) {
      confirmDestructive({
        title: "Unsaved Changes",
        message: "You have unsaved changes. Are you sure you want to go back?",
        confirmLabel: "Discard",
        cancelLabel: "Stay",
        onConfirm: () => router.navigate("/plan"),
      });
    } else {
      router.navigate("/plan");
    }
  };

  if (!scheduleLoaded) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loading}>
          <Text style={s.loadingText}>LOADING…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
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
          <Text style={s.sectionLabel}>DAY TYPE</Text>
          <View style={s.typeRow}>
            {DAY_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[s.typeBtn, type === t.value && s.typeBtnActive]}
                onPress={() => {
                  if (!isEditing) return;
                  setType(t.value);
                  if (t.value === "rest") {
                    setFocuses([]);
                    setExercises([]);
                    setShowExPicker(false);
                  }
                }}
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
              <Text style={s.sectionLabel}>FOCUS · SELECT ONE OR MORE</Text>

              {focuses.length > 0 && (
                <View style={s.focusChipRow}>
                  {focuses.map((f) => (
                    <View key={f} style={s.focusChip}>
                      <Text style={s.focusChipText}>
                        {getCategoryDisplayLabel(f)}
                      </Text>
                      {isEditing && (
                        <TouchableOpacity
                          onPress={() =>
                            applyFocusChange(toggleFocus(focuses, f))
                          }
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={s.focusChipRemove}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {isEditing && (
                <TouchableOpacity
                  style={s.focusBtn}
                  onPress={() => setShowFocusPicker(!showFocusPicker)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      s.focusBtnText,
                      focuses.length === 0 && s.placeholder,
                    ]}
                  >
                    {focuses.length === 0
                      ? "Select focus areas..."
                      : "Add or change focus"}
                  </Text>
                  <Text style={s.chevron}>{showFocusPicker ? "▲" : "▼"}</Text>
                </TouchableOpacity>
              )}

              {!isEditing && focuses.length === 0 && (
                <Text style={s.focusEmpty}>No focus set</Text>
              )}

              {showFocusPicker && isEditing && (
                <View style={s.focusDropdown}>
                  {EXERCISE_CATEGORIES.map((cat) => {
                    const selected = focuses.includes(cat);
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[s.focusOption, selected && s.focusOptionActive]}
                        onPress={() =>
                          applyFocusChange(toggleFocus(focuses, cat))
                        }
                      >
                        <Text
                          style={[
                            s.focusOptionText,
                            selected && s.focusOptionTextActive,
                          ]}
                        >
                          {getCategoryDisplayLabel(cat)}
                        </Text>
                        {selected && <Text style={s.focusCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    style={s.focusDone}
                    onPress={() => setShowFocusPicker(false)}
                  >
                    <Text style={s.focusDoneText}>DONE</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={s.sectionLabel}>EXERCISES</Text>

              {exercises.length === 0 && (
                <View style={s.exEmpty}>
                  <Text style={s.exEmptyText}>
                    {focuses.length === 0
                      ? "Select focus areas above to start adding exercises"
                      : "No exercises added yet"}
                  </Text>
                </View>
              )}
              {exercises.map((ex, i) => (
                <View key={ex.name} style={s.exCard}>
                  <View style={s.exCardTop}>
                    <Text style={s.exName}>{ex.name}</Text>
                    <View style={s.exCardTopRight}>
                      <ExerciseInfoButton onPress={() => openInfo(ex.name)} />
                      {isEditing && (
                        <RemoveButton onPress={() => removeExercise(i)} />
                      )}
                    </View>
                  </View>
                </View>
              ))}

              {canAddExercises && (
                <TouchableOpacity
                  style={s.addExBtn}
                  onPress={() => setShowExPicker(!showExPicker)}
                >
                  <Text style={s.addExBtnText}>+ ADD EXERCISE</Text>
                </TouchableOpacity>
              )}

              {showExPicker && canAddExercises && (
                <View style={s.exPicker}>
                  {filteredExercises.length === 0 ? (
                    <Text style={s.exPickerEmpty}>
                      {libraryExercises.length === 0
                        ? "No exercises in your library yet. Add some in the Library tab first."
                        : focuses.length === 0
                          ? "Select at least one focus to see matching exercises."
                          : "No library exercises match your selected focus areas. Add relevant exercises in the Library tab."}
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

        <ExerciseInfoSheet exerciseName={exerciseName} onClose={closeInfo} />
    </SafeAreaView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loading: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      fontFamily: fonts.mono,
      fontSize: 11,
      color: colors.muted,
      letterSpacing: 2,
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
      marginTop: 8,
    },
    focusChipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: 4,
    },
    focusChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.amber + "22",
      borderWidth: 1,
      borderColor: colors.amber + "66",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    focusChipText: {
      fontFamily: fonts.body,
      fontSize: 12,
      color: colors.amber,
    },
    focusChipRemove: {
      color: colors.muted,
      fontSize: 12,
    },
    focusEmpty: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.muted,
      paddingVertical: 8,
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
    focusCheck: {
      color: colors.amber,
      fontSize: 14,
      fontFamily: fonts.bodyMedium,
    },
    focusDone: {
      padding: 14,
      alignItems: "center",
      backgroundColor: colors.amber + "11",
    },
    focusDoneText: {
      fontFamily: fonts.display,
      fontSize: 14,
      color: colors.amber,
      letterSpacing: 1,
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
    exCardTopRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
  });
}
