import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { ColorScheme, fonts } from "../constants/theme";
import { useWorkoutStore } from "../store/workoutStore";
import { useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { EXERCISE_CATALOGUE } from "../data/exerciseCatalogue";
import BottomSheet from "./BottomSheet";
import {
  groupCatalogueByCategory,
  filterCategoriesBySearch,
} from "../utils/exerciseCatalogue";
import ExerciseCategoryList from "./ExerciseCategoryList";

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

  const groupedByCategory = useMemo(
    () => groupCatalogueByCategory(EXERCISE_CATALOGUE),
    [],
  );
  const filteredCats = useMemo(
    () => filterCategoriesBySearch(groupedByCategory, search),
    [groupedByCategory, search],
  );

  const toggleExercise = (name: string) => {
    if (libraryExercises.includes(name)) {
      removeFromLibrary(name);
    } else {
      addToLibrary(name);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="80%">
      <View style={s.body}>
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

        <ExerciseCategoryList
          categories={filteredCats}
          addedNames={libraryExercises}
          onPress={toggleExercise}
          styles={s}
          allowToggle
        />
      </View>
    </BottomSheet>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    body: {
      flex: 1,
      minHeight: 0,
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
