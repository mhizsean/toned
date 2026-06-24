import { WorkoutSet } from "../types";
import { RepLabel } from "../data/exerciseTypes";

function finiteNumber(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  return value;
}

export function formatSet(
  weight: number,
  reps: number,
  repLabel?: RepLabel,
): string {
  const w = finiteNumber(weight);
  const r = finiteNumber(reps);
  if (r == null) return "—";

  switch (repLabel) {
    case "seconds":
      return `${r}s`;
    case "per leg":
      return w != null && w > 0 ? `${w}kg × ${r} per leg` : `${r} per leg`;
    case "per arm":
      return w != null && w > 0 ? `${w}kg × ${r} per arm` : `${r} per arm`;
    case "per side":
      return w != null && w > 0 ? `${w}kg × ${r} per side` : `${r} per side`;
    default:
      if (w == null) return `— × ${r}`;
      return `${w}kg × ${r}`;
  }
}

export function getTopWeight(sets: WorkoutSet[]): number | null {
  const weights = sets
    .map((set) => finiteNumber(set.weight))
    .filter((weight): weight is number => weight != null);
  if (!weights.length) return null;
  return Math.max(...weights);
}

export function getTopReps(sets: WorkoutSet[]): number | null {
  const reps = sets
    .map((set) => finiteNumber(set.reps))
    .filter((value): value is number => value != null);
  if (!reps.length) return null;
  return Math.max(...reps);
}
