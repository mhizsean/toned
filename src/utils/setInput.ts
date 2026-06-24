import { WorkoutSet } from "../types";

/** Strip non-numeric characters; allow at most one decimal point. */
export function sanitizeDecimalInput(value: string): string {
  let cleaned = value.replace(/[^0-9.]/g, "");
  const dotIndex = cleaned.indexOf(".");
  if (dotIndex !== -1) {
    cleaned =
      cleaned.slice(0, dotIndex + 1) +
      cleaned.slice(dotIndex + 1).replace(/\./g, "");
  }
  return cleaned;
}

/** Strip non-digit characters for whole-number fields (reps / seconds). */
export function sanitizeIntegerInput(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

function isValidDecimalString(value: string): boolean {
  if (value === "") return false;
  if (!/^\d+(\.\d+)?$/.test(value) && !/^\d+\.$/.test(value)) return false;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

/** Parse and validate set inputs. Returns null when values cannot be logged. */
export function parseSetInputs(
  weightStr: string,
  repsStr: string,
  timed: boolean,
): WorkoutSet | null {
  const reps = parseInt(repsStr, 10);
  if (!Number.isFinite(reps) || reps <= 0) return null;

  if (timed) {
    return { weight: 0, reps };
  }

  if (!isValidDecimalString(weightStr)) return null;

  const weight = parseFloat(weightStr);
  if (!Number.isFinite(weight) || weight < 0) return null;

  return { weight, reps };
}

export function isValidSetInputs(
  weightStr: string,
  repsStr: string,
  timed: boolean,
): boolean {
  return parseSetInputs(weightStr, repsStr, timed) !== null;
}
