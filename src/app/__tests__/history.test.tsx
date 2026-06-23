import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import HistoryScreen from "../history";
import { useWorkoutStore } from "../../store/workoutStore";
import { ThemeProvider } from "../../context/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Session } from "../../types";

const TEST_SAFE_AREA = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock("../../utils/alerts", () => ({
  confirmDestructive: jest.fn(),
}));

jest.mock("../../components/DeleteIconButton", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return function MockDeleteIconButton({
    onDelete,
  }: {
    onDelete: () => void;
  }) {
    return React.createElement(
      Pressable,
      { onPress: onDelete, accessibilityLabel: "delete-session" },
      React.createElement(Text, null, "Delete"),
    );
  };
});

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;

const SAMPLE_DAY = new Date(2026, 5, 17, 12, 0, 0);
const SESSION: Session = {
  id: "session-1",
  date: "2026-06-17T10:00:00.000Z",
  exercises: [
    {
      name: "Push-Up",
      sets: [
        { weight: 0, reps: 12 },
        { weight: 0, reps: 15 },
      ],
    },
    {
      name: "Hip Thrust (Barbell)",
      sets: [{ weight: 100, reps: 8 }],
    },
  ],
};

function renderHistory() {
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA}>
      <ThemeProvider>
        <HistoryScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

function resetStore() {
  useWorkoutStore.setState({
    sessions: [],
    activeSession: null,
    scheduleLoaded: false,
    libraryExercises: [],
    weeklySchedule: {},
  });
}

describe("HistoryScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(SAMPLE_DAY);
    mockUseLocalSearchParams.mockReturnValue({});
    resetStore();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows empty state when there are no sessions", () => {
    renderHistory();

    expect(screen.getByText("NO HISTORY")).toBeTruthy();
    expect(screen.getByText("Complete a session to see it here")).toBeTruthy();
  });

  it("renders session count and exercise tags", () => {
    useWorkoutStore.setState({ sessions: [SESSION] });

    renderHistory();

    expect(screen.getByText("HISTORY")).toBeTruthy();
    expect(screen.getByText("1 SESSIONS LOGGED")).toBeTruthy();
    expect(screen.getByText("Push-Up")).toBeTruthy();
    expect(screen.getByText("Hip Thrust (Barbell)")).toBeTruthy();
    expect(screen.getByText("top 100kg")).toBeTruthy();
  });

  it("auto-expands a session from the expand route param", () => {
    mockUseLocalSearchParams.mockReturnValue({ expand: "session-1" });
    useWorkoutStore.setState({ sessions: [SESSION] });

    renderHistory();

    expect(screen.getByText("0kg × 12")).toBeTruthy();
    expect(screen.getByText("100kg × 8")).toBeTruthy();
  });

  it("expands and collapses a session when the card is pressed", () => {
    useWorkoutStore.setState({ sessions: [SESSION] });

    renderHistory();

    expect(screen.queryByText("0kg × 12")).toBeNull();

    fireEvent.press(screen.getByText("WED, 17 JUN 2026"));
    expect(screen.getByText("0kg × 12")).toBeTruthy();

    fireEvent.press(screen.getByText("WED, 17 JUN 2026"));
    expect(screen.queryByText("0kg × 12")).toBeNull();
  });

  it("formats sets without an extra reps suffix", () => {
    useWorkoutStore.setState({
      sessions: [
        {
          id: "session-2",
          date: "2026-06-17T10:00:00.000Z",
          exercises: [
            {
              name: "Bulgarian Split Squat",
              sets: [{ weight: 20, reps: 10 }],
            },
          ],
        },
      ],
    });

    mockUseLocalSearchParams.mockReturnValue({ expand: "session-2" });
    renderHistory();

    expect(screen.getByText("20kg × 10 per leg")).toBeTruthy();
    expect(screen.queryByText(/per leg reps/)).toBeNull();
  });

  it("deletes a session from the store", async () => {
    useWorkoutStore.setState({ sessions: [SESSION] });

    renderHistory();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("delete-session"));
    });

    expect(useWorkoutStore.getState().sessions).toEqual([]);
  });
});
