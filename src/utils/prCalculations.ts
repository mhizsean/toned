import { Session } from "../types";

export type PersonalRecord = {
  weight: number;
  reps: number;
  date: string;
};

export function calculatePRs(
  sessions: Session[],
): Record<string, PersonalRecord> {
  const prs: Record<string, PersonalRecord> = {};

  sessions.forEach((session) =>
    session.exercises.forEach((exercise) =>
      exercise.sets.forEach((set) => {
        if (!prs[exercise.name] || set.weight > prs[exercise.name].weight) {
          prs[exercise.name] = {
            weight: set.weight,
            reps: set.reps,
            date: session.date,
          };
        }
      }),
    ),
  );

  return prs;
}
