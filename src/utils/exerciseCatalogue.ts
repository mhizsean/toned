import { EXERCISE_ALIASES } from "../data/exerciseAliases";
import {
  EXERCISE_CATALOGUE,
  ExerciseInfo,
} from "../data/exerciseCatalogue";
import {
  ExerciseCategory,
  EXERCISE_CATEGORIES,
  getCategoryDisplayLabel,
  RepLabel,
  ExerciseType,
} from "../data/exerciseTypes";

const CARDIO_EXERCISES = new Set([
  "Mountain Climber",
  "Burpee",
  "Jump Squat",
  "Kettlebell Swing",
  "Jump Rope",
  "Incline Walk",
  "Battle Ropes",
]);

const POSTURE_EXERCISES = new Set([
  "Face Pull",
  "Bird Dog",
  "Dead Bug",
  "Pallof Press (Cable)",
  "Superman Hold",
  "Cat-Cow Stretch",
]);

const TIMED_EXERCISES = new Set([
  "Plank",
  "Side Plank",
  "Vacuum Hold",
  "Superman Hold",
  "Hollow Body Hold",
  "Wall Sit",
  "Child's Pose",
]);

export function slugifyExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveExerciseName(name: string): string {
  return EXERCISE_ALIASES[name] ?? name;
}

export function inferExerciseType(exercise: ExerciseInfo): ExerciseType {
  if (exercise.exerciseType) return exercise.exerciseType;
  if (exercise.category === "Active Recovery") {
    return exercise.name.startsWith("Foam Roll") ? "mobility" : "stretch";
  }
  if (CARDIO_EXERCISES.has(exercise.name) || exercise.tags?.includes("cardio")) {
    return "cardio";
  }
  return "strength";
}

export function inferTags(exercise: ExerciseInfo): string[] {
  if (exercise.tags?.length) return exercise.tags;
  const tags: string[] = [];
  if (CARDIO_EXERCISES.has(exercise.name)) tags.push("cardio");
  if (POSTURE_EXERCISES.has(exercise.name)) tags.push("posture");
  if (exercise.equipment.includes("Bodyweight")) tags.push("home-friendly");
  if (exercise.category === "Active Recovery") tags.push("recovery");
  return tags;
}

export function enrichExercise(exercise: ExerciseInfo): ExerciseInfo {
  const repLabel = TIMED_EXERCISES.has(exercise.name)
    ? "seconds"
    : exercise.repLabel;

  return {
    ...exercise,
    id: exercise.id ?? slugifyExerciseName(exercise.name),
    exerciseType: inferExerciseType({ ...exercise, repLabel }),
    tags: inferTags(exercise),
    repLabel,
  };
}

const enrichedCatalogue = EXERCISE_CATALOGUE.map(enrichExercise);

const exerciseByName = new Map<string, ExerciseInfo>();
for (const ex of enrichedCatalogue) {
  exerciseByName.set(ex.name, ex);
}
for (const [alias, canonical] of Object.entries(EXERCISE_ALIASES)) {
  const exercise = exerciseByName.get(canonical);
  if (exercise) exerciseByName.set(alias, exercise);
}

export function findExercise(name: string | null | undefined): ExerciseInfo | undefined {
  if (!name) return undefined;
  return exerciseByName.get(name) ?? exerciseByName.get(resolveExerciseName(name));
}

export function getEnrichedCatalogue(): ExerciseInfo[] {
  return enrichedCatalogue;
}

