import { Session } from "../types";
import { findExercise, isTimedExercise } from "./exerciseCatalogue";
import { formatDuration } from "./formatDuration";
import { formatDate } from "../constants/storage";
import { pluralize } from "./text";
import { isSameCalendarDay } from "./todayWorkout";
import { getTopReps, getTopWeight } from "./formatWorkout";

export type DayHistoryGroup = {
  dayKey: string;
  date: string;
  sessions: Session[];
};

export type DayWorkoutSummary = {
  exerciseCount: number;
  setCount: number;
  topWeight: number | null;
  topTimedSeconds: number | null;
  allWeighted: boolean;
  allTimed: boolean;
};

export function getCalendarDayKey(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function groupSessionsByDay(sessions: Session[]): DayHistoryGroup[] {
  const grouped = new Map<string, Session[]>();

  for (const session of sessions) {
    const dayKey = getCalendarDayKey(session.date);
    const daySessions = grouped.get(dayKey) ?? [];
    daySessions.push(session);
    grouped.set(dayKey, daySessions);
  }

  return Array.from(grouped.entries())
    .map(([dayKey, daySessions]) => ({
      dayKey,
      date: daySessions.reduce((latest, session) =>
        new Date(session.date) > new Date(latest) ? session.date : latest,
      daySessions[0].date),
      sessions: [...daySessions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getUniqueExerciseNames(sessions: Session[]): string[] {
  const names = new Set<string>();
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      names.add(exercise.name);
    }
  }
  return Array.from(names);
}

export function getDayWorkoutSummary(sessions: Session[]): DayWorkoutSummary {
  const exerciseNames = new Set<string>();
  let setCount = 0;
  let allWeighted = true;
  let allTimed = true;
  const allSets: { weight: number; reps: number }[] = [];
  const timedSets: { weight: number; reps: number }[] = [];

  for (const session of sessions) {
    for (const exercise of session.exercises) {
      if (exercise.sets.length === 0) continue;

      exerciseNames.add(exercise.name);
      const timed = isTimedExercise(findExercise(exercise.name));

      for (const set of exercise.sets) {
        setCount++;
        allSets.push(set);
        if (timed) {
          allWeighted = false;
          timedSets.push(set);
        } else if (set.weight > 0) {
          allTimed = false;
        } else {
          allWeighted = false;
          allTimed = false;
        }
      }
    }
  }

  if (setCount === 0) {
    return {
      exerciseCount: 0,
      setCount: 0,
      topWeight: null,
      topTimedSeconds: null,
      allWeighted: false,
      allTimed: false,
    };
  }

  return {
    exerciseCount: exerciseNames.size,
    setCount,
    topWeight: getTopWeight(allSets),
    topTimedSeconds: timedSets.length ? getTopReps(timedSets) : null,
    allWeighted,
    allTimed,
  };
}

export function formatDaySummary(summary: DayWorkoutSummary): string {
  if (summary.setCount === 0) return "";

  if (summary.allWeighted && summary.topWeight != null && summary.topWeight > 0) {
    return `top ${summary.topWeight}kg`;
  }

  if (summary.allTimed && summary.topTimedSeconds != null) {
    return `top ${formatDuration(summary.topTimedSeconds)}`;
  }

  return `${pluralize(summary.exerciseCount, "exercise")} · ${pluralize(summary.setCount, "set")}`;
}

export function formatHistoryDayLabel(
  dateStr: string,
  ref: Date = new Date(),
): string {
  if (isSameCalendarDay(dateStr, ref)) return "TODAY";

  const yesterday = new Date(ref);
  yesterday.setDate(ref.getDate() - 1);
  if (isSameCalendarDay(dateStr, yesterday)) return "YESTERDAY";

  return formatDate(dateStr);
}
