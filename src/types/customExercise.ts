import type { ExerciseCategory, RepLabel } from "../data/exerciseTypes";

export type CustomExercise = {
  name: string;
  category: ExerciseCategory;
  equipment: string;
  repLabel: RepLabel;
};

export type CustomExerciseInput = {
  name: string;
  category: ExerciseCategory;
  equipment?: string;
  repLabel: RepLabel;
};
