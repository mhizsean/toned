import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWorkoutStore } from "../workoutStore";
import { findExercise, syncCustomExercises } from "../../utils/exerciseCatalogue";

const ACTIVE_SESSION_KEY = "toned_active_session";
const CUSTOM_EXERCISES_KEY = "toned_custom_exercises";

function resetStore() {
  syncCustomExercises([]);
  useWorkoutStore.setState({
    sessions: [],
    activeSession: null,
    scheduleLoaded: false,
    libraryExercises: [],
    customExercises: [],
    weeklySchedule: {},
  });
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("workoutStore", () => {
  beforeEach(async () => {
    jest.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    await AsyncStorage.clear();
    resetStore();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("active session", () => {
    it("starts a session and persists it", async () => {
      useWorkoutStore.getState().startSession();
      await flushPromises();

      const { activeSession } = useWorkoutStore.getState();
      expect(activeSession?.id).toBe("1700000000000");
      expect(activeSession?.exercises).toEqual([]);

      const stored = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
      expect(JSON.parse(stored!)).toMatchObject({ id: "1700000000000" });
    });

    it("restores an active session on load", async () => {
      const session = {
        id: "active-1",
        date: "2026-06-17T10:00:00.000Z",
        exercises: [
          { name: "Push-Up", sets: [{ weight: 0, reps: 12 }] },
        ],
      };
      await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));

      await useWorkoutStore.getState().loadActiveSession();

      expect(useWorkoutStore.getState().activeSession).toEqual(session);
    });

    it("canonicalizes exercise names when starting with a plan", () => {
      useWorkoutStore.getState().startSession([
        { name: "RDL", sets: [] },
      ]);

      expect(useWorkoutStore.getState().activeSession?.exercises[0].name).toBe(
        "Romanian Deadlift (RDL)",
      );
    });

    it("adds exercises and sets to the active session", async () => {
      useWorkoutStore.getState().startSession();
      useWorkoutStore.getState().addExercise("Push-Up");
      useWorkoutStore.getState().addSet(0, { weight: 0, reps: 15 });

      const exercise = useWorkoutStore.getState().activeSession?.exercises[0];
      expect(exercise?.name).toBe("Push-Up");
      expect(exercise?.sets).toEqual([{ weight: 0, reps: 15 }]);
    });

    it("removes sets from the active session", () => {
      useWorkoutStore.getState().startSession([
        { name: "Push-Up", sets: [{ weight: 0, reps: 10 }, { weight: 0, reps: 12 }] },
      ]);

      useWorkoutStore.getState().removeSet(0, 0);

      expect(useWorkoutStore.getState().activeSession?.exercises[0].sets).toEqual([
        { weight: 0, reps: 12 },
      ]);
    });

    it("discards the active session and clears storage", async () => {
      useWorkoutStore.getState().startSession();
      await flushPromises();

      useWorkoutStore.getState().discardSession();
      await flushPromises();

      expect(useWorkoutStore.getState().activeSession).toBeNull();
      expect(await AsyncStorage.getItem(ACTIVE_SESSION_KEY)).toBeNull();
    });
  });

  describe("finishSession", () => {
    it("saves only exercises with sets and clears the active session", async () => {
      useWorkoutStore.getState().startSession([
        { name: "Push-Up", sets: [{ weight: 0, reps: 12 }] },
        { name: "Plank", sets: [] },
      ]);

      await useWorkoutStore.getState().finishSession();

      const { sessions, activeSession } = useWorkoutStore.getState();
      expect(activeSession).toBeNull();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].exercises).toEqual([
        { name: "Push-Up", sets: [{ weight: 0, reps: 12 }] },
      ]);

      const stored = await AsyncStorage.getItem("toned_sessions");
      expect(JSON.parse(stored!)).toHaveLength(1);
      expect(await AsyncStorage.getItem(ACTIVE_SESSION_KEY)).toBeNull();
    });

    it("does nothing when no sets were logged", async () => {
      useWorkoutStore.getState().startSession([
        { name: "Push-Up", sets: [] },
      ]);

      await useWorkoutStore.getState().finishSession();

      expect(useWorkoutStore.getState().sessions).toEqual([]);
      expect(useWorkoutStore.getState().activeSession).not.toBeNull();
    });
  });

  describe("sessions", () => {
    it("loads and migrates stored sessions", async () => {
      await AsyncStorage.setItem(
        "toned_sessions",
        JSON.stringify([
          {
            id: "1",
            date: "2026-06-01",
            exercises: [{ name: "RDL", sets: [{ weight: 60, reps: 10 }] }],
          },
        ]),
      );

      await useWorkoutStore.getState().loadSessions();

      expect(useWorkoutStore.getState().sessions[0].exercises[0].name).toBe(
        "Romanian Deadlift (RDL)",
      );
    });

    it("deletes a session and updates storage", async () => {
      useWorkoutStore.setState({
        sessions: [
          { id: "1", date: "2026-06-01", exercises: [] },
          { id: "2", date: "2026-06-02", exercises: [] },
        ],
      });

      await useWorkoutStore.getState().deleteSession("1");

      expect(useWorkoutStore.getState().sessions).toHaveLength(1);
      expect(useWorkoutStore.getState().sessions[0].id).toBe("2");

      const stored = JSON.parse((await AsyncStorage.getItem("toned_sessions"))!);
      expect(stored).toHaveLength(1);
    });
  });

  describe("library", () => {
    it("adds canonical names without duplicates", async () => {
      await useWorkoutStore.getState().addToLibrary("RDL");
      await useWorkoutStore.getState().addToLibrary("Romanian Deadlift (RDL)");

      expect(useWorkoutStore.getState().libraryExercises).toEqual([
        "Romanian Deadlift (RDL)",
      ]);
    });

    it("loads and normalizes the library from storage", async () => {
      await AsyncStorage.setItem(
        "toned_library",
        JSON.stringify(["RDL", "Push-Up", "RDL"]),
      );

      await useWorkoutStore.getState().loadLibrary();

      expect(useWorkoutStore.getState().libraryExercises).toEqual([
        "Romanian Deadlift (RDL)",
        "Push-Up",
      ]);
    });

    it("removes exercises from the library", async () => {
      useWorkoutStore.setState({
        libraryExercises: ["Push-Up", "Romanian Deadlift (RDL)"],
      });

      await useWorkoutStore.getState().removeFromLibrary("RDL");

      expect(useWorkoutStore.getState().libraryExercises).toEqual(["Push-Up"]);
    });
  });

  describe("custom exercises", () => {
    it("saves a custom exercise to storage and library", async () => {
      await useWorkoutStore.getState().addCustomExercise({
        name: "Nordic Curl",
        category: "Glutes & Legs",
        equipment: "Bodyweight",
        repLabel: "reps",
      });

      const state = useWorkoutStore.getState();
      expect(state.customExercises).toEqual([
        {
          name: "Nordic Curl",
          category: "Glutes & Legs",
          equipment: "Bodyweight",
          repLabel: "reps",
        },
      ]);
      expect(state.libraryExercises).toEqual(["Nordic Curl"]);

      const storedCustom = JSON.parse(
        (await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY))!,
      );
      expect(storedCustom[0].name).toBe("Nordic Curl");
    });

    it("loads custom exercises and syncs the registry", async () => {
      await AsyncStorage.setItem(
        CUSTOM_EXERCISES_KEY,
        JSON.stringify([
          {
            name: "Landmine Press",
            category: "Upper Body",
            equipment: "Barbell",
            repLabel: "reps",
          },
        ]),
      );

      await useWorkoutStore.getState().loadCustomExercises();

      expect(useWorkoutStore.getState().customExercises).toHaveLength(1);
      expect(findExercise("Landmine Press")?.isCustom).toBe(true);
    });

    it("rejects duplicate custom exercise names", async () => {
      await expect(
        useWorkoutStore.getState().addCustomExercise({
          name: "Push-Up",
          category: "Upper Body",
          repLabel: "reps",
        }),
      ).rejects.toThrow("duplicate_or_invalid_name");
    });
  });

  describe("schedule", () => {
    it("loads schedule and sets scheduleLoaded", async () => {
      await AsyncStorage.setItem(
        "toned_schedule",
        JSON.stringify({
          Mon: {
            type: "gym",
            focus: "Upper Body",
            exercises: [{ name: "RDL" }],
          },
        }),
      );

      await useWorkoutStore.getState().loadSchedule();

      const { weeklySchedule, scheduleLoaded } = useWorkoutStore.getState();
      expect(scheduleLoaded).toBe(true);
      expect(weeklySchedule.Mon.focuses).toEqual(["Upper Body"]);
      expect(weeklySchedule.Mon.exercises[0].name).toBe(
        "Romanian Deadlift (RDL)",
      );
    });

    it("marks scheduleLoaded even when storage is empty", async () => {
      await useWorkoutStore.getState().loadSchedule();
      expect(useWorkoutStore.getState().scheduleLoaded).toBe(true);
    });

    it("saves a day schedule with canonical exercise names", async () => {
      await useWorkoutStore.getState().saveDaySchedule("Tue", {
        type: "gym",
        focuses: ["Glutes & Legs"],
        exercises: [{ name: "RDL" }],
      });

      expect(useWorkoutStore.getState().weeklySchedule.Tue).toEqual({
        type: "gym",
        focuses: ["Glutes & Legs"],
        exercises: [{ name: "Romanian Deadlift (RDL)" }],
      });

      const stored = JSON.parse((await AsyncStorage.getItem("toned_schedule"))!);
      expect(stored.Tue.exercises[0].name).toBe("Romanian Deadlift (RDL)");
    });
  });
});
