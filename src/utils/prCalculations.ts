import { RepLabel } from "../data/exerciseTypes";
import { findExercise } from "./exerciseCatalogue";
import { Session, WorkoutSet } from "../types";

export type PersonalRecord = {
  weight: number;
  reps: number;
  date: string;
  repLabel?: RepLabel;
};

function finiteNumber(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  return value;
}

function isValidSet(set: WorkoutSet): boolean {
  const reps = finiteNumber(set.reps);
  const weight = finiteNumber(set.weight);
  if (reps == null || reps <= 0) return false;
  if (weight == null || weight < 0) return false;
  return true;
}

function getRepLabel(exerciseName: string): RepLabel | undefined {
  return findExercise(exerciseName)?.repLabel;
}

function isBetterSet(
  exerciseName: string,
  set: WorkoutSet,
  current: PersonalRecord | undefined,
): boolean {
  if (!isValidSet(set)) return false;

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
  const reps = finiteNumber(pr.reps);
  const weight = finiteNumber(pr.weight);

  if (repLabel === "seconds") {
    return reps == null ? "—" : `${reps}s`;
  }
  if (weight == null || weight === 0) {
    return reps == null ? "—" : `${reps}`;
  }
  return `${weight}kg`;
}

export function formatPRSecondary(
  exerciseName: string,
  pr: PersonalRecord,
): string | null {
  const repLabel = pr.repLabel ?? getRepLabel(exerciseName);
  const reps = finiteNumber(pr.reps);
  const weight = finiteNumber(pr.weight);

  if (repLabel === "seconds") return null;
  if (weight == null || weight === 0) {
    if (repLabel && repLabel !== "reps") return repLabel;
    return "reps";
  }
  if (reps == null) return null;
  if (repLabel === "per leg") return `${reps} per leg`;
  if (repLabel === "per arm") return `${reps} per arm`;
  if (repLabel === "per side") return `${reps} per side`;
  return `${reps} reps`;
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
