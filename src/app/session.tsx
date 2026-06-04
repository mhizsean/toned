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
import { colors, fonts } from "../constants/theme";
import { useWorkoutStore } from "../store/workoutStore";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ExercisePicker from "../components/ExercisePicker";

export default function SessionScreen() {
  const {
    activeSession,
    addExercise,
    addSet,
    removeSet,
    finishSession,
    discardSession,
  } = useWorkoutStore();

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
    const { w, r } = inputs[exIdx] || {};
    if (!w || !r) return;
    addSet(exIdx, { weight: parseFloat(w), reps: parseInt(r) });
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
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>SESSION</Text>
            <Text style={s.sub}>
              {activeSession.exercises.length} exercise
              {activeSession.exercises.length !== 1 ? "s" : ""} logged
            </Text>
          </View>
          <TouchableOpacity onPress={handleDiscard}>
            <Text style={s.discard}>DISCARD</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          {/* Exercise cards */}
          {activeSession.exercises.map((ex, exIdx) => {
            const isOpen = expandedEx === exIdx;
            const inp = inputs[exIdx] || { w: "", r: "" };
            const sessionMax = ex.sets.length
              ? Math.max(...ex.sets.map((s) => s.weight))
              : null;

            return (
              <View key={exIdx} style={[s.exCard, isOpen && s.exCardOpen]}>
                {/* Card header */}
                <TouchableOpacity
                  style={s.exCardHeader}
                  onPress={() => setExpandedEx(isOpen ? null : exIdx)}
                >
                  <View>
                    <Text style={s.exName}>{ex.name}</Text>
                    <Text style={s.exMeta}>
                      {ex.sets.length > 0
                        ? `${ex.sets.length} set${ex.sets.length > 1 ? "s" : ""} · top ${sessionMax}kg`
                        : "No sets yet"}
                    </Text>
                  </View>
                  <Text style={s.chevron}>{isOpen ? "▲" : "▼"}</Text>
                </TouchableOpacity>

                {/* Expanded body */}
                {isOpen && (
                  <View style={s.exCardBody}>
                    {/* Sets list */}
                    {ex.sets.map((set, sIdx) => (
                      <View key={sIdx} style={s.setRow}>
                        <Text style={s.setInfo}>
                          <Text style={s.setNum}>#{sIdx + 1} </Text>
                          {set.weight}kg × {set.reps}
                        </Text>
                        <TouchableOpacity
                          onPress={() => removeSet(exIdx, sIdx)}
                        >
                          <Text style={s.removeSet}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                    {/* Add set inputs */}
                    <View style={s.inputRow}>
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
                      <TextInput
                        style={s.input}
                        placeholder="reps"
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

          {/* Add exercise button */}
          <TouchableOpacity
            style={s.addExBtn}
            onPress={() => setShowPicker(true)}
          >
            <Text style={s.addExBtnText}>+ ADD EXERCISE</Text>
          </TouchableOpacity>

          {/* Finish button */}
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
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
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
  removeSet: {
    color: colors.muted,
    fontSize: 16,
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
});
