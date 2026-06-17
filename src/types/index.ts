import type { ExerciseCategory } from "../data/exerciseTypes";

export type WorkoutSet = {
  weight: number;
  reps: number;
};

export type Exercise = {
  name: string;
  sets: WorkoutSet[];
};

export type Session = {
  id: string;
  date: string;
  exercises: Exercise[];
};

export type PlannedExercise = {
  name: string;
  sets: number;
  reps: string;
  note?: string;
};

export type DayPlan = {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  type: 'gym' | 'home' | 'rest';
  focus: string;
  exercises: PlannedExercise[];
};

export type DayType = 'gym' | 'home' | 'rest';

export type PlannedScheduleExercise = {
 name: string;
}

export type DaySchedule = {
  type: DayType;
  focuses: ExerciseCategory[];
  exercises: PlannedScheduleExercise[];
};

export type WeeklySchedule = {
  [day: string]: DaySchedule;
};
