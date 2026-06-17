import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DaySchedule, Session, WeeklySchedule, WorkoutSet } from '../types';
import {
  findExercise,
  normalizeExerciseNames,
  resolveExerciseName,
} from '../utils/exerciseCatalogue';
import { migrateDaySchedule } from '../data/exerciseTypes';

const ACTIVE_SESSION_KEY = 'toned_active_session';

function toCanonicalName(name: string): string {
  return findExercise(name)?.name ?? resolveExerciseName(name);
}

function migrateSession(session: Session): Session {
  return {
    ...session,
    exercises: session.exercises.map((ex) => ({
      ...ex,
      name: toCanonicalName(ex.name),
    })),
  };
}

function migrateSessions(sessions: Session[]): Session[] {
  return sessions.map(migrateSession);
}

function migrateSchedule(schedule: WeeklySchedule): WeeklySchedule {
  const migrated: WeeklySchedule = {};
  for (const [day, daySchedule] of Object.entries(schedule)) {
    migrated[day] = migrateDaySchedule(
      daySchedule as Parameters<typeof migrateDaySchedule>[0],
    );
    migrated[day].exercises = daySchedule.exercises.map((ex) => ({
      ...ex,
      name: toCanonicalName(ex.name),
    }));
  }
  return migrated;
}

type WorkoutStore = {
  sessions: Session[];
  activeSession: Session | null;
  scheduleLoaded: boolean;
  startSession: (exercises?: { name: string; sets: WorkoutSet[] }[]) => void;
  addExercise: (name: string) => void;
  addSet: (exIndex: number, set: WorkoutSet) => void;
  removeSet: (exIndex: number, setIndex: number) => void;
  finishSession: () => void;
  discardSession: () => void;
  loadSessions: () => void;
  loadActiveSession: () => void;
  deleteSession: (id: string) => void;
  libraryExercises: string[];
  addToLibrary: (name: string) => void;
  removeFromLibrary: (name: string) => void;
  loadLibrary: () => void;
  weeklySchedule: WeeklySchedule;
  loadSchedule: () => void;
  saveDaySchedule: (day: string, schedule: DaySchedule) => void;
};

async function persistActiveSession(session: Session | null) {
  try {
    if (session) {
      await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    } else {
      await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to persist active session', e);
  }
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  sessions: [],
  activeSession: null,
  scheduleLoaded: false,
  libraryExercises: [],
  weeklySchedule: {},

  loadSessions: async () => {
    try {
      const data = await AsyncStorage.getItem('toned_sessions');
      if (data) {
        const sessions = migrateSessions(JSON.parse(data));
        set({ sessions });
      }
    } catch (e) {
      console.error('Failed to load sessions', e);
    }
  },

  loadActiveSession: async () => {
    try {
      const data = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
      if (data) {
        const activeSession = migrateSession(JSON.parse(data));
        set({ activeSession });
      }
    } catch (e) {
      console.error('Failed to load active session', e);
    }
  },

  startSession: (exercises: { name: string; sets: WorkoutSet[] }[] = []) => {
    const session: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      exercises: exercises.length > 0
        ? exercises.map((ex) => ({ ...ex, name: toCanonicalName(ex.name) }))
        : [],
    };
    set({ activeSession: session });
    persistActiveSession(session);
  },

  addExercise: (name) => {
    const { activeSession } = get();
    if (!activeSession) return;
    const canonical = toCanonicalName(name);
    const next: Session = {
      ...activeSession,
      exercises: [...activeSession.exercises, { name: canonical, sets: [] }],
    };
    set({ activeSession: next });
    persistActiveSession(next);
  },

  addSet: (exIndex, workoutSet) => {
    const { activeSession } = get();
    if (!activeSession) return;
    const exercises = activeSession.exercises.map((ex, i) =>
      i !== exIndex ? ex : { ...ex, sets: [...ex.sets, workoutSet] }
    );
    const next = { ...activeSession, exercises };
    set({ activeSession: next });
    persistActiveSession(next);
  },

  removeSet: (exIndex, setIndex) => {
    const { activeSession } = get();
    if (!activeSession) return;
    const exercises = activeSession.exercises.map((ex, i) =>
      i !== exIndex ? ex : { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) }
    );
    const next = { ...activeSession, exercises };
    set({ activeSession: next });
    persistActiveSession(next);
  },

  finishSession: async () => {
    const { activeSession, sessions } = get();
    if (!activeSession) return;

    const exercises = activeSession.exercises.filter((ex) => ex.sets.length > 0);
    if (exercises.length === 0) return;

    const completed: Session = { ...activeSession, exercises };
    const updated = [completed, ...sessions];
    set({ sessions: updated, activeSession: null });
    await AsyncStorage.setItem('toned_sessions', JSON.stringify(updated));
    await persistActiveSession(null);
  },

  discardSession: () => {
    set({ activeSession: null });
    persistActiveSession(null);
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
    if (data) {
      const libraryExercises = normalizeExerciseNames(JSON.parse(data));
      set({ libraryExercises });
    }
  } catch (e) {
    console.error('Failed to load library', e);
  }
},

addToLibrary: async (name) => {
  const { libraryExercises } = get();
  const canonical = toCanonicalName(name);
  if (libraryExercises.includes(canonical)) return;
  const updated = [...libraryExercises, canonical];
  set({ libraryExercises: updated });
  await AsyncStorage.setItem('toned_library', JSON.stringify(updated));
},

removeFromLibrary: async (name) => {
  const { libraryExercises } = get();
  const canonical = toCanonicalName(name);
  const updated = libraryExercises.filter((ex) => ex !== canonical);
  set({ libraryExercises: updated });
  AsyncStorage.setItem('toned_library', JSON.stringify(updated));
},


loadSchedule: async () => {
  try {
    const data = await AsyncStorage.getItem('toned_schedule');
    if (data) set({ weeklySchedule: migrateSchedule(JSON.parse(data)) });
  } catch (e) {
    console.error('Failed to load schedule', e);
  } finally {
    set({ scheduleLoaded: true });
  }
},

saveDaySchedule: async (day, schedule) => {
  const { weeklySchedule } = get();
  const normalized: DaySchedule = {
    ...schedule,
    exercises: schedule.exercises.map((ex) => ({
      ...ex,
      name: toCanonicalName(ex.name),
    })),
  };
  const updated = { ...weeklySchedule, [day]: normalized };
  set({ weeklySchedule: updated });
  await AsyncStorage.setItem('toned_schedule', JSON.stringify(updated));
},
}));