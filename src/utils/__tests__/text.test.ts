import { describe, it, expect } from "@jest/globals";
import { getDayFocusLabel, pluralize, stripEmoji } from "../text";

describe("pluralize", () => {
  it("uses singular form for count of 1", () => {
    expect(pluralize(1, "exercise")).toBe("1 exercise");
    expect(pluralize(1, "session")).toBe("1 session");
  });

  it("uses plural form for any other count", () => {
    expect(pluralize(0, "exercise")).toBe("0 exercises");
    expect(pluralize(2, "exercise")).toBe("2 exercises");
    expect(pluralize(10, "set")).toBe("10 sets");
  });
});

describe("stripEmoji", () => {
  it("removes emoji and trims whitespace", () => {
    expect(stripEmoji("🍑 Glutes & Legs")).toBe("Glutes & Legs");
    expect(stripEmoji("  💪 Upper Body  ")).toBe("Upper Body");
  });

  it("returns plain text unchanged", () => {
    expect(stripEmoji("Upper Body")).toBe("Upper Body");
  });
});

describe("getDayFocusLabel re-export", () => {
  it("delegates to exerciseTypes helper", () => {
    expect(
      getDayFocusLabel({ type: "rest", focuses: [] }),
    ).toBe("Rest Day");
    expect(
      getDayFocusLabel({ type: "gym", focuses: ["Upper Body"] }),
    ).toBe("💪 Upper Body");
  });
});
