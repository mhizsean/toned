import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { fonts, ColorScheme } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import BottomSheet from "./BottomSheet";
import {
  durationToParts,
  durationToSeconds,
  formatDuration,
} from "../utils/formatDuration";

const ITEM_HEIGHT = 44;
const WHEEL_PADDING = ITEM_HEIGHT * 2;
const MAX_MINUTES = 59;
const MINUTES = Array.from({ length: MAX_MINUTES + 1 }, (_, i) => i);
const SECONDS = Array.from({ length: 60 }, (_, i) => i);

type Props = {
  visible: boolean;
  initialSeconds?: number;
  onClose: () => void;
  onConfirm: (seconds: number) => void;
};

type WheelColumnProps = {
  label: string;
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
  resetKey: number;
};

function WheelColumn({
  label,
  values,
  selected,
  onSelect,
  resetKey,
}: WheelColumnProps) {
  const { colors } = useTheme();
  const s = useMemo(() => createWheelStyles(colors), [colors]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const index = values.indexOf(selected);
    if (index < 0) return;
    scrollRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: false,
    });
  }, [resetKey, selected, values]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.min(Math.max(index, 0), values.length - 1);
    onSelect(values[clamped]);
  };

  return (
    <View style={s.column}>
      <Text style={s.label}>{label}</Text>
      <View style={s.wheelWrap}>
        <View style={s.selectionBand} pointerEvents="none" />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScrollEnd}
          contentContainerStyle={{ paddingVertical: WHEEL_PADDING }}
        >
          {values.map((value) => {
            const active = value === selected;
            return (
              <View key={value} style={s.item}>
                <Text style={[s.itemText, active && s.itemTextActive]}>
                  {String(value).padStart(2, "0")}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

export default function DurationPickerSheet({
  visible,
  initialSeconds = 0,
  onClose,
  onConfirm,
}: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [resetKey, setResetKey] = useState(0);
  const initial = durationToParts(initialSeconds > 0 ? initialSeconds : 60);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [seconds, setSeconds] = useState(initial.seconds);

  useEffect(() => {
    if (!visible) return;
    const next = durationToParts(initialSeconds > 0 ? initialSeconds : 60);
    setMinutes(next.minutes);
    setSeconds(next.seconds);
    setResetKey((key) => key + 1);
  }, [visible, initialSeconds]);

  const totalSeconds = durationToSeconds(minutes, seconds);
  const canConfirm = totalSeconds > 0;

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="52%">
      <Text style={s.title}>SET DURATION</Text>
      <Text style={s.preview}>{formatDuration(totalSeconds)}</Text>

      <View style={s.wheels}>
        <WheelColumn
          label="MIN"
          values={MINUTES}
          selected={minutes}
          onSelect={setMinutes}
          resetKey={resetKey}
        />
        <Text style={s.separator}>:</Text>
        <WheelColumn
          label="SEC"
          values={SECONDS}
          selected={seconds}
          onSelect={setSeconds}
          resetKey={resetKey}
        />
      </View>

      <TouchableOpacity
        style={[s.confirmBtn, !canConfirm && s.confirmBtnDisabled]}
        disabled={!canConfirm}
        onPress={() => {
          onConfirm(totalSeconds);
          onClose();
        }}
      >
        <Text style={s.confirmBtnText}>CONFIRM</Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    title: {
      fontFamily: fonts.display,
      fontSize: 14,
      color: colors.muted,
      letterSpacing: 2,
      marginBottom: 8,
    },
    preview: {
      fontFamily: fonts.mono,
      fontSize: 40,
      color: colors.amber,
      textAlign: "center",
      marginBottom: 16,
    },
    wheels: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 20,
    },
    separator: {
      fontFamily: fonts.mono,
      fontSize: 28,
      color: colors.text,
      marginTop: 24,
    },
    confirmBtn: {
      backgroundColor: colors.amber,
      borderRadius: 8,
      padding: 14,
      alignItems: "center",
    },
    confirmBtnDisabled: {
      opacity: 0.4,
    },
    confirmBtnText: {
      fontFamily: fonts.display,
      fontSize: 18,
      color: colors.background,
      letterSpacing: 1,
    },
  });
}

function createWheelStyles(colors: ColorScheme) {
  return StyleSheet.create({
    column: {
      flex: 1,
      maxWidth: 96,
    },
    label: {
      fontFamily: fonts.body,
      fontSize: 10,
      color: colors.muted,
      letterSpacing: 2,
      textAlign: "center",
      marginBottom: 8,
    },
    wheelWrap: {
      height: ITEM_HEIGHT * 5,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.background,
    },
    selectionBand: {
      position: "absolute",
      top: WHEEL_PADDING,
      left: 0,
      right: 0,
      height: ITEM_HEIGHT,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.amber + "55",
      zIndex: 1,
    },
    item: {
      height: ITEM_HEIGHT,
      alignItems: "center",
      justifyContent: "center",
    },
    itemText: {
      fontFamily: fonts.mono,
      fontSize: 22,
      color: colors.muted,
    },
    itemTextActive: {
      color: colors.text,
      fontSize: 24,
    },
  });
}