export function groupCatalogueByCategory(
  catalogue: { category: string; name: string }[],
  displayLabels = false,
): Record<string, string[]> {
  const grouped = catalogue.reduce(
    (acc, ex) => {
      const key = displayLabels
        ? getCategoryDisplayLabel(ex.category as ExerciseCategory)
        : ex.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(ex.name);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  for (const key of Object.keys(grouped)) {
    grouped[key].sort();
  }
  return grouped;
}

export function getCatalogueGrouped(
  options: {
    names?: string[];
    displayLabels?: boolean;
  } = {},
): Record<string, string[]> {
  let catalogue = enrichedCatalogue;
  if (options.names) {
    const allowed = new Set(options.names.map(resolveExerciseName));
    catalogue = catalogue.filter((ex) => allowed.has(ex.name));
  }

  const grouped = groupCatalogueByCategory(catalogue, options.displayLabels);

  if (!options.displayLabels) {
    const ordered: Record<string, string[]> = {};
    for (const cat of EXERCISE_CATEGORIES) {
      if (grouped[cat]) ordered[cat] = grouped[cat];
    }
    return ordered;
  }

  const ordered: Record<string, string[]> = {};
  for (const cat of EXERCISE_CATEGORIES) {
    const label = getCategoryDisplayLabel(cat);
    if (grouped[label]) ordered[label] = grouped[label];
  }
  return ordered;
}

export function filterCategoriesBySearch(
  categories: Record<string, string[]>,
  search: string,
): Record<string, string[]> {
  if (!search) return categories;

  return Object.fromEntries(
    Object.entries(categories)
      .map(([cat, exs]) => [
        cat,
        exs.filter((e) => e.toLowerCase().includes(search.toLowerCase())),
      ])
      .filter(([, exs]) => exs.length > 0),
  );
}

export function isTimedExercise(exercise: ExerciseInfo | undefined): boolean {
  return exercise?.repLabel === "seconds";
}

export function getRepInputPlaceholder(repLabel: RepLabel | undefined): string {
  switch (repLabel) {
    case "seconds":
      return "sec";
    case "per leg":
      return "reps/leg";
    case "per arm":
      return "reps/arm";
    case "per side":
      return "reps/side";
    default:
      return "reps";
  }
}

export function formatRepLabel(repLabel: RepLabel): string {
  switch (repLabel) {
    case "seconds":
      return "Timed (sec)";
    case "per leg":
      return "Per leg";
    case "per arm":
      return "Per arm";
    case "per side":
      return "Per side";
    default:
      return "Reps";
  }
}

export function filterPlannedExercisesByFocuses(
  exercises: { name: string }[],
  focuses: ExerciseCategory[],
): { name: string }[] {
  if (focuses.length === 0) return [];
  return exercises.filter((ex) => {
    const category = findExercise(ex.name)?.category;
    return category && focuses.includes(category);
  });
}

export function normalizeExerciseNames(names: string[]): string[] {
  const seen = new Set<string>();
  return names
    .map((n) => {
      const resolved = resolveExerciseName(n);
      const exercise = findExercise(resolved);
      return exercise?.name ?? resolved;
    })
    .filter((n) => {
      if (seen.has(n)) return false;
      seen.add(n);
      return true;
    });
}

export type ExerciseTagId = "cardio" | "posture" | "home-friendly" | "recovery";

export const LIBRARY_FILTER_TAGS: { id: ExerciseTagId; label: string }[] = [
  { id: "home-friendly", label: "Home" },
  { id: "cardio", label: "Cardio" },
  { id: "posture", label: "Posture" },
  { id: "recovery", label: "Recovery" },
];

export function getExerciseTagLabel(tagId: string): string {
  return LIBRARY_FILTER_TAGS.find((t) => t.id === tagId)?.label ?? tagId;
}

export function filterLibraryByTag(
  names: string[],
  tag: ExerciseTagId | null,
): string[] {
  if (!tag) return names;
  return names.filter((name) => findExercise(name)?.tags?.includes(tag));
}

/** Tags that appear on at least one exercise in the given library list. */
export function getActiveLibraryTags(names: string[]): ExerciseTagId[] {
  const found = new Set<string>();
  for (const name of names) {
    findExercise(name)?.tags?.forEach((t) => found.add(t));
  }
  return LIBRARY_FILTER_TAGS.filter((t) => found.has(t.id)).map((t) => t.id);
}
