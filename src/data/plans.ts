/**
 * Sample weekly plan using canonical exercise names from exerciseCatalogue.
 * User schedules are stored in AsyncStorage via workoutStore.
 */
import { DayPlan } from "../types";

export const weeklyPlan: DayPlan[] = [
  {
    day: "Mon",
    type: "gym",
    focus: "Glutes & Legs (Volume)",
    exercises: [
      {
        name: "Hip Thrust (Smith Machine)",
        sets: 3,
        reps: "12–15",
        note: "Squeeze at top for 1s",
      },
      { name: "Sumo Squat (Dumbbell)", sets: 3, reps: "12–15" },
      { name: "Cable Kickback", sets: 3, reps: "15 each leg" },
      { name: "Leg Press", sets: 3, reps: "12–15" },
      { name: "Seated Hamstring Curl (Machine)", sets: 3, reps: "12–15" },
      { name: "Hip Abduction (Machine)", sets: 3, reps: "15–20" },
    ],
  },
  {
    day: "Tue",
    type: "home",
    focus: "Core + Posture Flow",
    exercises: [
      { name: "Plank", sets: 3, reps: "30–45s" },
      { name: "Dead Bug", sets: 3, reps: "10 each side" },
      { name: "Bird Dog", sets: 3, reps: "10 each side" },
      { name: "Vacuum Hold", sets: 3, reps: "20–30s", note: "Key for waist" },
      { name: "Superman Hold", sets: 3, reps: "12–15" },
      { name: "Side Plank", sets: 3, reps: "20–30s each" },
    ],
  },
  {
    day: "Wed",
    type: "gym",
    focus: "Upper Body + Posture",
    exercises: [
      { name: "Lat Pulldown (Cable)", sets: 3, reps: "12–15" },
      { name: "Seated Cable Row", sets: 3, reps: "12" },
      {
        name: "Rear Delt Fly (Dumbbell)",
        sets: 3,
        reps: "15",
        note: "Light weight, feel the squeeze",
      },
      { name: "Face Pull (Cable)", sets: 3, reps: "15–20" },
      { name: "Dumbbell Shoulder Press", sets: 3, reps: "10–12" },
      { name: "Bicep Curl (Barbell)", sets: 3, reps: "12" },
    ],
  },
  {
    day: "Thu",
    type: "rest",
    focus: "Rest — walk or stretch only",
    exercises: [],
  },
  {
    day: "Fri",
    type: "gym",
    focus: "Glutes & Legs (Heavy)",
    exercises: [
      {
        name: "Hip Thrust (Smith Machine)",
        sets: 4,
        reps: "8–10",
        note: "Heavier than Monday",
      },
      { name: "Romanian Deadlift (RDL)", sets: 3, reps: "10–12" },
      { name: "Bulgarian Split Squat", sets: 3, reps: "10 each leg" },
      { name: "Walking Lunge", sets: 3, reps: "12 each leg" },
      { name: "Glute Bridge (Bodyweight)", sets: 3, reps: "15–20" },
      { name: "Seated Hamstring Curl (Machine)", sets: 3, reps: "12" },
    ],
  },
  {
    day: "Sat",
    type: "home",
    focus: "Full Body Tone + Core",
    exercises: [
      { name: "Glute Bridge (Bodyweight)", sets: 3, reps: "20" },
      { name: "Push-Up", sets: 3, reps: "10–15" },
      { name: "Mountain Climber", sets: 3, reps: "20 each leg" },
      { name: "Dead Bug", sets: 3, reps: "10 each side" },
      { name: "Vacuum Hold", sets: 3, reps: "30s" },
      { name: "Bird Dog", sets: 3, reps: "10 each side" },
    ],
  },
  {
    day: "Sun",
    type: "gym",
    focus: "Full Body + Cardio Finisher",
    exercises: [
      { name: "Goblet Squat", sets: 3, reps: "12" },
      { name: "Single Arm Dumbbell Row", sets: 3, reps: "12 each side" },
      { name: "Step Up", sets: 3, reps: "12 each leg" },
      { name: "Dumbbell Shoulder Press", sets: 3, reps: "12" },
      { name: "Kettlebell Swing", sets: 3, reps: "15" },
      { name: "Mountain Climber", sets: 3, reps: "30s" },
    ],
  },
];
