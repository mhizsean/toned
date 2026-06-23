import { describe, it, expect } from "@jest/globals";
import {
  formatFocusesDisplay,
  getCategoryDisplayLabel,
  getDayFocusLabel,
  getScheduleFocuses,
  isDayConfigured,
  migrateDaySchedule,
  parseFocusCategory,
  parseFocusesFromLegacy,
  toggleFocus,
} from "../../data/exerciseTypes";

describe("getCategoryDisplayLabel", () => {
  it("includes emoji and category name", () => {
    expect(getCategoryDisplayLabel("Glutes & Legs")).toBe("🍑 Glutes & Legs");
    expect(getCategoryDisplayLabel("Upper Body")).toBe("💪 Upper Body");
  });
});

describe("parseFocusCategory", () => {
  it("parses a plain category string", () => {
    expect(parseFocusCategory("Upper Body")).toBe("Upper Body");
  });

  it("parses a label with emoji", () => {
    expect(parseFocusCategory("💪 Upper Body")).toBe("Upper Body");
  });

  it("returns null for unrecognised text", () => {
    expect(parseFocusCategory("Random focus")).toBeNull();
  });
});

describe("parseFocusesFromLegacy", () => {
  it("returns empty for rest day or missing focus", () => {
    expect(parseFocusesFromLegacy(undefined)).toEqual([]);
    expect(parseFocusesFromLegacy("Rest Day")).toEqual([]);
  });

  it("parses a single legacy focus", () => {
    expect(parseFocusesFromLegacy("🍑 Glutes & Legs")).toEqual(["Glutes & Legs"]);
  });

  it("parses a plus-separated string as the first matching category", () => {
    expect(parseFocusesFromLegacy("Upper Body + Core & Posture")).toEqual([
      "Upper Body",
    ]);
  });

  it("parses compound legacy focus strings when prefixed", () => {
    expect(
      parseFocusesFromLegacy("Today: Upper Body, Core & Posture"),
    ).toEqual(["Upper Body", "Core & Posture"]);
  });
});

describe("formatFocusesDisplay", () => {
  it("joins multiple focuses with +", () => {
    expect(
      formatFocusesDisplay(["Upper Body", "Core & Posture"]),
    ).toBe("💪 Upper Body + 🧘 Core & Posture");
  });

  it("returns empty string when no focuses", () => {
    expect(formatFocusesDisplay([])).toBe("");
  });
});

describe("isDayConfigured", () => {
  it("returns false when schedule is missing", () => {
    expect(isDayConfigured(undefined)).toBe(false);
    expect(isDayConfigured(null)).toBe(false);
  });

  it("returns true for rest days", () => {
    expect(isDayConfigured({ type: "rest", focuses: [] })).toBe(true);
  });

  it("returns true for gym days with focuses", () => {
    expect(
      isDayConfigured({ type: "gym", focuses: ["Upper Body"] }),
    ).toBe(true);
  });

  it("returns false for gym days without focuses", () => {
    expect(isDayConfigured({ type: "gym", focuses: [] })).toBe(false);
  });
});

describe("getDayFocusLabel", () => {
  it("returns Rest Day for rest schedule", () => {
    expect(
      getDayFocusLabel({ type: "rest", focuses: [] }),
    ).toBe("Rest Day");
  });

  it("returns formatted focuses for gym days", () => {
    expect(
      getDayFocusLabel({
        type: "gym",
        focuses: ["Glutes & Legs"],
      }),
    ).toBe("🍑 Glutes & Legs");
  });

  it("returns fallback when gym day has no focuses", () => {
    expect(
      getDayFocusLabel({ type: "gym", focuses: [] }),
    ).toBe("No focus set");
  });
});

describe("toggleFocus", () => {
  it("adds a focus when not selected", () => {
    expect(toggleFocus([], "Upper Body")).toEqual(["Upper Body"]);
  });

  it("removes a focus when already selected", () => {
    expect(
      toggleFocus(["Upper Body", "Core & Posture"], "Upper Body"),
    ).toEqual(["Core & Posture"]);
  });
});

describe("migrateDaySchedule", () => {
  it("keeps focuses array when present", () => {
    expect(
      migrateDaySchedule({
        type: "gym",
        focuses: ["Upper Body", "Core & Posture"],
        exercises: [{ name: "Push-Up" }],
      }),
    ).toEqual({
      type: "gym",
      focuses: ["Upper Body", "Core & Posture"],
      exercises: [{ name: "Push-Up" }],
    });
  });

  it("migrates legacy single focus string", () => {
    expect(
      migrateDaySchedule({
        type: "home",
        focus: "🍑 Glutes & Legs",
        exercises: [],
      }),
    ).toEqual({
      type: "home",
      focuses: ["Glutes & Legs"],
      exercises: [],
    });
  });

  it("returns empty focuses for rest days", () => {
    expect(
      migrateDaySchedule({
        type: "rest",
        focus: "🍑 Glutes & Legs",
        exercises: [],
      }),
    ).toEqual({
      type: "rest",
      focuses: [],
      exercises: [],
    });
  });
});

describe("getScheduleFocuses", () => {
  it("returns empty when schedule is undefined", () => {
    expect(getScheduleFocuses(undefined)).toEqual([]);
  });

  it("migrates legacy schedule on read", () => {
    expect(
      getScheduleFocuses({
        type: "gym",
        focus: "Upper Body",
        exercises: [],
      }),
    ).toEqual(["Upper Body"]);
  });
});
