import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DaySchedule, Session, WeeklySchedule, WorkoutSet } from '../types';
import {
  CustomExercise,
  CustomExerciseInput,
} from '../types/customExercise';
import {
  findExercise,
  isDuplicateExerciseName,
  normalizeCustomExerciseName,
  normalizeExerciseNames,
  resolveExerciseName,
  syncCustomExercises,
} from '../utils/exerciseCatalogue';
import { migrateDaySchedule, isDayConfigured } from '../data/exerciseTypes';
import { isFinishedForToday, hasSessionsForDay } from '../utils/todayWorkout';
import { getCalendarDayKey } from '../utils/sessionHistory';

const ACTIVE_SESSION_KEY = 'toned_active_session';
const CUSTOM_EXERCISES_KEY = 'toned_custom_exercises';
const FINISHED_FOR_TODAY_KEY = 'toned_finished_for_today';

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
    const normalized = migrateDaySchedule(
      daySchedule as Parameters<typeof migrateDaySchedule>[0],
    );
    normalized.exercises = daySchedule.exercises.map((ex) => ({
      ...ex,
      name: toCanonicalName(ex.name),
    }));
    if (isDayConfigured(normalized)) {
      migrated[day] = normalized;
    }
  }
  return migrated;
}

type WorkoutStore = {
  sessions: Session[];
  activeSession: Session | null;
  finishedForTodayDate: string | null;
  scheduleLoaded: boolean;
  startSession: (exercises?: { name: string; sets: WorkoutSet[] }[]) => Promise<void>;
  addExercise: (name: string) => void;
  addSet: (exIndex: number, set: WorkoutSet) => void;
  removeSet: (exIndex: number, setIndex: number) => void;
  finishSession: () => Promise<void>;
  discardSession: () => void;
  loadSessions: () => void;
  loadActiveSession: () => void;
  loadFinishedForToday: () => void;
  deleteSessionsForDay: (dayKey: string) => Promise<void>;
  deleteSession: (id: string) => void;
  libraryExercises: string[];
  customExercises: CustomExercise[];
  addToLibrary: (name: string) => void;
  removeFromLibrary: (name: string) => void;
  loadLibrary: () => void;
  loadCustomExercises: () => void;
  addCustomExercise: (input: CustomExerciseInput) => Promise<void>;
  weeklySchedule: WeeklySchedule;
  loadSchedule: () => void;
  saveDaySchedule: (day: string, schedule: DaySchedule) => Promise<void>;
  clearDaySchedule: (day: string) => Promise<void>;
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

function reconcileFinishedForToday(
  sessions: Session[],
  finishedForTodayDate: string | null,
): string | null {
  if (!finishedForTodayDate) return null;
  if (!isFinishedForToday(finishedForTodayDate)) return null;

  const dayKey = getCalendarDayKey(finishedForTodayDate);
  if (hasSessionsForDay(sessions, dayKey)) return finishedForTodayDate;
  return null;
}

function reconcileActiveSession(
  activeSession: Session | null,
  sessions: Session[],
): Session | null {
  if (!activeSession) return null;
  if (sessions.some((session) => session.id === activeSession.id)) return null;
  return activeSession;
}

async function readPersistedActiveSession(): Promise<Session | null> {
  try {
    const data = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
    return data ? migrateSession(JSON.parse(data)) : null;
  } catch (e) {
    console.error('Failed to read active session', e);
    return null;
  }
}

function shouldClearActiveForDayReset(
  session: Session,
  dayKey: string,
  deletedIds: Set<string>,
  resetDayCompletely: boolean,
): boolean {
  if (resetDayCompletely) return true;
  if (deletedIds.has(session.id)) return true;
  return getCalendarDayKey(session.date) === dayKey;
}

async function clearFinishedForTodayState() {
  await AsyncStorage.removeItem(FINISHED_FOR_TODAY_KEY);
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  sessions: [],
  activeSession: null,
  finishedForTodayDate: null,
  scheduleLoaded: false,
  libraryExercises: [],
  customExercises: [],
  weeklySchedule: {},

  loadSessions: async () => {
    try {
      const [sessionsData, flagData] = await Promise.all([
        AsyncStorage.getItem('toned_sessions'),
        AsyncStorage.getItem(FINISHED_FOR_TODAY_KEY),
      ]);
      const sessions = sessionsData ? migrateSessions(JSON.parse(sessionsData)) : [];
      const flag =
        flagData && isFinishedForToday(flagData) ? flagData : null;
      const reconciled = reconcileFinishedForToday(sessions, flag);
      const previousActive = get().activeSession;
      const activeSession = reconcileActiveSession(previousActive, sessions);
      set({ sessions, finishedForTodayDate: reconciled, activeSession });
      if (flag && !reconciled) {
        await clearFinishedForTodayState();
      }
      if (previousActive !== activeSession) {
        await persistActiveSession(activeSession);
      }
    } catch (e) {
      console.error('Failed to load sessions', e);
    }
  },

  loadActiveSession: async () => {
    try {
      const { sessions, activeSession: current } = get();
      const data = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
      if (!data) return;

      const loaded = migrateSession(JSON.parse(data));
      const reconciled = reconcileActiveSession(loaded, sessions);

      if (current && reconciled && current.id !== reconciled.id) {
        return;
      }

      set({ activeSession: reconciled });
      if (!reconciled) {
        await persistActiveSession(null);
      }
    } catch (e) {
      console.error('Failed to load active session', e);
    }
  },

  loadFinishedForToday: async () => {
    try {
      const [sessionsData, flagData] = await Promise.all([
        AsyncStorage.getItem('toned_sessions'),
        AsyncStorage.getItem(FINISHED_FOR_TODAY_KEY),
      ]);
      const sessions = sessionsData
        ? migrateSessions(JSON.parse(sessionsData))
        : get().sessions;
      if (!flagData || !isFinishedForToday(flagData)) {
        set({ finishedForTodayDate: null });
        if (flagData) await clearFinishedForTodayState();
        return;
      }

      const reconciled = reconcileFinishedForToday(sessions, flagData);
      set({ finishedForTodayDate: reconciled });
      if (!reconciled) await clearFinishedForTodayState();
    } catch (e) {
      console.error('Failed to load finished-for-today state', e);
    }
  },

  startSession: async (exercises: { name: string; sets: WorkoutSet[] }[] = []) => {
    const session: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      exercises: exercises.length > 0
        ? exercises.map((ex) => ({ ...ex, name: toCanonicalName(ex.name) }))
        : [],
    };
    set({ activeSession: session, finishedForTodayDate: null });
    await persistActiveSession(session);
    await AsyncStorage.removeItem(FINISHED_FOR_TODAY_KEY).catch((e) => {
      console.error('Failed to clear finished-for-today state', e);
    });
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
    const reps = Number.isFinite(workoutSet.reps) ? workoutSet.reps : NaN;
    const weight = Number.isFinite(workoutSet.weight) ? workoutSet.weight : NaN;
    if (!Number.isFinite(reps) || reps <= 0) return;
    if (!Number.isFinite(weight) || weight < 0) return;
    const exercises = activeSession.exercises.map((ex, i) =>
      i !== exIndex ? ex : { ...ex, sets: [...ex.sets, { weight, reps }] }
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
    const finishedForTodayDate = new Date().toISOString();
    set({ sessions: updated, activeSession: null, finishedForTodayDate });
    await AsyncStorage.setItem('toned_sessions', JSON.stringify(updated));
    await persistActiveSession(null);
    await AsyncStorage.setItem(FINISHED_FOR_TODAY_KEY, finishedForTodayDate);
  },

  discardSession: () => {
    set({ activeSession: null });
    persistActiveSession(null);
  },

  deleteSessionsForDay: async (dayKey: string) => {
    const { sessions, finishedForTodayDate, activeSession } = get();
    const sessionsForDay = sessions.filter(
      (session) => getCalendarDayKey(session.date) === dayKey,
    );
    const deletedIds = new Set(sessionsForDay.map((session) => session.id));
    const shouldClearFinishedForToday =
      finishedForTodayDate != null &&
      getCalendarDayKey(finishedForTodayDate) === dayKey;
    const resetDayCompletely = shouldClearFinishedForToday;
    const storedActive = await readPersistedActiveSession();
    const shouldWipeActive =
      resetDayCompletely ||
      [activeSession, storedActive].some(
        (session) =>
          session != null &&
          shouldClearActiveForDayReset(session, dayKey, deletedIds, false),
      );

    if (!sessionsForDay.length && !shouldClearFinishedForToday && !shouldWipeActive) {
      return;
    }

    const updated = sessions.filter(
      (session) => getCalendarDayKey(session.date) !== dayKey,
    );

    set({
      sessions: updated,
      ...(shouldClearFinishedForToday ? { finishedForTodayDate: null } : {}),
      ...(shouldWipeActive ? { activeSession: null } : {}),
    });

    if (shouldClearFinishedForToday) {
      await clearFinishedForTodayState();
    }
    if (shouldWipeActive) {
      await persistActiveSession(null);
    }

    if (sessionsForDay.length) {
      await AsyncStorage.setItem('toned_sessions', JSON.stringify(updated));
    }
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

loadCustomExercises: async () => {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
    const customExercises: CustomExercise[] = data ? JSON.parse(data) : [];
    syncCustomExercises(customExercises);
    set({ customExercises });
  } catch (e) {
    console.error('Failed to load custom exercises', e);
    syncCustomExercises([]);
    set({ customExercises: [] });
  }
},

addCustomExercise: async (input) => {
  const name = normalizeCustomExerciseName(input.name);
  if (!name || isDuplicateExerciseName(name)) {
    throw new Error('duplicate_or_invalid_name');
  }

  const custom: CustomExercise = {
    name,
    category: input.category,
    equipment: input.equipment?.trim() || 'Custom',
    repLabel: input.repLabel,
  };

  const { customExercises, libraryExercises } = get();
  const updatedCustom = [
    ...customExercises.filter((exercise) => exercise.name !== name),
    custom,
  ];
  const updatedLibrary = libraryExercises.includes(name)
    ? libraryExercises
    : [...libraryExercises, name];

  syncCustomExercises(updatedCustom);
  set({
    customExercises: updatedCustom,
    libraryExercises: updatedLibrary,
  });

  await AsyncStorage.setItem(
    CUSTOM_EXERCISES_KEY,
    JSON.stringify(updatedCustom),
  );
  await AsyncStorage.setItem('toned_library', JSON.stringify(updatedLibrary));
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
  if (!isDayConfigured(normalized)) {
    await get().clearDaySchedule(day);
    return;
  }
  const updated = { ...weeklySchedule, [day]: normalized };
  set({ weeklySchedule: updated });
  try {
    await AsyncStorage.setItem('toned_schedule', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save schedule', e);
    throw e;
  }
},

clearDaySchedule: async (day) => {
  const { weeklySchedule } = get();
  if (!weeklySchedule[day]) return;
  const { [day]: _removed, ...updated } = weeklySchedule;
  set({ weeklySchedule: updated });
  try {
    await AsyncStorage.setItem('toned_schedule', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to clear day schedule', e);
    throw e;
  }
},
}));