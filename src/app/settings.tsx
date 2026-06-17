import { View, Text, Switch, StyleSheet, ScrollView } from "react-native";
import { useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { fonts, ColorScheme } from "../constants/theme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity, Linking } from "react-native";
export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Text style={s.title}>SETTINGS</Text>
          <Text style={s.sub}>SET PREFERENCE</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          <Text style={s.sectionLabel}>APPEARANCE</Text>
          <View style={s.card}>
            <View style={s.row}>
              <View style={s.rowLeft}>
                <Text style={s.rowTitle}>Display Mode</Text>
                <Text style={s.rowSub}>
                  Switch between light and dark theme
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.amber }}
                thumbColor={colors.surface}
              />
            </View>
          </View>

          <Text style={s.sectionLabel}>ABOUT</Text>
          <View style={s.card}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>App</Text>
              <Text style={s.infoValue}>Toned</Text>
            </View>
            <View style={s.divider} />
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Version</Text>
              <Text style={s.infoValue}>1.0.0</Text>
            </View>
            <View style={s.divider} />

            <TouchableOpacity
              style={s.infoRow}
              onPress={() => Linking.openURL("https://github.com/mhizsean")}
            >
              <Text style={s.infoLabel}>Built by</Text>
              <Text style={[s.infoValue, { color: colors.amber }]}>
                __mzsn ↗
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      paddingBottom: 8,
    },
    title: {
      fontFamily: fonts.display,
      fontSize: 36,
      color: colors.text,
      letterSpacing: 2,
      lineHeight: 38,
    },
    sub: {
      fontFamily: fonts.mono,
      fontSize: 10,
      color: colors.muted,
      letterSpacing: 2,
      marginTop: 4,
    },
    scroll: {
      padding: 20,
      paddingTop: 10,
    },
    sectionLabel: {
      fontFamily: fonts.body,
      fontSize: 10,
      color: colors.muted,
      letterSpacing: 2,
      marginBottom: 8,
      marginTop: 16,
    },
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
    },
    rowLeft: {
      flex: 1,
      marginRight: 12,
    },
    rowTitle: {
      fontFamily: fonts.bodyMedium,
      fontSize: 14,
      color: colors.text,
    },
    rowSub: {
      fontFamily: fonts.body,
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
    },
    infoLabel: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.muted,
    },
    infoValue: {
      fontFamily: fonts.mono,
      fontSize: 13,
      color: colors.text,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
  });
}
