import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { getToday, DAYS } from "../planning";

describe("getToday", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    [new Date(2026, 5, 15), "Mon"],
    [new Date(2026, 5, 16), "Tue"],
    [new Date(2026, 5, 17), "Wed"],
    [new Date(2026, 5, 18), "Thu"],
    [new Date(2026, 5, 19), "Fri"],
    [new Date(2026, 5, 20), "Sat"],
    [new Date(2026, 5, 21), "Sun"],
  ])("returns %s for %s", (date, expectedDay) => {
    jest.setSystemTime(date);
    expect(getToday()).toBe(expectedDay);
    expect(DAYS).toContain(expectedDay);
  });
});
