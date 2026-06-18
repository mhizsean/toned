import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import {
  DATE_LOCALE,
  DISPLAY_DATE_FORMAT,
  SESSION_DATE_FORMAT,
  formatDate,
} from "../../constants/storage";

const SAMPLE_DATE = new Date(2026, 5, 17, 12, 0, 0);

describe("formatDate", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(SAMPLE_DATE);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("uses en-GB locale", () => {
    expect(DATE_LOCALE).toBe("en-GB");
  });

  it("formats with display options by default", () => {
    expect(formatDate(SAMPLE_DATE)).toBe("WED, 17 JUN 2026");
    expect(formatDate(SAMPLE_DATE, DISPLAY_DATE_FORMAT)).toBe(
      "WED, 17 JUN 2026",
    );
  });

  it("formats with session options without year", () => {
    expect(formatDate(SAMPLE_DATE, SESSION_DATE_FORMAT)).toBe("WED 17 JUN");
  });

  it("accepts ISO strings and timestamps", () => {
    const iso = "2026-06-17T09:30:00.000Z";
    expect(formatDate(iso, SESSION_DATE_FORMAT)).toMatch(/17 JUN/);
  });

  it("defaults to the current date when no argument is passed", () => {
    expect(formatDate()).toBe("WED, 17 JUN 2026");
  });

  it("returns uppercase output", () => {
    const result = formatDate(SAMPLE_DATE);
    expect(result).toBe(result.toUpperCase());
  });
});
