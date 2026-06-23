import { DayPlan } from "../types";
import { ColorScheme } from "./theme";

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function getToday(): (typeof DAYS)[number] {
  return DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
}

export function getTypeBadge(
  colors: ColorScheme,
): Record<DayPlan["type"], { label: string; color: string }> {
  return {
    gym: { label: "🏋🏽 Gym", color: colors.amber },
    home: { label: "🏠 Home", color: colors.blue },
    rest: { label: "😴 Rest", color: colors.muted },
  };
}
