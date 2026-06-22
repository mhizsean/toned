import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { ColorScheme, fonts } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import {
  EXERCISE_CATEGORIES,
  ExerciseCategory,
  getCategoryDisplayLabel,
  RepLabel,
} from "../data/exerciseTypes";
import BottomSheet from "./BottomSheet";
import { useWorkoutStore } from "../store/workoutStore";
import { isDuplicateExerciseName, normalizeCustomExerciseName } from "../utils/exerciseCatalogue";

type Props = {
  visible: boolean;
  initialName?: string;
  onClose: () => void;
  onSaved?: (name: string) => void;
};

const REP_OPTIONS: { label: string; value: RepLabel }[] = [
  { label: "Reps", value: "reps" },
  { label: "Seconds", value: "seconds" },
];

export default function CustomExerciseSheet({
  visible,
  initialName = "",
  onClose,
  onSaved,
}: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const addCustomExercise = useWorkoutStore((state) => state.addCustomExercise);

  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState<ExerciseCategory>("Upper Body");
  const [equipment, setEquipment] = useState("");
  const [repLabel, setRepLabel] = useState<RepLabel>("reps");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initialName);
    }
  }, [visible, initialName]);

  const resetForm = (nextName = "") => {
    setName(nextName);
    setCategory("Upper Body");
    setEquipment("");
    setRepLabel("reps");
    setIsSaving(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    const trimmed = normalizeCustomExerciseName(name);
    if (!trimmed) {
      Alert.alert("Name required", "Enter a name for your exercise.");
      return;
    }
    if (isDuplicateExerciseName(trimmed)) {
      Alert.alert(
        "Already exists",
        "An exercise with this name is already in the catalogue or your custom list.",
      );
      return;
    }

    setIsSaving(true);
    try {
      await addCustomExercise({
        name: trimmed,
        category,
        equipment,
        repLabel,
      });
      onSaved?.(trimmed);
      resetForm();
      onClose();
    } catch {
      Alert.alert(
        "Could not save",
        "Something went wrong while saving your exercise. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} maxHeight="85%">
      <View style={s.container}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          <Text style={s.title}>ADD CUSTOM EXERCISE</Text>
          <Text style={s.subtitle}>
            Saved to your library on this device. Pick a focus area from the list
            below.
          </Text>

          <Text style={s.label}>EXERCISE NAME</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Nordic Curl"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={s.label}>FOCUS</Text>
          <View style={s.focusGrid}>
            {EXERCISE_CATEGORIES.map((cat) => {
              const selected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[s.focusPill, selected && s.focusPillActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[s.focusPillText, selected && s.focusPillTextActive]}>
                    {getCategoryDisplayLabel(cat)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={s.label}>EQUIPMENT (OPTIONAL)</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Cable, Dumbbell"
            placeholderTextColor={colors.muted}
            value={equipment}
            onChangeText={setEquipment}
          />

          <Text style={s.label}>LOG TYPE</Text>
          <View style={s.repRow}>
            {REP_OPTIONS.map((option) => {
              const selected = repLabel === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[s.repBtn, selected && s.repBtnActive]}
                  onPress={() => setRepLabel(option.value)}
                >
                  <Text style={[s.repBtnText, selected && s.repBtnTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.saveBtn, isSaving && s.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={s.saveBtnText}>
              {isSaving ? "SAVING…" : "SAVE TO LIBRARY"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.cancelBtn} onPress={handleClose}>
            <Text style={s.cancelBtnText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      minHeight: 0,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 12,
    },
    title: {
      fontFamily: fonts.display,
      fontSize: 22,
      color: colors.text,
      letterSpacing: 2,
      marginBottom: 8,
    },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.muted,
      lineHeight: 19,
      marginBottom: 20,
    },
    label: {
      fontFamily: fonts.body,
      fontSize: 10,
      color: colors.muted,
      letterSpacing: 2,
      marginBottom: 8,
      marginTop: 4,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.text,
      marginBottom: 12,
    },
    focusGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
    },
    focusPill: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.pillBackground,
    },
    focusPillActive: {
      backgroundColor: colors.amber + "22",
      borderColor: colors.amber + "66",
    },
    focusPillText: {
      fontFamily: fonts.body,
      fontSize: 12,
      color: colors.muted,
    },
    focusPillTextActive: {
      color: colors.amber,
    },
    repRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 4,
    },
    repBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
      backgroundColor: colors.pillBackground,
    },
    repBtnActive: {
      backgroundColor: colors.amber + "22",
      borderColor: colors.amber + "66",
    },
    repBtnText: {
      fontFamily: fonts.bodyMedium,
      fontSize: 14,
      color: colors.muted,
    },
    repBtnTextActive: {
      color: colors.amber,
    },
    footer: {
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    saveBtn: {
      backgroundColor: colors.amber,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      marginBottom: 10,
    },
    saveBtnDisabled: {
      opacity: 0.6,
    },
    saveBtnText: {
      fontFamily: fonts.display,
      fontSize: 18,
      color: colors.background,
      letterSpacing: 1,
    },
    cancelBtn: {
      alignItems: "center",
      paddingVertical: 8,
    },
    cancelBtnText: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.muted,
    },
  });
}
