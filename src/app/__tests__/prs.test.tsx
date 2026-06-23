import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import React from "react";
import { render, screen } from "@testing-library/react-native";
import PRsScreen from "../prs";
import { useWorkoutStore } from "../../store/workoutStore";
import { ThemeProvider } from "../../context/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Session } from "../../types";

const TEST_SAFE_AREA = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const SAMPLE_DAY = new Date(2026, 5, 17, 12, 0, 0);

function renderPRs() {
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA}>
      <ThemeProvider>
        <PRsScreen />
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

describe("PRsScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(SAMPLE_DAY);
    resetStore();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows empty state when there are no sessions", () => {
    renderPRs();

    expect(screen.getByText("NO PRs YET")).toBeTruthy();
    expect(screen.getByText("Log sessions to see your records here")).toBeTruthy();
  });

  it("renders weighted lift PRs with primary and secondary values", () => {
    useWorkoutStore.setState({
      sessions: [
        {
          id: "1",
          date: "2026-06-17T10:00:00.000Z",
          exercises: [
            {
              name: "Hip Thrust (Barbell)",
              sets: [{ weight: 100, reps: 5 }],
            },
          ],
        },
      ],
    });

    renderPRs();

    expect(screen.getByText("RECORDS")).toBeTruthy();
    expect(screen.getByText("1 LIFT TRACKED")).toBeTruthy();
    expect(screen.getByText("Hip Thrust (Barbell)")).toBeTruthy();
    expect(screen.getByText("100kg")).toBeTruthy();
    expect(screen.getByText("5 reps")).toBeTruthy();
    expect(screen.getByText("WED, 17 JUN 2026")).toBeTruthy();
  });

  it("renders bodyweight PRs without a kg value", () => {
    useWorkoutStore.setState({
      sessions: [
        {
          id: "1",
          date: "2026-06-17T10:00:00.000Z",
          exercises: [
            {
              name: "Push-Up",
              sets: [{ weight: 0, reps: 20 }],
            },
          ],
        },
      ],
    });

    renderPRs();

    expect(screen.getByText("20")).toBeTruthy();
    expect(screen.getByText("reps")).toBeTruthy();
    expect(screen.queryByText("0kg")).toBeNull();
  });

  it("renders timed PRs in seconds without a secondary label", () => {
    useWorkoutStore.setState({
      sessions: [
        {
          id: "1",
          date: "2026-06-17T10:00:00.000Z",
          exercises: [
            {
              name: "Jump Rope",
              sets: [{ weight: 0, reps: 45 }],
            },
          ],
        },
      ],
    });

    renderPRs();

    expect(screen.getByText("45s")).toBeTruthy();
    expect(screen.queryByText("reps")).toBeNull();
  });

  it("uses plural lift count when multiple exercises have PRs", () => {
    const sessions: Session[] = [
      {
        id: "1",
        date: "2026-06-17T10:00:00.000Z",
        exercises: [
          { name: "Push-Up", sets: [{ weight: 0, reps: 15 }] },
          { name: "Hip Thrust (Barbell)", sets: [{ weight: 100, reps: 5 }] },
        ],
      },
    ];
    useWorkoutStore.setState({ sessions });

    renderPRs();

    expect(screen.getByText("2 LIFTS TRACKED")).toBeTruthy();
    expect(screen.getByText("Push-Up")).toBeTruthy();
    expect(screen.getByText("Hip Thrust (Barbell)")).toBeTruthy();
  });
});
