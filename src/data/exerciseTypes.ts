export const EXERCISE_CATEGORIES = [
  "Glutes & Legs",
  "Upper Body",
  "Core & Posture",
  "Full Body",
  "Active Recovery",
] as const;

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export type ExerciseType = "strength" | "cardio" | "mobility" | "stretch";

export type RepLabel =
  | "reps"
  | "per leg"
  | "per arm"
  | "per side"
  | "seconds";

export const CATEGORY_META: Record<
  ExerciseCategory,
  { emoji: string; label: string }
> = {
  "Glutes & Legs": { emoji: "🍑", label: "Glutes & Legs" },
  "Upper Body": { emoji: "💪", label: "Upper Body" },
  "Core & Posture": { emoji: "🧘", label: "Core & Posture" },
  "Full Body": { emoji: "🔥", label: "Full Body" },
  "Active Recovery": { emoji: "💆", label: "Active Recovery" },
};

export const FOCUS_OPTIONS = EXERCISE_CATEGORIES.map(
  (c) => `${CATEGORY_META[c].emoji} ${c}`,
);

export function getCategoryDisplayLabel(category: ExerciseCategory): string {
  const meta = CATEGORY_META[category];
  return `${meta.emoji} ${meta.label}`;
}

export function parseFocusCategory(focus: string): ExerciseCategory | null {
  const stripped = focus.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
  const withoutSuffix = stripped.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return (
    EXERCISE_CATEGORIES.find(
      (c) => c === stripped || c === withoutSuffix || withoutSuffix.startsWith(c),
    ) ?? null
  );
}

/** Parse legacy single-focus strings and compound labels like "Upper Body + Core". */
export function parseFocusesFromLegacy(focus?: string): ExerciseCategory[] {
  if (!focus || focus === "Rest Day") return [];

  const single = parseFocusCategory(focus);
  if (single) return [single];

  const found = EXERCISE_CATEGORIES.filter((cat) =>
    focus.toLowerCase().includes(cat.toLowerCase()),
  );
  return found;
}

export function formatFocusesDisplay(focuses: ExerciseCategory[]): string {
  if (focuses.length === 0) return "";
  return focuses.map(getCategoryDisplayLabel).join(" + ");
}

export function getDayFocusLabel(
  schedule: Pick<{ type: string; focuses: ExerciseCategory[] }, "type" | "focuses">,
): string {
  if (schedule.type === "rest") return "Rest Day";
  return formatFocusesDisplay(schedule.focuses) || "No focus set";
}

/** Gym/home days need at least one focus; rest days count as configured. */
export function isDayConfigured(
  schedule?: Pick<
    { type: string; focuses: ExerciseCategory[] },
    "type" | "focuses"
  > | null,
): boolean {
  if (!schedule) return false;
  if (schedule.type === "rest") return true;
  return schedule.focuses.length > 0;
}

export function toggleFocus(
  focuses: ExerciseCategory[],
  category: ExerciseCategory,
): ExerciseCategory[] {
  return focuses.includes(category)
    ? focuses.filter((f) => f !== category)
    : [...focuses, category];
}

type LegacyDaySchedule = {
  type: "gym" | "home" | "rest";
  focus?: string;
  focuses?: ExerciseCategory[];
  exercises: { name: string }[];
};

export function migrateDaySchedule(schedule: LegacyDaySchedule): {
  type: LegacyDaySchedule["type"];
  focuses: ExerciseCategory[];
  exercises: LegacyDaySchedule["exercises"];
} {
  const focuses =
    schedule.focuses?.length && schedule.focuses.length > 0
      ? schedule.focuses
      : schedule.type === "rest"
        ? []
        : parseFocusesFromLegacy(schedule.focus);

  return {
    type: schedule.type,
    focuses,
    exercises: schedule.exercises,
  };
}

export function getScheduleFocuses(
  schedule?: LegacyDaySchedule | null,
): ExerciseCategory[] {
  if (!schedule) return [];
  return migrateDaySchedule(schedule).focuses;
}
