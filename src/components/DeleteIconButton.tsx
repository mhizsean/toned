import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { confirmDestructive } from "../utils/alerts";

type Props = {
  onDelete: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  size?: number;
  stopPropagation?: boolean;
};

export default function DeleteIconButton({
  onDelete,
  title = "Delete",
  message = "Are you sure? This cannot be undone.",
  confirmLabel = "Delete",
  size = 16,
  stopPropagation = false,
}: Props) {
  const { colors } = useTheme();

  const handlePress = () => {
    confirmDestructive({
      title,
      message,
      confirmLabel,
      onConfirm: onDelete,
    });
  };

  return (
    <TouchableOpacity
      style={{ padding: 2 }}
      onPress={(e) => {
        if (stopPropagation) e.stopPropagation();
        handlePress();
      }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name="trash-outline" size={size} color={colors.muted} />
    </TouchableOpacity>
  );
}
