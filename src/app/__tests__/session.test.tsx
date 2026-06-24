import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import React from "react";
import { Alert } from "react-native";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import { router } from "expo-router";
import SessionScreen from "../session";
import { useWorkoutStore } from "../../store/workoutStore";
import { ThemeProvider } from "../../context/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { confirmDestructive } from "../../utils/alerts";
import { Session } from "../../types";

const TEST_SAFE_AREA = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock("../../utils/alerts", () => ({
  confirmDestructive: jest.fn(),
}));

jest.mock("../../components/ExercisePicker", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function MockExercisePicker() {
    return React.createElement(Text, null, "ExercisePicker");
  };
});

jest.mock("../../components/ExerciseInfoSheet", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function MockExerciseInfoSheet() {
    return React.createElement(Text, null, "ExerciseInfoSheet");
  };
});

jest.mock("../../components/ExerciseInfoButton", () => {
  const React = require("react");
  const { Text, Pressable } = require("react-native");
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
  const { Text, Pressable } = require("react-native");
  return function MockRemoveButton({ onPress }: { onPress: () => void }) {
    return React.createElement(
      Pressable,
      { onPress, accessibilityLabel: "remove-set" },
      React.createElement(Text, null, "Remove"),
    );
  };
});

jest.mock("../../components/DurationPickerSheet", () => {
  const React = require("react");
  const { Text, Pressable } = require("react-native");
  return function MockDurationPickerSheet({
    visible,
    onConfirm,
  }: {
    visible: boolean;
    onConfirm: (seconds: number) => void;
  }) {
    if (!visible) return null;
    return React.createElement(
      Pressable,
      { onPress: () => onConfirm(60), accessibilityLabel: "confirm-duration" },
      React.createElement(Text, null, "DurationPicker"),
    );
  };
});

jest.mock("../../hooks/useExerciseInfoSheet", () => ({
  useExerciseInfoSheet: () => ({
    exerciseName: null,
    openInfo: jest.fn(),
    closeInfo: jest.fn(),
  }),
}));

function renderSession() {
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA}>
      <ThemeProvider>
        <SessionScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

function setActiveSession(session: Session | null) {
  useWorkoutStore.setState({
    activeSession: session,
    libraryExercises: ["Push-Up", "Hip Thrust (Barbell)", "Plank"],
  });
}

function getAlertButtons(mock: jest.Mock) {
  return mock.mock.calls[mock.mock.calls.length - 1][2] as Array<{
    text: string;
    onPress?: () => void;
  }>;
}

