import { DaySchedule, Session } from "../types";
import { getCalendarDayKey } from "./sessionHistory";

export function isSameCalendarDay(
  dateStr: string,
  ref: Date = new Date(),
): boolean {
  const d = new Date(dateStr);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export function isTodayPlanComplete(
  todayPlan: DaySchedule | undefined,
  sessions: Session[],
): boolean {
  if (!todayPlan || todayPlan.type === "rest" || todayPlan.exercises.length === 0) {
    return false;
  }

  const loggedToday = new Set<string>();
  for (const session of sessions) {
    if (!isSameCalendarDay(session.date)) continue;
    for (const ex of session.exercises) {
      if (ex.sets.length > 0) loggedToday.add(ex.name);
    }
  }

  return todayPlan.exercises.every((planned) => loggedToday.has(planned.name));
}

export function isFinishedForToday(
  finishedForTodayDate: string | null | undefined,
  ref: Date = new Date(),
): boolean {
  if (!finishedForTodayDate) return false;
  return isSameCalendarDay(finishedForTodayDate, ref);
}

export function hasSessionsForDay(
  sessions: Session[],
  dayKey: string,
): boolean {
  return sessions.some(
    (session) => getCalendarDayKey(session.date) === dayKey,
  );
}

export function isDoneForToday(
  todayPlan: DaySchedule | undefined,
  sessions: Session[],
  finishedForTodayDate: string | null | undefined,
  ref: Date = new Date(),
): boolean {
  const finishedDayKey = finishedForTodayDate
    ? getCalendarDayKey(finishedForTodayDate)
    : null;
  const finishedAndLogged =
    isFinishedForToday(finishedForTodayDate, ref) &&
    finishedDayKey != null &&
    hasSessionsForDay(sessions, finishedDayKey);

  return finishedAndLogged || isTodayPlanComplete(todayPlan, sessions);
}
