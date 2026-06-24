import { describe, it, expect } from "@jest/globals";
import {
  durationToParts,
  durationToSeconds,
  formatDuration,
} from "../formatDuration";

describe("formatDuration", () => {
  it("formats seconds with explicit units", () => {
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(60)).toBe("1m");
    expect(formatDuration(90)).toBe("1m 30s");
    expect(formatDuration(600)).toBe("10m");
  });

  it("handles invalid values safely", () => {
    expect(formatDuration(NaN)).toBe("0s");
    expect(formatDuration(-5)).toBe("0s");
  });
});

describe("durationToParts", () => {
  it("splits total seconds into minutes and seconds", () => {
    expect(durationToParts(125)).toEqual({ minutes: 2, seconds: 5 });
  });
});

describe("durationToSeconds", () => {
  it("combines minutes and seconds", () => {
    expect(durationToSeconds(10, 0)).toBe(600);
    expect(durationToSeconds(1, 30)).toBe(90);
  });
});
