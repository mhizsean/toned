import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { router } from "expo-router";
import HomeScreen from "../index";
import { useWorkoutStore } from "../../store/workoutStore";
import { ThemeProvider } from "../../context/ThemeContext";
import { Session } from "../../types";

jest.mock("expo-router", () => {
  const React = require("react");
  return {
    router: {
      push: jest.fn(),
      navigate: jest.fn(),
      replace: jest.fn(),
    },
    useFocusEffect: (callback: () => void) => {
      React.useEffect(() => callback(), [callback]);
    },
  };
});

jest.mock("../../constants/planning", () => ({
  getToday: () => "Wed",
  DAYS: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
}));

jest.mock("../../components/TodayPlanSheet", () => {
  const React = require("react");
  const { View, Text, Pressable } = require("react-native");

  return function MockTodayPlanSheet({
    visible,
    onStartWithPlan,
    onStartBlank,
    onClose,
  }: {
    visible: boolean;
    onStartWithPlan: () => void;
    onStartBlank: () => void;
    onClose: () => void;
  }) {
    if (!visible) return null;

    return React.createElement(
      View,
      null,
      React.createElement(Text, null, "TodayPlanSheet"),
      React.createElement(
        Pressable,
        { onPress: onStartWithPlan },
        React.createElement(Text, null, "Start with plan"),
      ),
      React.createElement(
        Pressable,
        { onPress: onStartBlank },
        React.createElement(Text, null, "Start blank"),
      ),
      React.createElement(
        Pressable,
        { onPress: onClose },
        React.createElement(Text, null, "Close sheet"),
      ),
    );
  };
});

const TODAY_ISO = "2026-06-17T10:00:00.000Z";
const SAMPLE_DAY = new Date(2026, 5, 17, 12, 0, 0);

function renderHome() {
  return render(
    <ThemeProvider>
      <HomeScreen />
    </ThemeProvider>,
  );
}

