import { DayPlan } from "../types";
import { colors } from "./theme";

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const TODAY = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

export const TYPE_BADGE: Record<DayPlan["type"], { label: string; color: string }> = {
  gym: { label: "🏋🏽 Gym", color: colors.amber },
  home: { label: "🏠 Home", color: "#60a5fa" },
  rest: { label: "😴 Rest", color: colors.muted },
};