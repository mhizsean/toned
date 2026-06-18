import { describe, it, expect } from "@jest/globals";
import { formatSet, getTopWeight } from "../formatWorkout";

describe("formatSet", () => {
  it("formats standard weighted sets as kg × reps", () => {
    expect(formatSet(100, 8)).toBe("100kg × 8");
    expect(formatSet(100, 8, "reps")).toBe("100kg × 8");
  });

  it("formats timed sets as seconds only", () => {
    expect(formatSet(0, 45, "seconds")).toBe("45s");
    expect(formatSet(0, 60, "seconds")).toBe("60s");
  });

  it("formats per-leg sets with and without weight", () => {
    expect(formatSet(20, 10, "per leg")).toBe("20kg × 10 per leg");
    expect(formatSet(0, 12, "per leg")).toBe("12 per leg");
  });

  it("formats per-arm sets with and without weight", () => {
    expect(formatSet(15, 8, "per arm")).toBe("15kg × 8 per arm");
    expect(formatSet(0, 10, "per arm")).toBe("10 per arm");
  });

  it("formats per-side sets with and without weight", () => {
    expect(formatSet(25, 6, "per side")).toBe("25kg × 6 per side");
    expect(formatSet(0, 8, "per side")).toBe("8 per side");
  });

  it("does not append a separate reps suffix (label is self-contained)", () => {
    const perLeg = formatSet(60, 10, "per leg");
    expect(perLeg).not.toMatch(/reps$/);
    expect(perLeg).toBe("60kg × 10 per leg");
  });
});

describe("getTopWeight", () => {
  it("returns null for an empty set list", () => {
    expect(getTopWeight([])).toBeNull();
  });

  it("returns the highest weight logged", () => {
    expect(
      getTopWeight([
        { weight: 80, reps: 8 },
        { weight: 100, reps: 5 },
        { weight: 90, reps: 6 },
      ]),
    ).toBe(100);
  });

  it("returns the weight when all sets are the same", () => {
    expect(
      getTopWeight([
        { weight: 50, reps: 10 },
        { weight: 50, reps: 8 },
      ]),
    ).toBe(50);
  });

  it("returns 0 when all sets are bodyweight", () => {
    expect(
      getTopWeight([
        { weight: 0, reps: 15 },
        { weight: 0, reps: 20 },
      ]),
    ).toBe(0);
  });
});
