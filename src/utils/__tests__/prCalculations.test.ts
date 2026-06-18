import { describe, it, expect } from "@jest/globals";
import { Session } from "../../types";
import {
  calculatePRs,
  comparePRs,
  formatPRPrimary,
  formatPRSecondary,
  PersonalRecord,
} from "../prCalculations";

function makeSession(
  id: string,
  date: string,
  exercises: { name: string; sets: { weight: number; reps: number }[] }[],
): Session {
  return { id, date, exercises };
}

describe("calculatePRs", () => {
  it("tracks max weight for weighted exercises", () => {
    const sessions = [
      makeSession("1", "2026-06-01", [
        {
          name: "Hip Thrust (Barbell)",
          sets: [
            { weight: 80, reps: 8 },
            { weight: 100, reps: 5 },
          ],
        },
      ]),
    ];

    const prs = calculatePRs(sessions);

    expect(prs["Hip Thrust (Barbell)"]).toEqual({
      weight: 100,
      reps: 5,
      date: "2026-06-01",
      repLabel: "reps",
    });
  });

  it("uses higher reps as tiebreaker at the same weight", () => {
    const sessions = [
      makeSession("1", "2026-06-01", [
        {
          name: "Hip Thrust (Barbell)",
          sets: [
            { weight: 100, reps: 5 },
            { weight: 100, reps: 8 },
          ],
        },
      ]),
    ];

    expect(calculatePRs(sessions)["Hip Thrust (Barbell)"].reps).toBe(8);
  });

  it("tracks max seconds for timed exercises", () => {
    const sessions = [
      makeSession("1", "2026-06-01", [
        {
          name: "Jump Rope",
          sets: [
            { weight: 0, reps: 30 },
            { weight: 0, reps: 45 },
            { weight: 0, reps: 20 },
          ],
        },
      ]),
    ];

    const pr = calculatePRs(sessions)["Jump Rope"];

    expect(pr.reps).toBe(45);
    expect(pr.weight).toBe(0);
    expect(pr.repLabel).toBe("seconds");
  });

  it("does not let a lower hold replace a longer timed PR", () => {
    const sessions = [
      makeSession("1", "2026-06-01", [
        { name: "Jump Rope", sets: [{ weight: 0, reps: 60 }] },
      ]),
      makeSession("2", "2026-06-02", [
        { name: "Jump Rope", sets: [{ weight: 0, reps: 30 }] },
      ]),
    ];

    expect(calculatePRs(sessions)["Jump Rope"].reps).toBe(60);
    expect(calculatePRs(sessions)["Jump Rope"].date).toBe("2026-06-01");
  });

  it("tracks max reps for bodyweight exercises at 0kg", () => {
    const sessions = [
      makeSession("1", "2026-06-01", [
        {
          name: "Push-Up",
          sets: [
            { weight: 0, reps: 12 },
            { weight: 0, reps: 20 },
          ],
        },
      ]),
    ];

    const pr = calculatePRs(sessions)["Push-Up"];

    expect(pr.weight).toBe(0);
    expect(pr.reps).toBe(20);
  });

  it("picks the best set across multiple sessions", () => {
    const sessions = [
      makeSession("1", "2026-06-01", [
        { name: "Hip Thrust (Barbell)", sets: [{ weight: 90, reps: 6 }] },
      ]),
      makeSession("2", "2026-06-10", [
        { name: "Hip Thrust (Barbell)", sets: [{ weight: 110, reps: 4 }] },
      ]),
    ];

    const pr = calculatePRs(sessions)["Hip Thrust (Barbell)"];

    expect(pr.weight).toBe(110);
    expect(pr.date).toBe("2026-06-10");
  });

  it("returns separate PRs per exercise", () => {
    const sessions = [
      makeSession("1", "2026-06-01", [
        { name: "Hip Thrust (Barbell)", sets: [{ weight: 100, reps: 5 }] },
        { name: "Push-Up", sets: [{ weight: 0, reps: 15 }] },
      ]),
    ];

    const prs = calculatePRs(sessions);

    expect(Object.keys(prs)).toHaveLength(2);
    expect(prs["Hip Thrust (Barbell)"].weight).toBe(100);
    expect(prs["Push-Up"].reps).toBe(15);
  });
});

describe("comparePRs", () => {
  it("sorts weighted PRs by weight descending", () => {
    const a: PersonalRecord = { weight: 80, reps: 8, date: "2026-06-01" };
    const b: PersonalRecord = { weight: 100, reps: 5, date: "2026-06-02" };

    expect(comparePRs("Hip Thrust (Barbell)", a, b)).toBeGreaterThan(0);
    expect(comparePRs("Hip Thrust (Barbell)", b, a)).toBeLessThan(0);
  });

  it("sorts timed PRs by seconds descending", () => {
    const a: PersonalRecord = {
      weight: 0,
      reps: 30,
      date: "2026-06-01",
      repLabel: "seconds",
    };
    const b: PersonalRecord = {
      weight: 0,
      reps: 60,
      date: "2026-06-02",
      repLabel: "seconds",
    };

    expect(comparePRs("Jump Rope", a, b)).toBeGreaterThan(0);
  });

  it("sorts bodyweight PRs by reps when both are 0kg", () => {
    const a: PersonalRecord = { weight: 0, reps: 12, date: "2026-06-01" };
    const b: PersonalRecord = { weight: 0, reps: 20, date: "2026-06-02" };

    expect(comparePRs("Push-Up", a, b)).toBeGreaterThan(0);
  });
});

describe("formatPRPrimary", () => {
  it("formats timed PRs as seconds", () => {
    expect(
      formatPRPrimary("Jump Rope", {
        weight: 0,
        reps: 45,
        date: "2026-06-01",
        repLabel: "seconds",
      }),
    ).toBe("45s");
  });

  it("formats bodyweight PRs as rep count only", () => {
    expect(
      formatPRPrimary("Push-Up", {
        weight: 0,
        reps: 20,
        date: "2026-06-01",
      }),
    ).toBe("20");
  });

  it("formats weighted PRs as kg", () => {
    expect(
      formatPRPrimary("Hip Thrust (Barbell)", {
        weight: 100,
        reps: 5,
        date: "2026-06-01",
      }),
    ).toBe("100kg");
  });
});

describe("formatPRSecondary", () => {
  it("returns null for timed exercises", () => {
    expect(
      formatPRSecondary("Jump Rope", {
        weight: 0,
        reps: 45,
        date: "2026-06-01",
        repLabel: "seconds",
      }),
    ).toBeNull();
  });

  it("returns reps label for bodyweight exercises", () => {
    expect(
      formatPRSecondary("Push-Up", {
        weight: 0,
        reps: 20,
        date: "2026-06-01",
      }),
    ).toBe("reps");
  });

  it("returns per-leg label for unilateral exercises", () => {
    expect(
      formatPRSecondary("Bulgarian Split Squat", {
        weight: 20,
        reps: 10,
        date: "2026-06-01",
        repLabel: "per leg",
      }),
    ).toBe("10 per leg");
  });

  it("returns reps for standard weighted exercises", () => {
    expect(
      formatPRSecondary("Hip Thrust (Barbell)", {
        weight: 100,
        reps: 5,
        date: "2026-06-01",
      }),
    ).toBe("5 reps");
  });
});
