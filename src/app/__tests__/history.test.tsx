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
import { getCalendarDayKey } from "../../utils/sessionHistory";
import { confirmDestructive } from "../../utils/alerts";

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
  const { confirmDestructive } = require("../../utils/alerts");
  return function MockDeleteIconButton({
    onDelete,
    title,
    message,
  }: {
    onDelete: () => void;
    title?: string;
    message?: string;
  }) {
    return React.createElement(
      Pressable,
      {
        onPress: () =>
          confirmDestructive({
            title: title ?? "Delete",
            message: message ?? "Are you sure?",
            onConfirm: onDelete,
          }),
        accessibilityLabel: "delete-day",
      },
      React.createElement(Text, null, "Delete"),
    );
  };
});

const mockConfirmDestructive = confirmDestructive as jest.MockedFunction<
  typeof confirmDestructive
>;

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
    finishedForTodayDate: null,
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

  it("renders day count and exercise tags", () => {
    useWorkoutStore.setState({
      sessions: [
        {
          id: "session-weighted",
          date: "2026-06-17T10:00:00.000Z",
          exercises: [
            {
              name: "Hip Thrust (Barbell)",
              sets: [{ weight: 100, reps: 8 }],
            },
          ],
        },
      ],
    });

    renderHistory();

    expect(screen.getByText("HISTORY")).toBeTruthy();
    expect(screen.getByText("1 DAY LOGGED")).toBeTruthy();
    expect(screen.getByText("Hip Thrust (Barbell)")).toBeTruthy();
    expect(screen.getByText("top 100kg")).toBeTruthy();
  });

  it("groups multiple sessions from the same day", () => {
    useWorkoutStore.setState({
      sessions: [
        SESSION,
        {
          id: "session-2",
          date: "2026-06-17T18:00:00.000Z",
          exercises: [{ name: "Plank", sets: [{ weight: 0, reps: 60 }] }],
        },
      ],
    });

    renderHistory();

    expect(screen.getByText("1 DAY LOGGED")).toBeTruthy();
    expect(screen.getByText("2 sessions")).toBeTruthy();
    expect(screen.getByText("3 exercises · 4 sets")).toBeTruthy();
    expect(screen.getByText("Plank")).toBeTruthy();
  });

  it("shows tags when collapsed and set details when expanded", () => {
    useWorkoutStore.setState({ sessions: [SESSION] });

    renderHistory();

    expect(screen.getByText("Hip Thrust (Barbell)")).toBeTruthy();
    expect(screen.queryByText(/100kg × 8/)).toBeNull();

    fireEvent.press(screen.getByText("TODAY"));
    expect(screen.getByText(/100kg × 8/)).toBeTruthy();
  });

  it("auto-expands a day from the expand route param", () => {
    mockUseLocalSearchParams.mockReturnValue({
      expand: getCalendarDayKey(SESSION.date),
    });
    useWorkoutStore.setState({ sessions: [SESSION] });

    renderHistory();

    expect(screen.getByText(/0kg × 12/)).toBeTruthy();
    expect(screen.getByText(/100kg × 8/)).toBeTruthy();
  });

  it("expands and collapses a day when the card is pressed", () => {
    useWorkoutStore.setState({ sessions: [SESSION] });

    renderHistory();

    expect(screen.queryByText(/0kg × 12/)).toBeNull();

    fireEvent.press(screen.getByText("TODAY"));
    expect(screen.getByText(/0kg × 12/)).toBeTruthy();

    fireEvent.press(screen.getByText("TODAY"));
    expect(screen.queryByText(/0kg × 12/)).toBeNull();
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

    mockUseLocalSearchParams.mockReturnValue({
      expand: getCalendarDayKey("2026-06-17T10:00:00.000Z"),
    });
    renderHistory();

    expect(screen.getByText(/20kg × 10 per leg/)).toBeTruthy();
    expect(screen.queryByText(/per leg reps/)).toBeNull();
  });

  it("asks for confirmation before deleting a workout day", () => {
    useWorkoutStore.setState({ sessions: [SESSION] });

    renderHistory();
    fireEvent.press(screen.getByLabelText("delete-day"));

    expect(confirmDestructive).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Delete workout day",
        message: expect.stringContaining("reset your progress for that day"),
      }),
    );
  });

  it("deletes all sessions for a day from the store", async () => {
    useWorkoutStore.setState({
      sessions: [
        SESSION,
        {
          id: "session-2",
          date: "2026-06-17T18:00:00.000Z",
          exercises: [{ name: "Plank", sets: [{ weight: 0, reps: 60 }] }],
        },
        {
          id: "session-3",
          date: "2026-06-16T10:00:00.000Z",
          exercises: [{ name: "Push-Up", sets: [{ weight: 0, reps: 10 }] }],
        },
      ],
    });

    renderHistory();
    fireEvent.press(screen.getAllByLabelText("delete-day")[0]);
    const onConfirm = mockConfirmDestructive.mock.calls[0][0].onConfirm;
    await act(async () => {
      onConfirm();
    });

    expect(useWorkoutStore.getState().sessions).toHaveLength(1);
    expect(useWorkoutStore.getState().sessions[0].id).toBe("session-3");
  });

  it("clears finished-for-today when deleting today's workout", async () => {
    useWorkoutStore.setState({
      sessions: [SESSION],
      finishedForTodayDate: SESSION.date,
    });

    renderHistory();
    fireEvent.press(screen.getByLabelText("delete-day"));
    const onConfirm = mockConfirmDestructive.mock.calls[0][0].onConfirm;
    await act(async () => {
      onConfirm();
    });

    expect(useWorkoutStore.getState().sessions).toEqual([]);
    expect(useWorkoutStore.getState().finishedForTodayDate).toBeNull();
  });
});
