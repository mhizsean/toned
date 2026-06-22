import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { ReactNode, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ColorScheme } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: ViewStyle["maxHeight"];
  sheetStyle?: ViewStyle;
};

export default function BottomSheet({
  visible,
  onClose,
  children,
  maxHeight = "85%",
  sheetStyle,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={s.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.overlay}>
          <Pressable style={s.backdrop} onPress={onClose} />
          <View
            style={[
              s.sheet,
              { maxHeight, height: maxHeight, paddingBottom: 20 + insets.bottom },
              sheetStyle,
            ]}
          >
            <View style={s.handle} />
            <View style={s.content}>{children}</View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    keyboardAvoid: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: colors.bgOverlay,
      justifyContent: "flex-end",
    },
    backdrop: {
      flex: 1,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    content: {
      flex: 1,
      minHeight: 0,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 16,
    },
  });
}
