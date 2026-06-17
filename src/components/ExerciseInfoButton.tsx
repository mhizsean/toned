import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

type Props = {
  onPress: () => void;
  size?: number;
};

export default function ExerciseInfoButton({ onPress, size = 18 }: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons
        name="information-circle-outline"
        size={size}
        color={colors.muted}
      />
    </TouchableOpacity>
  );
}
