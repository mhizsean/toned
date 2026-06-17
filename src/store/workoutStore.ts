import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DaySchedule, Exercise, Session, WeeklySchedule, WorkoutSet } from '../types';

type WorkoutStore = {
  sessions: Session[];
  activeSession: Session | null;
startSession: (exercises?: { name: string; sets: WorkoutSet[] }[]) => void;
  addExercise: (name: string) => void;
  addSet: (exIndex: number, set: WorkoutSet) => void;
  removeSet: (exIndex: number, setIndex: number) => void;
  finishSession: () => void;
  discardSession: () => void;
  loadSessions: () => void;
  deleteSession: (id: string) => void;
  libraryExercises: string[];
  addToLibrary: (name: string) => void;
  removeFromLibrary: (name: string) => void;
  loadLibrary: () => void;
  weeklySchedule: WeeklySchedule;
  loadSchedule: () => void;
  saveDaySchedule: (day: string, schedule: DaySchedule) => void;
};

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  sessions: [],
  activeSession: null,
  libraryExercises: [],
  weeklySchedule: {},

  loadSessions: async () => {
    try {
      const data = await AsyncStorage.getItem('toned_sessions');
      if (data) set({ sessions: JSON.parse(data) });
    } catch (e) {
      console.error('Failed to load sessions', e);
    }
  },

startSession: (exercises: { name: string; sets: WorkoutSet[] }[] = []) => {
  const session: Session = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    exercises: exercises.length > 0
      ? exercises
      : [],
  };
  set({ activeSession: session });
},

  addExercise: (name) => {
    const { activeSession } = get();
    if (!activeSession) return;
    set({
      activeSession: {
        ...activeSession,
        exercises: [...activeSession.exercises, { name, sets: [] }],
      },
    });
  },

  addSet: (exIndex, workoutSet) => {
    const { activeSession } = get();
    if (!activeSession) return;
    const exercises = activeSession.exercises.map((ex, i) =>
      i !== exIndex ? ex : { ...ex, sets: [...ex.sets, workoutSet] }
    );
    set({ activeSession: { ...activeSession, exercises } });
  },

  removeSet: (exIndex, setIndex) => {
    const { activeSession } = get();
    if (!activeSession) return;
    const exercises = activeSession.exercises.map((ex, i) =>
      i !== exIndex ? ex : { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) }
    );
    set({ activeSession: { ...activeSession, exercises } });
  },

  finishSession: async () => {
    const { activeSession, sessions } = get();
    if (!activeSession) return;
    const updated = [activeSession, ...sessions];
    set({ sessions: updated, activeSession: null });
    await AsyncStorage.setItem('toned_sessions', JSON.stringify(updated));
  },

  discardSession: () => {
    set({ activeSession: null });
  },

  deleteSession: async (id: string) => {
  const { sessions } = get();
  const updated = sessions.filter((s) => s.id !== id);
  set({ sessions: updated });
  await AsyncStorage.setItem('toned_sessions', JSON.stringify(updated));
},

loadLibrary: async () => {
  try {
    const data = await AsyncStorage.getItem('toned_library');
    if (data) set({ libraryExercises: JSON.parse(data) });
  } catch (e) {
    console.error('Failed to load library', e);
  }
},

addToLibrary: async (name) => {
  const { libraryExercises } = get();
  if (libraryExercises.includes(name)) return;
  const updated = [...libraryExercises, name];
  set({ libraryExercises: updated });
  await AsyncStorage.setItem('toned_library', JSON.stringify(updated));
},

removeFromLibrary: async (name) => {
  const { libraryExercises } = get();
  const updated = libraryExercises.filter((ex) => ex !== name);
  set({ libraryExercises: updated });
  AsyncStorage.setItem('toned_library', JSON.stringify(updated));
},


loadSchedule: async () => {
  try {
    const data = await AsyncStorage.getItem('toned_schedule');
    if (data) set({ weeklySchedule: JSON.parse(data) });
  } catch (e) {
    console.error('Failed to load schedule', e);
  }
},

saveDaySchedule: async (day, schedule) => {
  const { weeklySchedule } = get();
  const updated = { ...weeklySchedule, [day]: schedule };
  set({ weeklySchedule: updated });
  await AsyncStorage.setItem('toned_schedule', JSON.stringify(updated));
},
}));