import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
} from "react-native";
import { ColorScheme, fonts } from "../constants/theme";
import { useWorkoutStore } from "../store/workoutStore";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import BottomSheet from "./BottomSheet";
import {
  filterCategoriesBySearch,
  getMergedCatalogue,
  groupCatalogueByCategory,
} from "../utils/exerciseCatalogue";
import ExerciseCategoryList from "./ExerciseCategoryList";
import CustomExerciseSheet from "./CustomExerciseSheet";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AddExerciseSheet({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { libraryExercises, customExercises, addToLibrary, removeFromLibrary } =
    useWorkoutStore();
  const [search, setSearch] = useState("");
  const [showCustomSheet, setShowCustomSheet] = useState(false);
  const [customDraftName, setCustomDraftName] = useState("");

  useEffect(() => {
    if (!visible) {
      setSearch("");
      setShowCustomSheet(false);
      setCustomDraftName("");
    }
  }, [visible]);

  const groupedByCategory = useMemo(
    () => groupCatalogueByCategory(getMergedCatalogue()),
    [customExercises],
  );
  const filteredCats = useMemo(
    () => filterCategoriesBySearch(groupedByCategory, search),
    [groupedByCategory, search],
  );
  const trimmedSearch = search.trim();
  const hasResults = Object.keys(filteredCats).length > 0;

  const toggleExercise = (name: string) => {
    if (libraryExercises.includes(name)) {
      removeFromLibrary(name);
    } else {
      addToLibrary(name);
    }
  };

  const openCustomSheet = (draftName?: string) => {
    Keyboard.dismiss();
    setCustomDraftName(draftName ?? trimmedSearch);
    setShowCustomSheet(true);
  };

  return (
    <>
      <BottomSheet
        visible={visible && !showCustomSheet}
        onClose={onClose}
        maxHeight="80%"
      >
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

          {hasResults ? (
            <ExerciseCategoryList
              categories={filteredCats}
              addedNames={libraryExercises}
              onPress={toggleExercise}
              styles={s}
              allowToggle
            />
          ) : (
            <ScrollView
              style={s.emptyScroll}
              contentContainerStyle={s.emptyScrollContent}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            >
              {trimmedSearch ? (
                <View style={s.emptySearch}>
                  <Text style={s.emptySearchText}>
                    No exercises match "{trimmedSearch}".
                  </Text>
                  <TouchableOpacity
                    style={s.customBtn}
                    onPress={() => openCustomSheet(trimmedSearch)}
                  >
                    <Text style={s.customBtnText}>
                      ＋ Add "{trimmedSearch}" as custom exercise
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={s.emptySearch}>
                  <Text style={s.emptySearchText}>
                    Search the catalogue or add your own exercise.
                  </Text>
                  <TouchableOpacity
                    style={s.customBtn}
                    onPress={() => openCustomSheet()}
                  >
                    <Text style={s.customBtnText}>＋ Add custom exercise</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}

          {hasResults && trimmedSearch ? (
            <TouchableOpacity
              style={s.customLink}
              onPress={() => openCustomSheet(trimmedSearch)}
            >
              <Text style={s.customLinkText}>
                Can't find it? Add "{trimmedSearch}" as custom
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </BottomSheet>

      <CustomExerciseSheet
        visible={showCustomSheet}
        initialName={customDraftName}
        onClose={() => setShowCustomSheet(false)}
        onSaved={() => {
          setSearch("");
        }}
      />
    </>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    body: {
      flex: 1,
      minHeight: 0,
    },
    emptyScroll: {
      flex: 1,
      minHeight: 0,
    },
    emptyScrollContent: {
      flexGrow: 1,
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
    emptySearch: {
      flex: 1,
      justifyContent: "center",
      paddingVertical: 24,
      paddingHorizontal: 8,
    },
    emptySearchText: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.muted,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 16,
    },
    customBtn: {
      borderWidth: 1,
      borderColor: colors.amber + "66",
      backgroundColor: colors.amber + "11",
      borderRadius: 8,
      padding: 14,
      alignItems: "center",
    },
    customBtnText: {
      fontFamily: fonts.display,
      fontSize: 15,
      color: colors.amber,
      letterSpacing: 1,
      textAlign: "center",
    },
    customLink: {
      marginTop: 12,
      paddingVertical: 8,
      alignItems: "center",
    },
    customLinkText: {
      fontFamily: fonts.bodyMedium,
      fontSize: 12,
      color: colors.amber,
      textAlign: "center",
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
