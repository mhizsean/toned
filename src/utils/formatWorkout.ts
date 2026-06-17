import { WorkoutSet } from "../types";
import { RepLabel } from "../data/exerciseTypes";

export function formatSet(
  weight: number,
  reps: number,
  repLabel?: RepLabel,
): string {
  switch (repLabel) {
    case "seconds":
      return `${reps}s`;
    case "per leg":
      return weight > 0 ? `${weight}kg × ${reps} per leg` : `${reps} per leg`;
    case "per arm":
      return weight > 0 ? `${weight}kg × ${reps} per arm` : `${reps} per arm`;
    case "per side":
      return weight > 0 ? `${weight}kg × ${reps} per side` : `${reps} per side`;
    default:
      return `${weight}kg × ${reps}`;
  }
}

export function getTopWeight(sets: WorkoutSet[]): number | null {
  if (!sets.length) return null;
  return Math.max(...sets.map((s) => s.weight));
}
