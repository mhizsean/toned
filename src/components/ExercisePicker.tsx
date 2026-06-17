import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useMemo, useState } from "react";
import { ColorScheme, fonts } from "../constants/theme";
import { EXERCISE_CATEGORIES } from "../data/plans";
import { useTheme } from "../context/ThemeContext";
import BottomSheet from "./BottomSheet";
import { filterCategoriesBySearch } from "../utils/exerciseCatalogue";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (name: string) => void;
  addedExercises: string[];
};

export default function ExercisePicker({
  visible,
  onClose,
  onSelect,
  addedExercises,
}: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [search, setSearch] = useState("");

  const filteredCats = filterCategoriesBySearch(EXERCISE_CATEGORIES, search);

  const handleSelect = (name: string) => {
    onSelect(name);
    setSearch("");
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="75%">
      <Text style={s.title}>CHOOSE EXERCISE</Text>

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
              {exs.map((ex) => {
                const added = addedExercises.includes(ex);
                return (
                  <TouchableOpacity
                    key={ex}
                    style={[s.pill, added && s.pillAdded]}
                    onPress={() => !added && handleSelect(ex)}
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
    </BottomSheet>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    title: {
      fontFamily: fonts.display,
      fontSize: 22,
      color: colors.text,
      letterSpacing: 2,
      marginBottom: 14,
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
      backgroundColor: colors.background,
      borderColor: colors.muted,
    },
    pillText: {
      fontFamily: fonts.body,
      fontSize: 12,
      color: colors.text,
    },
    pillTextAdded: {
      color: colors.muted,
    },
  });
}
