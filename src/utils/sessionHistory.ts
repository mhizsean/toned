import { Session } from "../types";

export type DayHistoryGroup = {
  dayKey: string;
  date: string;
  sessions: Session[];
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
