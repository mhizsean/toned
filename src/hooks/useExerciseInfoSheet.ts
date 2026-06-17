import { useState, useCallback } from "react";

export function useExerciseInfoSheet() {
  const [exerciseName, setExerciseName] = useState<string | null>(null);

  const openInfo = useCallback((name: string) => setExerciseName(name), []);
  const closeInfo = useCallback(() => setExerciseName(null), []);

  return { exerciseName, openInfo, closeInfo };
}
