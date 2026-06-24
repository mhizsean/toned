import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Keyboard,
  Platform,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { ColorScheme, fonts } from "../constants/theme";
import { useWorkoutStore } from "../store/workoutStore";
import { SafeAreaView } from "react-native-safe-area-context";
import ExercisePicker from "../components/ExercisePicker";
import DurationPickerSheet from "../components/DurationPickerSheet";
import { useTheme } from "../context/ThemeContext";
import { useMemo } from "react";
import ExerciseInfoButton from "../components/ExerciseInfoButton";
import RemoveButton from "../components/RemoveButton";
import ExerciseInfoSheet from "../components/ExerciseInfoSheet";
import { useExerciseInfoSheet } from "../hooks/useExerciseInfoSheet";
import { pluralize } from "../utils/text";
import { formatSet, getTopReps, getTopWeight } from "../utils/formatWorkout";
import { formatDuration } from "../utils/formatDuration";
import {
  findExercise,
  getRepInputPlaceholder,
  isTimedExercise,
} from "../utils/exerciseCatalogue";
import { confirmDestructive } from "../utils/alerts";
import {
  isValidSetInputs,
  parseSetInputs,
  sanitizeDecimalInput,
  sanitizeIntegerInput,
} from "../utils/setInput";

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
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetY = useRef(0);
  const inputRowRefs = useRef<Record<number, View | null>>({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [focusedExIdx, setFocusedExIdx] = useState<number | null>(null);
  const { exerciseName, openInfo, closeInfo } = useExerciseInfoSheet();
  const [expandedEx, setExpandedEx] = useState<number | null>(null);
  const [inputs, setInputs] = useState<
    Record<number, { w: string; r: string }>
  >({});
  const [showPicker, setShowPicker] = useState(false);
  const [durationPickerExIdx, setDurationPickerExIdx] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!activeSession) {
      router.replace("/");
      return;
    }
  }, [activeSession]);

  useEffect(() => {
    setExpandedEx(null);
    setInputs({});
    setDurationPickerExIdx(null);
    setShowPicker(false);
  }, [activeSession?.id]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      setFocusedExIdx(null);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollInputIntoView = (exIdx: number) => {
    const target = inputRowRefs.current[exIdx];
    if (!target || keyboardHeight <= 0) return;

    setTimeout(() => {
      target.measureInWindow((_x, y, _width, height) => {
        const windowHeight = Dimensions.get("window").height;
        const visibleBottom = windowHeight - keyboardHeight - 16;
        const inputBottom = y + height;

        if (inputBottom > visibleBottom) {
          scrollRef.current?.scrollTo({
            y: scrollOffsetY.current + (inputBottom - visibleBottom),
            animated: true,
          });
        }
      });
    }, Platform.OS === "ios" ? 50 : 100);
  };

  useEffect(() => {
    if (focusedExIdx != null && keyboardHeight > 0) {
      scrollInputIntoView(focusedExIdx);
    }
  }, [focusedExIdx, keyboardHeight]);

  const handleInputFocus = (exIdx: number) => {
    setFocusedExIdx(exIdx);
    if (keyboardHeight > 0) {
      scrollInputIntoView(exIdx);
    }
  };

  if (!activeSession) {
    return null;
  }

  const handleAddSet = (exIdx: number) => {
    const exerciseInfo = findExercise(activeSession.exercises[exIdx].name);
    const timed = isTimedExercise(exerciseInfo);
    const { w = "", r = "" } = inputs[exIdx] || {};
    const set = parseSetInputs(w, r, timed);
    if (!set) return;
    addSet(exIdx, set);
    setInputs((prev) => ({ ...prev, [exIdx]: { w: "", r: "" } }));
  };

  const hasLoggedSets = activeSession.exercises.some((ex) => ex.sets.length > 0);
  const unfinishedNames = activeSession.exercises
    .filter((ex) => ex.sets.length === 0)
    .map((ex) => ex.name);

  const leaveForLater = () => {
    router.replace("/");
  };

  const finishForToday = async () => {
    await finishSession();
    router.replace("/");
  };

  const handleFinish = () => {
    if (!hasLoggedSets) {
      Alert.alert(
        "Nothing logged yet",
        "You haven't recorded any sets. Discard this session instead?",
        [
          { text: "Keep going", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              discardSession();
              router.replace("/");
            },
          },
        ],
      );
      return;
    }

    const incompleteNote =
      unfinishedNames.length > 0
        ? unfinishedNames.length <= 3
          ? `You still have sets to log for ${unfinishedNames.join(", ")}. `
          : `You still have sets to log for ${unfinishedNames.slice(0, 3).join(", ")} +${unfinishedNames.length - 3} more. `
        : "";

    Alert.alert(
      "Leave session?",
      `${incompleteNote}Continue later and pick up where you left off, or finish for today and save your logged sets to history.`,
      [
        { text: "Keep going", style: "cancel" },
        { text: "Continue later", onPress: leaveForLater },
        { text: "Finish for today", onPress: finishForToday },
      ],
    );
  };

  const handleDiscard = () => {
    confirmDestructive({
      title: "Discard Session",
      message:
        "Are you sure you want to discard your session? This cannot be undone.",
      confirmLabel: "Discard",
      cancelLabel: "Cancel",
      onConfirm: () => {
        discardSession();
        router.replace("/");
      },
    });
  };

  return (
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

      <View style={s.flex}>
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onScroll={(event) => {
            scrollOffsetY.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          contentContainerStyle={[
            s.scroll,
            {
              paddingBottom:
                keyboardHeight > 0 ? keyboardHeight + 24 : 20,
            },
          ]}
        >
        {activeSession.exercises.map((ex, exIdx) => {
          const isOpen = expandedEx === exIdx;
          const inp = inputs[exIdx] || { w: "", r: "" };
          const exerciseInfo = findExercise(ex.name);
          const timed = isTimedExercise(exerciseInfo);
          const repLabel = exerciseInfo?.repLabel;
          const sessionMax = timed
            ? getTopReps(ex.sets)
            : getTopWeight(ex.sets);
          const canAddSet = isValidSetInputs(inp.w, inp.r, timed);

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
                        ? `${pluralize(ex.sets.length, "set")} · top ${sessionMax != null ? formatDuration(sessionMax) : "—"}`
                        : `${pluralize(ex.sets.length, "set")} · top ${sessionMax ?? "—"}kg`
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
                    <View key={`${ex.name}-set-${sIdx}`} style={s.setRow}>
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

                  <View
                    ref={(node) => {
                      inputRowRefs.current[exIdx] = node;
                    }}
                    style={s.inputRow}
                  >
                    {!timed && (
                      <>
                        <TextInput
                          style={s.input}
                          placeholder="kg"
                          placeholderTextColor={colors.muted}
                          keyboardType="numeric"
                          value={inp.w}
                          onFocus={() => handleInputFocus(exIdx)}
                          onChangeText={(v) =>
                            setInputs((p) => ({
                              ...p,
                              [exIdx]: {
                                ...inp,
                                w: sanitizeDecimalInput(v),
                              },
                            }))
                          }
                        />
                        <Text style={s.multiply}>×</Text>
                      </>
                    )}
                    {timed ? (
                      <TouchableOpacity
                        style={[s.input, s.inputWide, s.durationInput]}
                        onPress={() => setDurationPickerExIdx(exIdx)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            s.durationInputText,
                            !inp.r && s.durationPlaceholder,
                          ]}
                        >
                          {inp.r
                            ? formatDuration(parseInt(inp.r, 10))
                            : getRepInputPlaceholder(repLabel)}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TextInput
                        style={s.input}
                        placeholder={getRepInputPlaceholder(repLabel)}
                        placeholderTextColor={colors.muted}
                        keyboardType="numeric"
                        value={inp.r}
                        onFocus={() => handleInputFocus(exIdx)}
                        onChangeText={(v) =>
                          setInputs((p) => ({
                            ...p,
                            [exIdx]: {
                              ...inp,
                              r: sanitizeIntegerInput(v),
                            },
                          }))
                        }
                      />
                    )}
                    <TouchableOpacity
                      style={[s.addSetBtn, !canAddSet && s.addSetBtnDisabled]}
                      onPress={() => handleAddSet(exIdx)}
                      disabled={!canAddSet}
                    >
                      <Text style={s.addSetBtnText}>+ SET</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {keyboardHeight === 0 && (
          <>
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
          </>
        )}
        </ScrollView>
      </View>
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

      <DurationPickerSheet
        visible={durationPickerExIdx != null}
        initialSeconds={
          durationPickerExIdx != null
            ? parseInt(inputs[durationPickerExIdx]?.r || "0", 10)
            : 0
        }
        onClose={() => setDurationPickerExIdx(null)}
        onConfirm={(seconds) => {
          if (durationPickerExIdx == null) return;
          setInputs((prev) => ({
            ...prev,
            [durationPickerExIdx]: {
              ...prev[durationPickerExIdx],
              w: "",
              r: String(seconds),
            },
          }));
        }}
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
    flex: {
      flex: 1,
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
    durationInput: {
      justifyContent: "center",
    },
    durationInputText: {
      fontFamily: fonts.mono,
      fontSize: 13,
      color: colors.text,
      textAlign: "center",
    },
    durationPlaceholder: {
      color: colors.muted,
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
    addSetBtnDisabled: {
      opacity: 0.4,
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