describe("SessionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWorkoutStore.setState({
      sessions: [],
      activeSession: null,
      finishedForTodayDate: null,
      scheduleLoaded: false,
      libraryExercises: [],
      weeklySchedule: {},
    });
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  it("redirects home when there is no active session", () => {
    setActiveSession(null);
    renderSession();
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("renders session header and exercises", () => {
    setActiveSession({
      id: "1",
      date: "2026-06-17T10:00:00.000Z",
      exercises: [
        { name: "Push-Up", sets: [{ weight: 0, reps: 12 }] },
        { name: "Hip Thrust (Barbell)", sets: [] },
      ],
    });

    renderSession();

    expect(screen.getByText("SESSION")).toBeTruthy();
    expect(screen.getByText("2 exercises logged")).toBeTruthy();
    expect(screen.getByText("Push-Up")).toBeTruthy();
    expect(screen.getByText("Hip Thrust (Barbell)")).toBeTruthy();
    expect(screen.getByText("FINISH SESSION ✓")).toBeTruthy();
  });

  it("prompts to discard when finishing with no sets logged", () => {
    setActiveSession({
      id: "1",
      date: "2026-06-17T10:00:00.000Z",
      exercises: [{ name: "Push-Up", sets: [] }],
    });

    renderSession();
    fireEvent.press(screen.getByText("FINISH SESSION ✓"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Nothing logged yet",
      "You haven't recorded any sets. Discard this session instead?",
      expect.any(Array),
    );
  });

  it("discards the session when confirming empty finish", () => {
    setActiveSession({
      id: "1",
      date: "2026-06-17T10:00:00.000Z",
      exercises: [{ name: "Push-Up", sets: [] }],
    });

    renderSession();
    fireEvent.press(screen.getByText("FINISH SESSION ✓"));

    const discard = getAlertButtons(Alert.alert as jest.Mock).find(
      (b) => b.text === "Discard",
    );
    act(() => {
      discard?.onPress?.();
    });

    expect(useWorkoutStore.getState().activeSession).toBeNull();
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("asks how to leave when exercises are incomplete", () => {
    setActiveSession({
      id: "1",
      date: "2026-06-17T10:00:00.000Z",
      exercises: [
        { name: "Push-Up", sets: [{ weight: 0, reps: 12 }] },
        { name: "Hip Thrust (Barbell)", sets: [] },
      ],
    });

    renderSession();
    fireEvent.press(screen.getByText("FINISH SESSION ✓"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Leave session?",
      expect.stringContaining("Hip Thrust (Barbell)"),
      expect.any(Array),
    );
  });

  it("keeps the active session when continuing later", () => {
    setActiveSession({
      id: "1",
      date: "2026-06-17T10:00:00.000Z",
      exercises: [
        { name: "Push-Up", sets: [{ weight: 0, reps: 12 }] },
        { name: "Hip Thrust (Barbell)", sets: [] },
      ],
    });

    renderSession();
    fireEvent.press(screen.getByText("FINISH SESSION ✓"));

    const continueLater = getAlertButtons(Alert.alert as jest.Mock).find(
      (b) => b.text === "Continue later",
    );
    act(() => {
      continueLater?.onPress?.();
    });

    expect(useWorkoutStore.getState().activeSession).not.toBeNull();
    expect(useWorkoutStore.getState().finishedForTodayDate).toBeNull();
    expect(useWorkoutStore.getState().sessions).toHaveLength(0);
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("finishes and navigates home when finishing for today with partial progress", async () => {
    setActiveSession({
      id: "1",
      date: "2026-06-17T10:00:00.000Z",
      exercises: [
        { name: "Push-Up", sets: [{ weight: 0, reps: 12 }] },
        { name: "Hip Thrust (Barbell)", sets: [] },
      ],
    });

    renderSession();
    fireEvent.press(screen.getByText("FINISH SESSION ✓"));

    const finish = getAlertButtons(Alert.alert as jest.Mock).find(
      (b) => b.text === "Finish for today",
    );
    await act(async () => {
      await finish?.onPress?.();
    });

    expect(useWorkoutStore.getState().activeSession).toBeNull();
    expect(useWorkoutStore.getState().finishedForTodayDate).not.toBeNull();
    expect(useWorkoutStore.getState().sessions).toHaveLength(1);
    expect(useWorkoutStore.getState().sessions[0].exercises).toEqual([
      { name: "Push-Up", sets: [{ weight: 0, reps: 12 }] },
    ]);
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("asks how to leave when all exercises have sets", () => {
    setActiveSession({
      id: "1",
      date: "2026-06-17T10:00:00.000Z",
      exercises: [{ name: "Push-Up", sets: [{ weight: 0, reps: 12 }] }],
    });

    renderSession();
    fireEvent.press(screen.getByText("FINISH SESSION ✓"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Leave session?",
      expect.stringContaining("Continue later"),
      expect.any(Array),
    );
  });

  it("finishes the session after choosing finish for today", async () => {
    setActiveSession({
      id: "1",
      date: "2026-06-17T10:00:00.000Z",
      exercises: [{ name: "Push-Up", sets: [{ weight: 0, reps: 12 }] }],
    });

    renderSession();
    fireEvent.press(screen.getByText("FINISH SESSION ✓"));

    const finish = getAlertButtons(Alert.alert as jest.Mock).find(
      (b) => b.text === "Finish for today",
    );
    await act(async () => {
      await finish?.onPress?.();
    });

    expect(useWorkoutStore.getState().sessions).toHaveLength(1);
    expect(useWorkoutStore.getState().activeSession).toBeNull();
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("keeps the active session when continuing later with a complete workout", () => {
    setActiveSession({
      id: "1",
      date: "2026-06-17T10:00:00.000Z",
      exercises: [{ name: "Push-Up", sets: [{ weight: 0, reps: 12 }] }],
    });

    renderSession();
    fireEvent.press(screen.getByText("FINISH SESSION ✓"));

    const continueLater = getAlertButtons(Alert.alert as jest.Mock).find(
      (b) => b.text === "Continue later",
    );
    act(() => {
      continueLater?.onPress?.();
    });

    expect(useWorkoutStore.getState().activeSession).not.toBeNull();
    expect(useWorkoutStore.getState().finishedForTodayDate).toBeNull();
    expect(useWorkoutStore.getState().sessions).toHaveLength(0);
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("opens discard confirmation from the header", () => {
    setActiveSession({
      id: "1",
      date: "2026-06-17T10:00:00.000Z",
      exercises: [{ name: "Push-Up", sets: [{ weight: 0, reps: 12 }] }],
    });

    renderSession();
    fireEvent.press(screen.getByText("DISCARD"));

    expect(confirmDestructive).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Discard Session",
        confirmLabel: "Discard",
      }),
    );
  });

  it("shows logged set details when an exercise is expanded", () => {
    setActiveSession({
      id: "1",
      date: "2026-06-17T10:00:00.000Z",
      exercises: [{ name: "Push-Up", sets: [{ weight: 0, reps: 12 }] }],
    });

    renderSession();
    fireEvent.press(screen.getByText("Push-Up"));

    expect(screen.getByText(/0kg × 12/)).toBeTruthy();
  });

  it("does not add a set when inputs are incomplete", () => {
    setActiveSession({
      id: "1",
      date: "2026-06-17T10:00:00.000Z",
      exercises: [{ name: "Hip Thrust (Barbell)", sets: [] }],
    });

    renderSession();
    fireEvent.press(screen.getByText("Hip Thrust (Barbell)"));

    const kgInput = screen.getByPlaceholderText("kg");
    const repsInput = screen.getByPlaceholderText("reps");

    fireEvent.changeText(kgInput, ".");
    fireEvent.changeText(repsInput, "5");
    fireEvent.press(screen.getByText("+ SET"));

    expect(useWorkoutStore.getState().activeSession?.exercises[0].sets).toEqual(
      [],
    );
  });

  it("does not add a set when reps are zero", () => {
    setActiveSession({
      id: "1",
      date: "2026-06-17T10:00:00.000Z",
      exercises: [{ name: "Bulgarian Split Squat", sets: [] }],
    });

    renderSession();
    fireEvent.press(screen.getByText("Bulgarian Split Squat"));

    fireEvent.changeText(screen.getByPlaceholderText("kg"), "20");
    fireEvent.changeText(screen.getByPlaceholderText("reps/leg"), "0");
    fireEvent.press(screen.getByText("+ SET"));

    expect(useWorkoutStore.getState().activeSession?.exercises[0].sets).toEqual(
      [],
    );
  });

  it("logs timed sets from the duration picker", () => {
    setActiveSession({
      id: "1",
      date: "2026-06-17T10:00:00.000Z",
      exercises: [{ name: "Plank", sets: [] }],
    });

    renderSession();
    fireEvent.press(screen.getByText("Plank"));
    fireEvent.press(screen.getByText("add time"));
    fireEvent.press(screen.getByLabelText("confirm-duration"));
    fireEvent.press(screen.getByText("+ SET"));

    expect(useWorkoutStore.getState().activeSession?.exercises[0].sets).toEqual(
      [{ weight: 0, reps: 60 }],
    );
    expect(screen.getAllByText(/1m/).length).toBeGreaterThan(0);
  });
});
