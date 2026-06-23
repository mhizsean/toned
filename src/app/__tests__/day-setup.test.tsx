import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
} from "@jest/globals";
import React from "react";
import { Alert } from "react-native";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";
import DaySetupScreen from "../day-setup";
import { useWorkoutStore } from "../../store/workoutStore";
import { ThemeProvider } from "../../context/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { confirmDestructive } from "../../utils/alerts";

jest.mock("expo-router", () => ({
  router: {
    navigate: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

jest.mock("../../utils/alerts", () => ({
  confirmDestructive: jest.fn(),
}));

jest.mock("../../components/ExerciseInfoButton", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return function MockExerciseInfoButton({ onPress }: { onPress: () => void }) {
    return React.createElement(
      Pressable,
      { onPress },
      React.createElement(Text, null, "Info"),
    );
  };
});

jest.mock("../../components/RemoveButton", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return function MockRemoveButton({ onPress }: { onPress: () => void }) {
    return React.createElement(
      Pressable,
      { onPress, accessibilityLabel: "remove-exercise" },
      React.createElement(Text, null, "Remove"),
    );
  };
});

jest.mock("../../components/ExerciseInfoSheet", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function MockExerciseInfoSheet() {
    return React.createElement(Text, null, "ExerciseInfoSheet");
  };
});

jest.mock("../../hooks/useExerciseInfoSheet", () => ({
  useExerciseInfoSheet: () => ({
    exerciseName: null,
    openInfo: jest.fn(),
    closeInfo: jest.fn(),
  }),
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;

const TEST_SAFE_AREA = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderDaySetup() {
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA}>
      <ThemeProvider>
        <DaySetupScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

function resetStore() {
  useWorkoutStore.setState({
    sessions: [],
    activeSession: null,
    scheduleLoaded: true,
    libraryExercises: ["Push-Up", "Hip Thrust (Barbell)"],
    weeklySchedule: {},
  });
}

describe("DaySetupScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    mockUseLocalSearchParams.mockReturnValue({ day: "Wed" });
    resetStore();
  });

  it("shows loading until the schedule has hydrated", () => {
    useWorkoutStore.setState({ scheduleLoaded: false });

    renderDaySetup();

    expect(screen.getByText("LOADING…")).toBeTruthy();
    expect(screen.queryByText("WED")).toBeNull();
  });

  it("renders an existing day in view mode", () => {
    useWorkoutStore.setState({
      weeklySchedule: {
        Wed: {
          type: "gym",
          focuses: ["Upper Body"],
          exercises: [{ name: "Push-Up" }],
        },
      },
    });

    renderDaySetup();

    expect(screen.getByText("WED")).toBeTruthy();
    expect(screen.getByText("EDIT")).toBeTruthy();
    expect(screen.getByText("Push-Up")).toBeTruthy();
    expect(screen.getByText("💪 Upper Body")).toBeTruthy();
  });

  it("hydrates the form when schedule data arrives", () => {
    useWorkoutStore.setState({ scheduleLoaded: false });
    const view = renderDaySetup();
    expect(screen.getByText("LOADING…")).toBeTruthy();

    act(() => {
      useWorkoutStore.setState({
        scheduleLoaded: true,
        weeklySchedule: {
          Wed: {
            type: "gym",
            focuses: ["Upper Body"],
            exercises: [{ name: "Push-Up" }],
          },
        },
      });
    });

    act(() => {
      view.rerender(
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA}>
          <ThemeProvider>
            <DaySetupScreen />
          </ThemeProvider>
        </SafeAreaProvider>,
      );
    });

    expect(screen.getByText("Push-Up")).toBeTruthy();
    expect(screen.queryByText("LOADING…")).toBeNull();
  });

  it("clears the day when all focuses are removed and saved", async () => {
    useWorkoutStore.setState({
      weeklySchedule: {
        Wed: {
          type: "gym",
          focuses: ["Upper Body"],
          exercises: [{ name: "Push-Up" }],
        },
      },
    });

    renderDaySetup();
    fireEvent.press(screen.getByText("EDIT"));
    fireEvent.press(screen.getByText("✕"));

    await act(async () => {
      fireEvent.press(screen.getByText("SAVE"));
    });

    expect(useWorkoutStore.getState().weeklySchedule.Wed).toBeUndefined();
    expect(router.navigate).toHaveBeenCalledWith("/plan");
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("returns to plan without creating a schedule when saving a new day with no focus", async () => {
    renderDaySetup();

    await act(async () => {
      fireEvent.press(screen.getByText("SAVE"));
    });

    expect(useWorkoutStore.getState().weeklySchedule.Wed).toBeUndefined();
    expect(router.navigate).toHaveBeenCalledWith("/plan");
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("saves a configured gym day and returns to plan", async () => {
    renderDaySetup();

    fireEvent.press(screen.getByText("Select focus areas..."));
    fireEvent.press(screen.getByText("💪 Upper Body"));
    await act(async () => {
      fireEvent.press(screen.getByText("SAVE"));
    });

    expect(useWorkoutStore.getState().weeklySchedule.Wed).toEqual({
      type: "gym",
      focuses: ["Upper Body"],
      exercises: [],
    });
    expect(router.navigate).toHaveBeenCalledWith("/plan");
  });

  it("shows rest day content when rest is selected", () => {
    renderDaySetup();

    fireEvent.press(screen.getByText("😴 Rest"));

    expect(screen.getByText("REST DAY")).toBeTruthy();
    expect(screen.queryByText("FOCUS · SELECT ONE OR MORE")).toBeNull();
  });

  it("navigates back to plan when there are no unsaved changes", () => {
    useWorkoutStore.setState({
      weeklySchedule: {
        Wed: {
          type: "gym",
          focuses: ["Upper Body"],
          exercises: [{ name: "Push-Up" }],
        },
      },
    });

    renderDaySetup();
    fireEvent.press(screen.getByText("← BACK"));

    expect(router.navigate).toHaveBeenCalledWith("/plan");
    expect(confirmDestructive).not.toHaveBeenCalled();
  });

  it("prompts before leaving with unsaved changes", () => {
    renderDaySetup();

    fireEvent.press(screen.getByText("Select focus areas..."));
    fireEvent.press(screen.getByText("💪 Upper Body"));
    fireEvent.press(screen.getByText("← BACK"));

    expect(confirmDestructive).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Unsaved Changes",
        confirmLabel: "Discard",
      }),
    );
  });

  it("only shows add exercise when a focus is selected in edit mode", () => {
    renderDaySetup();

    expect(screen.queryByText("+ ADD EXERCISE")).toBeNull();

    fireEvent.press(screen.getByText("Select focus areas..."));
    fireEvent.press(screen.getByText("💪 Upper Body"));

    expect(screen.getByText("+ ADD EXERCISE")).toBeTruthy();
  });
});