function resetStore() {
  useWorkoutStore.setState({
    sessions: [],
    activeSession: null,
    scheduleLoaded: false,
    libraryExercises: ["Push-Up"],
    weeklySchedule: {},
  });
}

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(SAMPLE_DAY);
    jest.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    resetStore();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renders the dashboard header and stats", () => {
    renderHome();

    expect(screen.getByText("TONED")).toBeTruthy();
    expect(screen.getByText("SESSIONS")).toBeTruthy();
    expect(screen.getByText("THIS WEEK")).toBeTruthy();
    expect(screen.getByText("PRs")).toBeTruthy();
    expect(screen.getAllByText("0")).toHaveLength(3);
  });

  it("shows a setup prompt when the library is empty", () => {
    useWorkoutStore.setState({ libraryExercises: [] });

    renderHome();

    expect(screen.getByText("GET SET UP FIRST")).toBeTruthy();
    expect(
      screen.getByText("Go to Plan → Library to add exercises"),
    ).toBeTruthy();
    expect(screen.queryByText("＋ START WORKOUT")).toBeTruthy();

    fireEvent.press(screen.getByText("Go to Plan → Library to add exercises"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/plan",
      params: { tab: "library" },
    });
  });

  it("shows start workout when no active session and plan is incomplete", () => {
    useWorkoutStore.setState({
      weeklySchedule: {
        Wed: {
          type: "gym",
          focuses: ["Upper Body"],
          exercises: [{ name: "Push-Up" }],
        },
      },
    });

    renderHome();

    expect(screen.getByText("＋ START WORKOUT")).toBeTruthy();
    expect(screen.queryByText("DONE FOR TODAY ✓")).toBeNull();
    expect(screen.getByText(/1 exercises loaded/)).toBeTruthy();
  });

  it("shows resume banner when a session is in progress", () => {
    useWorkoutStore.setState({
      activeSession: {
        id: "active-1",
        date: TODAY_ISO,
        exercises: [{ name: "Push-Up", sets: [] }],
      },
      weeklySchedule: {
        Wed: {
          type: "gym",
          focuses: ["Upper Body"],
          exercises: [{ name: "Push-Up" }],
        },
      },
    });

    renderHome();

    expect(screen.getByText("SESSION IN PROGRESS")).toBeTruthy();
    expect(screen.getByText("1 exercise logged")).toBeTruthy();
    expect(screen.queryByText("＋ START WORKOUT")).toBeNull();

    fireEvent.press(screen.getByText("RESUME →"));
    expect(router.push).toHaveBeenCalledWith("/session");
  });

  it("shows done for today when the plan is complete", () => {
    useWorkoutStore.setState({
      weeklySchedule: {
        Wed: {
          type: "gym",
          focuses: ["Upper Body"],
          exercises: [{ name: "Push-Up" }],
        },
      },
      sessions: [
        {
          id: "1",
          date: TODAY_ISO,
          exercises: [{ name: "Push-Up", sets: [{ weight: 0, reps: 12 }] }],
        },
      ],
    });

    renderHome();

    expect(screen.getByText("DONE FOR TODAY ✓")).toBeTruthy();
    expect(
      screen.getByText("You crushed it — rest up and come back tomorrow."),
    ).toBeTruthy();
    expect(screen.getByText(/all exercises logged/)).toBeTruthy();
    expect(screen.queryByText("＋ START WORKOUT")).toBeNull();
  });

  it("shows rest day messaging", () => {
    useWorkoutStore.setState({
      weeklySchedule: {
        Wed: {
          type: "rest",
          focuses: [],
          exercises: [],
        },
      },
    });

    renderHome();

    expect(screen.getByText("😴 Rest day — take it easy")).toBeTruthy();
  });

  it("opens the today plan sheet when starting with a configured plan", () => {
    useWorkoutStore.setState({
      weeklySchedule: {
        Wed: {
          type: "gym",
          focuses: ["Upper Body"],
          exercises: [{ name: "Push-Up" }, { name: "Hip Thrust (Barbell)" }],
        },
      },
    });

    renderHome();
    fireEvent.press(screen.getByText("＋ START WORKOUT"));

    expect(screen.getByText("TodayPlanSheet")).toBeTruthy();
    expect(router.push).not.toHaveBeenCalled();
  });

  it("starts a blank session when there is no today plan", () => {
    renderHome();
    fireEvent.press(screen.getByText("＋ START WORKOUT"));

    expect(screen.queryByText("TodayPlanSheet")).toBeNull();
    expect(useWorkoutStore.getState().activeSession).not.toBeNull();
    expect(router.push).toHaveBeenCalledWith("/session");
  });

  it("starts with today plan exercises from the sheet", () => {
    useWorkoutStore.setState({
      weeklySchedule: {
        Wed: {
          type: "gym",
          focuses: ["Upper Body"],
          exercises: [{ name: "Push-Up" }],
        },
      },
    });

    renderHome();
    fireEvent.press(screen.getByText("＋ START WORKOUT"));
    fireEvent.press(screen.getByText("Start with plan"));

    const { activeSession } = useWorkoutStore.getState();
    expect(activeSession?.exercises).toEqual([{ name: "Push-Up", sets: [] }]);
    expect(router.push).toHaveBeenCalledWith("/session");
    expect(screen.queryByText("TodayPlanSheet")).toBeNull();
  });

  it("starts a blank session from the today plan sheet", () => {
    useWorkoutStore.setState({
      weeklySchedule: {
        Wed: {
          type: "gym",
          focuses: ["Upper Body"],
          exercises: [{ name: "Push-Up" }],
        },
      },
    });

    renderHome();
    fireEvent.press(screen.getByText("＋ START WORKOUT"));
    fireEvent.press(screen.getByText("Start blank"));

    expect(useWorkoutStore.getState().activeSession?.exercises).toEqual([]);
    expect(router.push).toHaveBeenCalledWith("/session");
  });

  it("navigates to history when a recent session is tapped", () => {
    const sessions: Session[] = [
      {
        id: "recent-1",
        date: TODAY_ISO,
        exercises: [{ name: "Push-Up", sets: [{ weight: 0, reps: 12 }] }],
      },
    ];
    useWorkoutStore.setState({ sessions });

    renderHome();
    fireEvent.press(screen.getByText("1 exercise →"));

    expect(router.navigate).toHaveBeenCalledWith({
      pathname: "/history",
      params: { expand: "recent-1" },
    });
  });

  it("shows up to three recent sessions", () => {
    const sessions: Session[] = Array.from({ length: 4 }, (_, index) => ({
      id: `session-${index}`,
      date: TODAY_ISO,
      exercises: [{ name: "Push-Up", sets: [{ weight: 0, reps: 10 }] }],
    }));
    useWorkoutStore.setState({ sessions });

    renderHome();

    expect(screen.getByText("RECENT SESSIONS")).toBeTruthy();
    expect(screen.getAllByText("1 exercise →")).toHaveLength(3);
  });
});
