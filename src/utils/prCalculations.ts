import { RepLabel } from "../data/exerciseTypes";
import { findExercise } from "./exerciseCatalogue";
import { Session, WorkoutSet } from "../types";

export type PersonalRecord = {
  weight: number;
  reps: number;
  date: string;
  repLabel?: RepLabel;
};

function getRepLabel(exerciseName: string): RepLabel | undefined {
  return findExercise(exerciseName)?.repLabel;
}

function isBetterSet(
  exerciseName: string,
  set: WorkoutSet,
  current: PersonalRecord | undefined,
): boolean {
  const repLabel = getRepLabel(exerciseName);

  if (repLabel === "seconds") {
    return !current || set.reps > current.reps;
  }

  if (set.weight === 0) {
    return !current || set.reps > current.reps;
  }

  if (!current) return true;
  if (set.weight > current.weight) return true;
  if (set.weight === current.weight && set.reps > current.reps) return true;
  return false;
}

export function comparePRs(
  exerciseName: string,
  a: PersonalRecord,
  b: PersonalRecord,
): number {
  const repLabel = a.repLabel ?? getRepLabel(exerciseName);

  if (repLabel === "seconds" || (a.weight === 0 && b.weight === 0)) {
    return b.reps - a.reps;
  }

  if (a.weight !== b.weight) return b.weight - a.weight;
  return b.reps - a.reps;
}

export function formatPRPrimary(exerciseName: string, pr: PersonalRecord): string {
  const repLabel = pr.repLabel ?? getRepLabel(exerciseName);

  if (repLabel === "seconds") return `${pr.reps}s`;
  if (pr.weight === 0) return `${pr.reps}`;
  return `${pr.weight}kg`;
}

export function formatPRSecondary(
  exerciseName: string,
  pr: PersonalRecord,
): string | null {
  const repLabel = pr.repLabel ?? getRepLabel(exerciseName);

  if (repLabel === "seconds") return null;
  if (pr.weight === 0) {
    if (repLabel && repLabel !== "reps") return repLabel;
    return "reps";
  }
  if (repLabel === "per leg") return `${pr.reps} per leg`;
  if (repLabel === "per arm") return `${pr.reps} per arm`;
  if (repLabel === "per side") return `${pr.reps} per side`;
  return `${pr.reps} reps`;
}

export function calculatePRs(
  sessions: Session[],
): Record<string, PersonalRecord> {
  const prs: Record<string, PersonalRecord> = {};

  sessions.forEach((session) =>
    session.exercises.forEach((exercise) =>
      exercise.sets.forEach((set) => {
        if (!isBetterSet(exercise.name, set, prs[exercise.name])) return;
        prs[exercise.name] = {
          weight: set.weight,
          reps: set.reps,
          date: session.date,
          repLabel: getRepLabel(exercise.name),
        };
      }),
    ),
  );

  return prs;
}
