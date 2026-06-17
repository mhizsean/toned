import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { ColorScheme, fonts } from "../constants/theme";
import { useWorkoutStore } from "../store/workoutStore";
import { useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { EXERCISE_CATALOGUE } from "../data/exerciseCatalogue";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AddExerciseSheet({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { libraryExercises, addToLibrary, removeFromLibrary } =
    useWorkoutStore();
  const [search, setSearch] = useState("");

  const groupedByCategory = EXERCISE_CATALOGUE.reduce(
    (acc, ex) => {
      if (!acc[ex.category]) acc[ex.category] = [];
      acc[ex.category].push(ex.name);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const filteredCats = search
    ? Object.fromEntries(
        Object.entries(groupedByCategory)
          .map(([cat, exs]) => [
            cat,
            exs.filter((e) => e.toLowerCase().includes(search.toLowerCase())),
          ])
          .filter(([, exs]) => (exs as string[]).length > 0),
      )
    : groupedByCategory;

  const toggleExercise = (name: string) => {
    if (libraryExercises.includes(name)) {
      removeFromLibrary(name);
    } else {
      addToLibrary(name);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={s.sheet} activeOpacity={1} onPress={() => {}}>
          <View style={s.handle} />

          <View style={s.titleRow}>
            <Text style={s.title}>ADD EXERCISES</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={s.done}>DONE</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={s.search}
            placeholder="Search exercises..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            {Object.entries(filteredCats).map(([cat, exs]) => (
              <View key={cat} style={s.category}>
                <Text style={s.catLabel}>{cat}</Text>
                <View style={s.pillRow}>
                  {(exs as string[]).map((ex) => {
                    const added = libraryExercises.includes(ex);
                    return (
                      <TouchableOpacity
                        key={ex}
                        style={[s.pill, added && s.pillAdded]}
                        onPress={() => toggleExercise(ex)}
                      >
                        <Text style={[s.pillText, added && s.pillTextAdded]}>
                          {added ? "✓ " : ""}
                          {ex}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "#000000cc",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: "#111111",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 40,
      maxHeight: "80%",
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 16,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    title: {
      fontFamily: fonts.display,
      fontSize: 22,
      color: colors.text,
      letterSpacing: 2,
    },
    done: {
      fontFamily: fonts.display,
      fontSize: 14,
      color: colors.amber,
      letterSpacing: 1,
    },
    search: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.text,
      marginBottom: 16,
    },
    category: {
      marginBottom: 18,
    },
    catLabel: {
      fontFamily: fonts.body,
      fontSize: 11,
      color: colors.muted,
      letterSpacing: 1,
      marginBottom: 8,
    },
    pillRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    pill: {
      backgroundColor: colors.pillBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    pillAdded: {
      backgroundColor: colors.amber + "22",
      borderColor: colors.amber + "66",
    },
    pillText: {
      fontFamily: fonts.body,
      fontSize: 12,
      color: colors.text,
    },
    pillTextAdded: {
      color: colors.amber,
    },
  });
}
