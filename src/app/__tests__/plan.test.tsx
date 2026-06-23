import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
} from "@jest/globals";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { router } from "expo-router";
import PlanScreen from "../plan";
import { useWorkoutStore } from "../../store/workoutStore";
import { ThemeProvider } from "../../context/ThemeContext";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock("../../constants/planning", () => {
  const actual = jest.requireActual("../../constants/planning") as {
    getTypeBadge: (colors: import("../../constants/theme").ColorScheme) => Record<
      string,
      { label: string; color: string }
    >;
  };

  return {
    TODAY: "Wed",
    DAYS: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    getTypeBadge: actual.getTypeBadge,
  };
});

jest.mock("../../components/AddExerciseSheet", () => {
  const React = require("react");
  const { View, Text, Pressable } = require("react-native");
  return function MockAddExerciseSheet({
    visible,
    onClose,
  }: {
    visible: boolean;
    onClose: () => void;
  }) {
    if (!visible) return null;
    return React.createElement(
      View,
      null,
      React.createElement(Text, null, "AddExerciseSheet"),
      React.createElement(
        Pressable,
        { onPress: onClose },
        React.createElement(Text, null, "Close sheet"),
      ),
    );
  };
});

function renderPlan() {
  return render(
    <ThemeProvider>
      <PlanScreen />
    </ThemeProvider>,
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

describe("PlanScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  it("renders the schedule tab with all weekdays", () => {
    renderPlan();

    expect(screen.getByText("YOUR PLAN")).toBeTruthy();
    expect(screen.getByText("SCHEDULE")).toBeTruthy();
    expect(screen.getByText("Mon")).toBeTruthy();
    expect(screen.getByText("Sun")).toBeTruthy();
  });

  it("highlights today and shows configured schedule details", () => {
    useWorkoutStore.setState({
      weeklySchedule: {
        Wed: {
          type: "gym",
          focuses: ["Upper Body"],
          exercises: [{ name: "Push-Up" }, { name: "Hip Thrust (Barbell)" }],
        },
      },
    });

    renderPlan();

    expect(screen.getByText("TODAY")).toBeTruthy();
    expect(screen.getByText("💪 Upper Body")).toBeTruthy();
    expect(screen.getByText("Push-Up")).toBeTruthy();
    expect(screen.getByText("Hip Thrust (Barbell)")).toBeTruthy();
  });

  it("shows setup prompt for days without a schedule", () => {
    renderPlan();

    expect(screen.getAllByText("Tap to set up this day")).toHaveLength(7);
  });

  it("navigates to day setup when a day card is pressed", () => {
    renderPlan();

    fireEvent.press(screen.getByText("Wed"));

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/day-setup",
      params: { day: "Wed" },
    });
  });

  it("shows empty library state on the library tab", () => {
    renderPlan();

    fireEvent.press(screen.getByText("LIBRARY"));

    expect(screen.getByText("NO EXERCISES YET")).toBeTruthy();
    expect(screen.getByText("+ ADD EXERCISES")).toBeTruthy();
  });

  it("lists library exercises grouped by category", () => {
    useWorkoutStore.setState({
      libraryExercises: ["Push-Up", "Jump Rope"],
    });

    renderPlan();
    fireEvent.press(screen.getByText("LIBRARY"));

    expect(screen.getByText("FILTER BY TAG")).toBeTruthy();
    expect(screen.getByText("Upper Body")).toBeTruthy();
    expect(screen.getByText("Full Body")).toBeTruthy();
  });

  it("filters library exercises by tag", () => {
    useWorkoutStore.setState({
      libraryExercises: ["Push-Up", "Jump Rope"],
    });

    renderPlan();
    fireEvent.press(screen.getByText("LIBRARY"));
    fireEvent.press(screen.getByText("Cardio"));

    expect(screen.queryByText("Upper Body")).toBeNull();
    expect(screen.getByText("Full Body")).toBeTruthy();
  });

  it("expands a library category to show exercises", () => {
    useWorkoutStore.setState({
      libraryExercises: ["Push-Up"],
    });

    renderPlan();
    fireEvent.press(screen.getByText("LIBRARY"));
    fireEvent.press(screen.getByText(/1 exercise/));

    expect(screen.getByText("Push-Up")).toBeTruthy();
    expect(screen.getByText("▲")).toBeTruthy();
    expect(screen.getAllByText("Home").length).toBeGreaterThanOrEqual(1);
  });

  it("opens the add exercise sheet", () => {
    renderPlan();

    fireEvent.press(screen.getByText("LIBRARY"));
    fireEvent.press(screen.getByText("+ ADD EXERCISES"));

    expect(screen.getByText("AddExerciseSheet")).toBeTruthy();
  });

  it("removes an exercise from the library via the remove button", () => {
    useWorkoutStore.setState({
      libraryExercises: ["Push-Up"],
    });

    renderPlan();
    fireEvent.press(screen.getByText("LIBRARY"));
    fireEvent.press(screen.getByText(/1 exercise/));
    fireEvent.press(screen.getByText("✕"));

    expect(useWorkoutStore.getState().libraryExercises).toEqual([]);
  });
});
