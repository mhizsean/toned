import { memo, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export type ExerciseCategoryListStyles = {
  category: ViewStyle;
  catLabel: TextStyle;
  pillRow: ViewStyle;
  pill: ViewStyle;
  pillAdded: ViewStyle;
  pillText: TextStyle;
  pillTextAdded: TextStyle;
};

type CategoryRowProps = {
  category: string;
  exercises: string[];
  addedSet: Set<string>;
  onPress: (name: string) => void;
  styles: ExerciseCategoryListStyles;
  allowToggle?: boolean;
};

const CategoryRow = memo(function CategoryRow({
  category,
  exercises,
  addedSet,
  onPress,
  styles: s,
  allowToggle = false,
}: CategoryRowProps) {
  return (
    <View style={s.category}>
      <Text style={s.catLabel}>{category}</Text>
      <View style={s.pillRow}>
        {exercises.map((ex) => {
          const added = addedSet.has(ex);
          return (
            <TouchableOpacity
              key={ex}
              style={[s.pill, added && s.pillAdded]}
              onPress={() => (allowToggle || !added) && onPress(ex)}
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
  );
});

type Props = {
  categories: Record<string, string[]>;
  addedNames: string[];
  onPress: (name: string) => void;
  styles: ExerciseCategoryListStyles;
  allowToggle?: boolean;
  listStyle?: ViewStyle;
};

export default function ExerciseCategoryList({
  categories,
  addedNames,
  onPress,
  styles,
  allowToggle = false,
  listStyle,
}: Props) {
  const addedSet = useMemo(() => new Set(addedNames), [addedNames]);
  const data = useMemo(() => Object.entries(categories), [categories]);

  return (
    <ScrollView
      style={[listStyles.list, listStyle]}
      contentContainerStyle={listStyles.listContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      {data.map(([category, exercises]) => (
        <CategoryRow
          key={category}
          category={category}
          exercises={exercises}
          addedSet={addedSet}
          onPress={onPress}
          styles={styles}
          allowToggle={allowToggle}
        />
      ))}
    </ScrollView>
  );
}

const listStyles = StyleSheet.create({
  list: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  listContent: {
    paddingBottom: 8,
  },
});
