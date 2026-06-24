import { describe, it, expect } from "@jest/globals";
import { Session } from "../../types";
import {
  getCalendarDayKey,
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
