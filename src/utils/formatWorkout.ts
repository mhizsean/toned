import { WorkoutSet } from "../types";

export function formatSet(weight: number, reps: number): string {
  return `${weight}kg × ${reps}`;
}

export function getTopWeight(sets: WorkoutSet[]): number | null {
  if (!sets.length) return null;
  return Math.max(...sets.map((s) => s.weight));
}
