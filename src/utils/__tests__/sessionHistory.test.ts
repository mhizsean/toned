import { describe, it, expect } from "@jest/globals";
import { Session } from "../../types";
import {
  getCalendarDayKey,
  getDayWorkoutSummary,
  formatDaySummary,
  formatHistoryDayLabel,
  getUniqueExerciseNames,
  groupSessionsByDay,
} from "../sessionHistory";

function makeSession(
  id: string,
  date: string,
  exercises: Session["exercises"],
): Session {
  return { id, date, exercises };
}

describe("getCalendarDayKey", () => {
  it("returns a stable local calendar key", () => {
    expect(getCalendarDayKey("2026-06-17T10:00:00.000Z")).toBe("2026-06-17");
  });
});

describe("groupSessionsByDay", () => {
  it("groups multiple sessions from the same day together", () => {
    const sessions = [
      makeSession("1", "2026-06-17T08:00:00.000Z", []),
      makeSession("2", "2026-06-16T10:00:00.000Z", []),
      makeSession("3", "2026-06-17T18:00:00.000Z", []),
    ];

    const groups = groupSessionsByDay(sessions);

    expect(groups).toHaveLength(2);
    expect(groups[0].dayKey).toBe("2026-06-17");
    expect(groups[0].sessions.map((session) => session.id)).toEqual(["3", "1"]);
    expect(groups[1].dayKey).toBe("2026-06-16");
  });
});

describe("getUniqueExerciseNames", () => {
  it("returns unique exercise names across sessions", () => {
    const names = getUniqueExerciseNames([
      makeSession("1", "2026-06-17T08:00:00.000Z", [
        { name: "Push-Up", sets: [] },
        { name: "Plank", sets: [] },
      ]),
      makeSession("2", "2026-06-17T18:00:00.000Z", [
        { name: "Push-Up", sets: [] },
        { name: "Hip Thrust (Barbell)", sets: [] },
      ]),
    ]);

    expect(names).toEqual(["Push-Up", "Plank", "Hip Thrust (Barbell)"]);
  });
});

describe("getDayWorkoutSummary", () => {
  it("returns top weight for all-weighted days", () => {
    const summary = getDayWorkoutSummary([
      makeSession("1", "2026-06-17T08:00:00.000Z", [
        { name: "Hip Thrust (Barbell)", sets: [{ weight: 100, reps: 8 }] },
      ]),
    ]);

    expect(formatDaySummary(summary)).toBe("top 100kg");
  });

  it("returns exercise and set counts for mixed workouts", () => {
    const summary = getDayWorkoutSummary([
      makeSession("1", "2026-06-17T08:00:00.000Z", [
        { name: "Plank", sets: [{ weight: 0, reps: 60 }] },
        { name: "Face Pull (Cable)", sets: [{ weight: 10, reps: 10 }] },
        { name: "Dead Bug", sets: [{ weight: 10, reps: 10 }] },
      ]),
    ]);

    expect(summary.exerciseCount).toBe(3);
    expect(summary.setCount).toBe(3);
    expect(formatDaySummary(summary)).toBe("3 exercises · 3 sets");
  });

  it("returns top seconds for all-timed days", () => {
    const summary = getDayWorkoutSummary([
      makeSession("1", "2026-06-17T08:00:00.000Z", [
        { name: "Plank", sets: [{ weight: 0, reps: 45 }] },
        { name: "Wall Sit", sets: [{ weight: 0, reps: 60 }] },
      ]),
    ]);

    expect(formatDaySummary(summary)).toBe("top 1m");
  });
});

describe("formatHistoryDayLabel", () => {
  it("labels the current day as TODAY", () => {
    const ref = new Date(2026, 5, 17, 12, 0, 0);
    expect(
      formatHistoryDayLabel("2026-06-17T10:00:00.000Z", ref),
    ).toBe("TODAY");
  });

  it("labels the previous day as YESTERDAY", () => {
    const ref = new Date(2026, 5, 17, 12, 0, 0);
    expect(
      formatHistoryDayLabel("2026-06-16T10:00:00.000Z", ref),
    ).toBe("YESTERDAY");
  });
});
