import { describe, it, expect } from "@jest/globals";
import {
  isValidSetInputs,
  parseSetInputs,
  sanitizeDecimalInput,
  sanitizeIntegerInput,
} from "../setInput";

describe("sanitizeDecimalInput", () => {
  it("removes non-numeric characters", () => {
    expect(sanitizeDecimalInput("12kg")).toBe("12");
    expect(sanitizeDecimalInput("a1b2")).toBe("12");
  });

  it("allows a single decimal point", () => {
    expect(sanitizeDecimalInput("12.5")).toBe("12.5");
    expect(sanitizeDecimalInput("12..5")).toBe("12.5");
    expect(sanitizeDecimalInput("1.2.3")).toBe("1.23");
  });
});

describe("sanitizeIntegerInput", () => {
  it("keeps digits only", () => {
    expect(sanitizeIntegerInput("10reps")).toBe("10");
    expect(sanitizeIntegerInput("0")).toBe("0");
    expect(sanitizeIntegerInput("12.5")).toBe("125");
  });
});

describe("parseSetInputs", () => {
  it("accepts valid weighted sets", () => {
    expect(parseSetInputs("60", "10", false)).toEqual({
      weight: 60,
      reps: 10,
    });
    expect(parseSetInputs("0.2", "8", false)).toEqual({
      weight: 0.2,
      reps: 8,
    });
    expect(parseSetInputs("0", "12", false)).toEqual({
      weight: 0,
      reps: 12,
    });
  });

  it("accepts valid timed sets without weight", () => {
    expect(parseSetInputs("", "45", true)).toEqual({
      weight: 0,
      reps: 45,
    });
  });

  it("rejects incomplete or invalid values", () => {
    expect(parseSetInputs(".", "10", false)).toBeNull();
    expect(parseSetInputs("60", ".", false)).toBeNull();
    expect(parseSetInputs("60", "0", false)).toBeNull();
    expect(parseSetInputs("", "10", false)).toBeNull();
    expect(parseSetInputs("60", "", false)).toBeNull();
    expect(parseSetInputs("", "0", true)).toBeNull();
  });
});

describe("isValidSetInputs", () => {
  it("mirrors parseSetInputs", () => {
    expect(isValidSetInputs("60", "10", false)).toBe(true);
    expect(isValidSetInputs(".", "10", false)).toBe(false);
    expect(isValidSetInputs("60", "0", false)).toBe(false);
  });
});
