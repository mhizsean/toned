import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../constants/theme";

export default function PlanScreen() {
  return (
    <View style={s.container}>
      <Text style={s.title}>PLAN</Text>
      <Text style={s.sub}>Your weekly schedule</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 48,
    color: colors.amber,
    letterSpacing: 4,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
    marginTop: 8,
  },
});
