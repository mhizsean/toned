import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { DaySchedule, Session } from "../../types";
import { isSameCalendarDay, isTodayPlanComplete } from "../todayWorkout";

const REF_DAY = new Date(2026, 5, 17, 12, 0, 0);

function makeSession(
  id: string,
  date: Date,
  exercises: { name: string; sets: { weight: number; reps: number }[] }[],
): Session {
  return { id, date: date.toISOString(), exercises };
}

function gymPlan(
  exercises: { name: string }[],
): DaySchedule {
  return {
    type: "gym",
    focuses: ["Glutes & Legs"],
    exercises,
  };
}

describe("isSameCalendarDay", () => {
  it("returns true for the same calendar day", () => {
    const morning = new Date(2026, 5, 17, 8, 0, 0);
    const evening = new Date(2026, 5, 17, 20, 0, 0);

    expect(isSameCalendarDay(morning.toISOString(), evening)).toBe(true);
  });

  it("returns false for a different calendar day", () => {
    const today = new Date(2026, 5, 17, 10, 0, 0);
    const yesterday = new Date(2026, 5, 16, 10, 0, 0);

    expect(isSameCalendarDay(yesterday.toISOString(), today)).toBe(false);
  });

  it("uses the current date when no reference is passed", () => {
    jest.useFakeTimers();
    jest.setSystemTime(REF_DAY);

    const sameDay = new Date(2026, 5, 17, 9, 0, 0);
    expect(isSameCalendarDay(sameDay.toISOString())).toBe(true);

    jest.useRealTimers();
  });
});

describe("isTodayPlanComplete", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(REF_DAY);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const today = new Date(2026, 5, 17, 10, 0, 0);
  const yesterday = new Date(2026, 5, 16, 10, 0, 0);

  it("returns false when there is no plan", () => {
    expect(isTodayPlanComplete(undefined, [])).toBe(false);
  });

  it("returns false on rest days", () => {
    const plan: DaySchedule = {
      type: "rest",
      focuses: [],
      exercises: [],
    };

    expect(isTodayPlanComplete(plan, [])).toBe(false);
  });

  it("returns false when the plan has no exercises", () => {
    expect(isTodayPlanComplete(gymPlan([]), [])).toBe(false);
  });

  it("returns true when every planned exercise is logged today", () => {
    const plan = gymPlan([
      { name: "Hip Thrust (Barbell)" },
      { name: "Romanian Deadlift (RDL)" },
    ]);
    const sessions = [
      makeSession("1", today, [
        { name: "Hip Thrust (Barbell)", sets: [{ weight: 100, reps: 8 }] },
        { name: "Romanian Deadlift (RDL)", sets: [{ weight: 60, reps: 10 }] },
      ]),
    ];

    expect(isTodayPlanComplete(plan, sessions)).toBe(true);
  });

  it("returns false when a planned exercise is missing", () => {
    const plan = gymPlan([
      { name: "Hip Thrust (Barbell)" },
      { name: "Romanian Deadlift (RDL)" },
    ]);
    const sessions = [
      makeSession("1", today, [
        { name: "Hip Thrust (Barbell)", sets: [{ weight: 100, reps: 8 }] },
      ]),
    ];

    expect(isTodayPlanComplete(plan, sessions)).toBe(false);
  });

  it("ignores exercises added to session but not logged with sets", () => {
    const plan = gymPlan([{ name: "Hip Thrust (Barbell)" }]);
    const sessions = [
      makeSession("1", today, [
        { name: "Hip Thrust (Barbell)", sets: [] },
      ]),
    ];

    expect(isTodayPlanComplete(plan, sessions)).toBe(false);
  });

  it("ignores sessions from previous days", () => {
    const plan = gymPlan([{ name: "Hip Thrust (Barbell)" }]);
    const sessions = [
      makeSession("1", yesterday, [
        { name: "Hip Thrust (Barbell)", sets: [{ weight: 100, reps: 8 }] },
      ]),
    ];

    expect(isTodayPlanComplete(plan, sessions)).toBe(false);
  });

  it("can complete a plan across multiple sessions the same day", () => {
    const plan = gymPlan([
      { name: "Hip Thrust (Barbell)" },
      { name: "Push-Up" },
    ]);
    const sessions = [
      makeSession("1", today, [
        { name: "Hip Thrust (Barbell)", sets: [{ weight: 100, reps: 8 }] },
      ]),
      makeSession(
        "2",
        new Date(2026, 5, 17, 18, 0, 0),
        [{ name: "Push-Up", sets: [{ weight: 0, reps: 20 }] }],
      ),
    ];

    expect(isTodayPlanComplete(plan, sessions)).toBe(true);
  });

  it("returns false when only extra unplanned exercises were logged", () => {
    const plan = gymPlan([{ name: "Hip Thrust (Barbell)" }]);
    const sessions = [
      makeSession("1", today, [
        { name: "Push-Up", sets: [{ weight: 0, reps: 20 }] },
      ]),
    ];

    expect(isTodayPlanComplete(plan, sessions)).toBe(false);
  });
});
