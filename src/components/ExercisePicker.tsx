import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { useState } from "react";
import { colors, fonts } from "../constants/theme";
import { EXERCISE_CATEGORIES } from "../data/plans";

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
  const [search, setSearch] = useState("");

  const filteredCats = search
    ? Object.fromEntries(
        Object.entries(EXERCISE_CATEGORIES)
          .map(([cat, exs]) => [
            cat,
            exs.filter((e) => e.toLowerCase().includes(search.toLowerCase())),
          ])
          .filter(([, exs]) => (exs as string[]).length > 0),
      )
    : EXERCISE_CATEGORIES;

  const handleSelect = (name: string) => {
    onSelect(name);
    setSearch("");
    onClose();
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
          {/* Handle */}
          <View style={s.handle} />

          <Text style={s.title}>CHOOSE EXERCISE</Text>

          {/* Search */}
          <TextInput
            style={s.search}
            placeholder="Search exercises..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />

          {/* Exercise list */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {Object.entries(filteredCats).map(([cat, exs]) => (
              <View key={cat} style={s.category}>
                <Text style={s.catLabel}>{cat}</Text>
                <View style={s.pillRow}>
                  {(exs as string[]).map((ex) => {
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
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.bgOverlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: "75%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
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
