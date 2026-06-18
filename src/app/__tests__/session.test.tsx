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
import { router } from "expo-router";
import SessionScreen from "../session";
import { useWorkoutStore } from "../../store/workoutStore";
import { ThemeProvider } from "../../context/ThemeContext";
import { confirmDestructive } from "../../utils/alerts";
import { Session } from "../../types";

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

jest.mock("../../hooks/useExerciseInfoSheet", () => ({
  useExerciseInfoSheet: () => ({
    exerciseName: null,
    openInfo: jest.fn(),
    closeInfo: jest.fn(),
  }),
}));

function renderSession() {
  return render(
    <ThemeProvider>
      <SessionScreen />
    </ThemeProvider>,
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

  it("warns about incomplete exercises before saving partial progress", () => {
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
      "Incomplete exercises",
      "You haven't logged sets for Hip Thrust (Barbell). Only exercises with sets will be saved.",
      expect.any(Array),
    );
  });

  it("finishes and navigates home when saving partial progress", async () => {
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

    const save = getAlertButtons(Alert.alert as jest.Mock).find(
      (b) => b.text === "Save progress",
    );
    await act(async () => {
      await save?.onPress?.();
    });

    expect(useWorkoutStore.getState().activeSession).toBeNull();
    expect(useWorkoutStore.getState().sessions).toHaveLength(1);
    expect(useWorkoutStore.getState().sessions[0].exercises).toEqual([
      { name: "Push-Up", sets: [{ weight: 0, reps: 12 }] },
    ]);
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("asks for confirmation when all exercises have sets", () => {
    setActiveSession({
      id: "1",
      date: "2026-06-17T10:00:00.000Z",
      exercises: [{ name: "Push-Up", sets: [{ weight: 0, reps: 12 }] }],
    });

    renderSession();
    fireEvent.press(screen.getByText("FINISH SESSION ✓"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Finish Session",
      "Are you sure you want to finish your session?",
      expect.any(Array),
    );
  });

  it("finishes the session after full-workout confirmation", async () => {
    setActiveSession({
      id: "1",
      date: "2026-06-17T10:00:00.000Z",
      exercises: [{ name: "Push-Up", sets: [{ weight: 0, reps: 12 }] }],
    });

    renderSession();
    fireEvent.press(screen.getByText("FINISH SESSION ✓"));

    const finish = getAlertButtons(Alert.alert as jest.Mock).find(
      (b) => b.text === "Finish",
    );
    await act(async () => {
      await finish?.onPress?.();
    });

    expect(useWorkoutStore.getState().sessions).toHaveLength(1);
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
});
