import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { ColorScheme, fonts } from "../constants/theme";
import { useWorkoutStore } from "../store/workoutStore";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ExercisePicker from "../components/ExercisePicker";
import { useTheme } from "../context/ThemeContext";
import { useMemo } from "react";
import ExerciseInfoButton from "../components/ExerciseInfoButton";
import RemoveButton from "../components/RemoveButton";
import ExerciseInfoSheet from "../components/ExerciseInfoSheet";
import { useExerciseInfoSheet } from "../hooks/useExerciseInfoSheet";
import { pluralize } from "../utils/text";
import { formatSet, getTopWeight } from "../utils/formatWorkout";
import {
  findExercise,
  getRepInputPlaceholder,
  isTimedExercise,
} from "../utils/exerciseCatalogue";

export default function SessionScreen() {
  const {
    activeSession,
    addExercise,
    addSet,
    removeSet,
    finishSession,
    discardSession,
    libraryExercises,
  } = useWorkoutStore();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { exerciseName, openInfo, closeInfo } = useExerciseInfoSheet();
  const [expandedEx, setExpandedEx] = useState<number | null>(null);
  const [inputs, setInputs] = useState<
    Record<number, { w: string; r: string }>
  >({});
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!activeSession) {
      router.replace("/");
      return;
    }
  }, [activeSession]);

  if (!activeSession) {
    return null;
  }

  const handleAddSet = (exIdx: number) => {
    const exerciseInfo = findExercise(activeSession.exercises[exIdx].name);
    const timed = isTimedExercise(exerciseInfo);
    const { w, r } = inputs[exIdx] || {};
    if (!r) return;
    if (!timed && !w) return;
    addSet(exIdx, {
      weight: timed ? 0 : parseFloat(w),
      reps: parseInt(r),
    });
    setInputs((prev) => ({ ...prev, [exIdx]: { w: "", r: "" } }));
  };

  const handleFinish = () => {
    finishSession();
    router.replace("/");
  };

  const handleDiscard = () => {
    discardSession();
    router.replace("/");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>SESSION</Text>
            <Text style={s.sub}>
              {pluralize(activeSession.exercises.length, "exercise")} logged
            </Text>
          </View>
          <TouchableOpacity onPress={handleDiscard}>
            <Text style={s.discard}>DISCARD</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          {activeSession.exercises.map((ex, exIdx) => {
            const isOpen = expandedEx === exIdx;
            const inp = inputs[exIdx] || { w: "", r: "" };
            const exerciseInfo = findExercise(ex.name);
            const timed = isTimedExercise(exerciseInfo);
            const repLabel = exerciseInfo?.repLabel;
            const sessionMax = timed
              ? ex.sets.length
                ? Math.max(...ex.sets.map((set) => set.reps))
                : null
              : getTopWeight(ex.sets);

            return (
              <View
                key={`${ex.name}-${exIdx}`}
                style={[s.exCard, isOpen && s.exCardOpen]}
              >
                <View style={s.exCardHeader}>
                  <TouchableOpacity
                    style={s.exCardHeaderLeft}
                    onPress={() => setExpandedEx(isOpen ? null : exIdx)}
                  >
                    <Text style={s.exName}>{ex.name}</Text>
                    <Text style={s.exMeta}>
                      {ex.sets.length > 0
                        ? timed
                          ? `${pluralize(ex.sets.length, "set")} · top ${sessionMax}s`
                          : `${pluralize(ex.sets.length, "set")} · top ${sessionMax}kg`
                        : "No sets yet"}
                    </Text>
                  </TouchableOpacity>
                  <View style={s.exCardHeaderRight}>
                    <ExerciseInfoButton onPress={() => openInfo(ex.name)} />
                    <TouchableOpacity
                      onPress={() => setExpandedEx(isOpen ? null : exIdx)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={s.chevron}>{isOpen ? "▲" : "▼"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {isOpen && (
                  <View style={s.exCardBody}>
                    {ex.sets.map((set, sIdx) => (
                      <View key={sIdx} style={s.setRow}>
                        <Text style={s.setInfo}>
                          <Text style={s.setNum}>#{sIdx + 1} </Text>
                          {formatSet(set.weight, set.reps, repLabel)}
                        </Text>
                        <RemoveButton
                          size={16}
                          onPress={() => removeSet(exIdx, sIdx)}
                        />
                      </View>
                    ))}

                    <View style={s.inputRow}>
                      {!timed && (
                        <>
                          <TextInput
                            style={s.input}
                            placeholder="kg"
                            placeholderTextColor={colors.muted}
                            keyboardType="numeric"
                            value={inp.w}
                            onChangeText={(v) =>
                              setInputs((p) => ({
                                ...p,
                                [exIdx]: { ...p[exIdx], w: v },
                              }))
                            }
                          />
                          <Text style={s.multiply}>×</Text>
                        </>
                      )}
                      <TextInput
                        style={[s.input, timed && s.inputWide]}
                        placeholder={getRepInputPlaceholder(repLabel)}
                        placeholderTextColor={colors.muted}
                        keyboardType="numeric"
                        value={inp.r}
                        onChangeText={(v) =>
                          setInputs((p) => ({
                            ...p,
                            [exIdx]: { ...p[exIdx], r: v },
                          }))
                        }
                      />
                      <TouchableOpacity
                        style={s.addSetBtn}
                        onPress={() => handleAddSet(exIdx)}
                      >
                        <Text style={s.addSetBtnText}>+ SET</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          <TouchableOpacity
            style={s.addExBtn}
            onPress={() => setShowPicker(true)}
          >
            <Text style={s.addExBtnText}>+ ADD EXERCISE</Text>
          </TouchableOpacity>

          {activeSession.exercises.length > 0 && (
            <TouchableOpacity style={s.finishBtn} onPress={handleFinish}>
              <Text style={s.finishBtnText}>FINISH SESSION ✓</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        <ExercisePicker
          visible={showPicker}
          onClose={() => setShowPicker(false)}
          onSelect={(name) => {
            addExercise(name);
            setExpandedEx(activeSession.exercises.length);
          }}
          addedExercises={activeSession.exercises.map((ex) => ex.name)}
          exercisePool={libraryExercises}
        />

        <ExerciseInfoSheet exerciseName={exerciseName} onClose={closeInfo} />
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
      alignItems: "flex-start",
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
      fontFamily: fonts.body,
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
    },
    discard: {
      fontFamily: fonts.display,
      fontSize: 14,
      color: colors.muted,
      letterSpacing: 1,
      marginTop: 6,
    },
    scroll: {
      padding: 20,
      paddingTop: 10,
    },
    exCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginBottom: 10,
      overflow: "hidden",
    },
    exCardOpen: {
      borderColor: colors.amber + "55",
    },
    exCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 14,
    },
    exName: {
      fontFamily: fonts.bodyMedium,
      fontSize: 14,
      color: colors.text,
    },
    exMeta: {
      fontFamily: fonts.mono,
      fontSize: 10,
      color: colors.muted,
      marginTop: 3,
    },
    chevron: {
      color: colors.muted,
      fontSize: 10,
    },
    exCardBody: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: 14,
    },
    setRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.background,
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
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 8,
    },
    input: {
      width: 72,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      padding: 10,
      fontFamily: fonts.mono,
      fontSize: 13,
      color: colors.text,
      textAlign: "center",
    },
    inputWide: {
      flex: 1,
      width: undefined,
    },
    multiply: {
      color: colors.muted,
      fontSize: 14,
    },
    addSetBtn: {
      flex: 1,
      backgroundColor: colors.amber,
      borderRadius: 6,
      padding: 10,
      alignItems: "center",
    },
    addSetBtnText: {
      fontFamily: fonts.display,
      fontSize: 16,
      color: colors.background,
      letterSpacing: 1,
    },
    addExBtn: {
      borderWidth: 1,
      borderColor: colors.amber + "66",
      borderRadius: 8,
      padding: 14,
      alignItems: "center",
      marginBottom: 12,
    },
    addExBtnText: {
      fontFamily: fonts.display,
      fontSize: 16,
      color: colors.amber,
      letterSpacing: 1,
    },
    finishBtn: {
      backgroundColor: colors.amber,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
    },
    finishBtnText: {
      fontFamily: fonts.display,
      fontSize: 20,
      color: colors.background,
      letterSpacing: 2,
    },
    exCardHeaderLeft: {
      flex: 1,
    },
    exCardHeaderRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
  });
}
