import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, WorkoutSet } from '../types';

type WorkoutStore = {
  sessions: Session[];
  activeSession: Session | null;
  startSession: () => void;
  addExercise: (name: string) => void;
  addSet: (exIndex: number, set: WorkoutSet) => void;
  removeSet: (exIndex: number, setIndex: number) => void;
  finishSession: () => void;
  discardSession: () => void;
  loadSessions: () => void;
};

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  sessions: [],
  activeSession: null,

  loadSessions: async () => {
    try {
      const data = await AsyncStorage.getItem('toned_sessions');
      if (data) set({ sessions: JSON.parse(data) });
    } catch (e) {
      console.error('Failed to load sessions', e);
    }
  },

  startSession: () => {
    const session: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      exercises: [],
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
}));