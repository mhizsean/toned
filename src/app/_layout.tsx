import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from "@expo-google-fonts/dm-sans";
import { fonts } from "../constants/theme";
import { useWorkoutStore } from "../store/workoutStore";
import { Ionicons } from "@expo/vector-icons";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

function AppLayout() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
  });
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarBottomInset = Math.max(insets.bottom, 12);
  const tabBarHeight = 68;
  const tabBarFloatGap = 12;
  const sceneBottomInset =
    tabBarHeight + tabBarBottomInset + tabBarFloatGap + 8;
  const loadSessions = useWorkoutStore((state) => state.loadSessions);
  const loadActiveSession = useWorkoutStore((state) => state.loadActiveSession);
  const loadLibrary = useWorkoutStore((state) => state.loadLibrary);
  const loadSchedule = useWorkoutStore((state) => state.loadSchedule);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      loadSessions();
      loadActiveSession();
      loadLibrary();
      loadSchedule();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          paddingBottom: sceneBottomInset,
        },
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: tabBarBottomInset,
          height: tabBarHeight,
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          borderRadius: 28,
          marginHorizontal: 14,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.14,
              shadowRadius: 12,
            },
            android: {
              elevation: 10,
            },
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarActiveTintColor: colors.amber,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: fonts.body,
          fontSize: 9,
          letterSpacing: 0.5,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "HOME",
          tabBarButtonTestID: "tab-home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: "PLAN",
          tabBarButtonTestID: "tab-plan",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "HISTORY",
          tabBarButtonTestID: "tab-history",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prs"
        options={{
          title: "PRs",
          tabBarButtonTestID: "tab-prs",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="session"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen name="day-setup" options={{ href: null }} />

      <Tabs.Screen
        name="settings"
        options={{
          title: "SETTINGS",
          tabBarButtonTestID: "tab-settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppLayout />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
