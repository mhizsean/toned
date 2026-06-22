import { describe, it, expect } from "@jest/globals";
import {
  filterCategoriesBySearch,
  filterLibraryByTag,
  filterPlannedExercisesByFocuses,
  findExercise,
  formatRepLabel,
  getActiveLibraryTags,
  getLibraryExercisesForFocuses,
  getRepInputPlaceholder,
  groupCatalogueByCategory,
  isDuplicateExerciseName,
  isTimedExercise,
  normalizeExerciseNames,
  resolveExerciseName,
  slugifyExerciseName,
  syncCustomExercises,
} from "../exerciseCatalogue";

describe("slugifyExerciseName", () => {
  it("creates a url-safe id from an exercise name", () => {
    expect(slugifyExerciseName("Romanian Deadlift (RDL)")).toBe(
      "romanian-deadlift-rdl",
    );
    expect(slugifyExerciseName("Child's Pose")).toBe("childs-pose");
  });
});

describe("resolveExerciseName", () => {
  it("resolves legacy aliases to canonical names", () => {
    expect(resolveExerciseName("RDL")).toBe("Romanian Deadlift (RDL)");
    expect(resolveExerciseName("Hip Thrust (Smith)")).toBe(
      "Hip Thrust (Smith Machine)",
    );
  });

  it("returns the input when no alias exists", () => {
    expect(resolveExerciseName("Push-Up")).toBe("Push-Up");
  });
});

describe("findExercise", () => {
  beforeEach(() => {
    syncCustomExercises([]);
  });

  it("finds exercises by canonical name", () => {
    const exercise = findExercise("Push-Up");
    expect(exercise?.name).toBe("Push-Up");
    expect(exercise?.category).toBe("Upper Body");
  });

  it("finds exercises by alias", () => {
    expect(findExercise("RDL")?.name).toBe("Romanian Deadlift (RDL)");
  });

  it("returns undefined for unknown names", () => {
    expect(findExercise("Not A Real Exercise")).toBeUndefined();
    expect(findExercise(null)).toBeUndefined();
  });

  it("enriches timed exercises with seconds repLabel", () => {
    expect(findExercise("Plank")?.repLabel).toBe("seconds");
    expect(findExercise("Jump Rope")?.repLabel).toBe("seconds");
  });

  it("infers home-friendly tag for bodyweight equipment", () => {
    expect(findExercise("Push-Up")?.tags).toContain("home-friendly");
  });

  it("finds synced custom exercises", () => {
    syncCustomExercises([
      {
        name: "Nordic Curl",
        category: "Glutes & Legs",
        equipment: "Bodyweight",
        repLabel: "reps",
      },
    ]);

    const exercise = findExercise("Nordic Curl");
    expect(exercise?.isCustom).toBe(true);
    expect(exercise?.category).toBe("Glutes & Legs");
  });
});

describe("isTimedExercise", () => {
  it("returns true for timed catalogue entries", () => {
    expect(isTimedExercise(findExercise("Plank"))).toBe(true);
  });

  it("returns false for standard strength exercises", () => {
    expect(isTimedExercise(findExercise("Hip Thrust (Barbell)"))).toBe(false);
  });
});

describe("getRepInputPlaceholder", () => {
  it("returns the correct placeholder per rep label", () => {
    expect(getRepInputPlaceholder("seconds")).toBe("sec");
    expect(getRepInputPlaceholder("per leg")).toBe("reps/leg");
    expect(getRepInputPlaceholder(undefined)).toBe("reps");
  });
});

describe("formatRepLabel", () => {
  it("returns human-readable labels", () => {
    expect(formatRepLabel("seconds")).toBe("Timed (sec)");
    expect(formatRepLabel("per leg")).toBe("Per leg");
    expect(formatRepLabel("reps")).toBe("Reps");
  });
});

describe("filterPlannedExercisesByFocuses", () => {
  beforeEach(() => {
    syncCustomExercises([]);
  });

  const exercises = [
    { name: "Hip Thrust (Barbell)" },
    { name: "Push-Up" },
    { name: "Plank" },
  ];

  it("returns empty when no focuses selected", () => {
    expect(filterPlannedExercisesByFocuses(exercises, [])).toEqual([]);
  });

  it("keeps exercises matching selected focuses", () => {
    expect(
      filterPlannedExercisesByFocuses(exercises, ["Glutes & Legs"]),
    ).toEqual([{ name: "Hip Thrust (Barbell)" }]);
  });

  it("keeps exercises from any selected focus", () => {
    const result = filterPlannedExercisesByFocuses(exercises, [
      "Upper Body",
      "Core & Posture",
    ]);
    expect(result).toEqual([{ name: "Push-Up" }, { name: "Plank" }]);
  });
});

describe("getLibraryExercisesForFocuses", () => {
  beforeEach(() => {
    syncCustomExercises([
      {
        name: "Nordic Curl",
        category: "Glutes & Legs",
        equipment: "Bodyweight",
        repLabel: "reps",
      },
    ]);
  });

  it("returns custom library exercises that match selected focuses", () => {
    const result = getLibraryExercisesForFocuses(
      ["Nordic Curl", "Push-Up"],
      ["Glutes & Legs"],
    );
    expect(result.map((exercise) => exercise.name)).toEqual(["Nordic Curl"]);
  });
});

describe("isDuplicateExerciseName", () => {
  beforeEach(() => {
    syncCustomExercises([]);
  });

  it("detects built-in catalogue duplicates", () => {
    expect(isDuplicateExerciseName("Push-Up")).toBe(true);
  });

  it("detects synced custom duplicates", () => {
    syncCustomExercises([
      {
        name: "Nordic Curl",
        category: "Glutes & Legs",
        equipment: "Bodyweight",
        repLabel: "reps",
      },
    ]);
    expect(isDuplicateExerciseName("nordic curl")).toBe(true);
  });
});

describe("normalizeExerciseNames", () => {
  it("resolves aliases and deduplicates", () => {
    expect(
      normalizeExerciseNames(["RDL", "Romanian Deadlift (RDL)", "Push-Up"]),
    ).toEqual(["Romanian Deadlift (RDL)", "Push-Up"]);
  });

  it("preserves unknown names", () => {
    expect(normalizeExerciseNames(["Custom Move"])).toEqual(["Custom Move"]);
  });
});

describe("filterLibraryByTag", () => {
  const library = ["Push-Up", "Jump Rope", "Face Pull (Cable)"];

  it("returns all names when no tag filter", () => {
    expect(filterLibraryByTag(library, null)).toEqual(library);
  });

  it("filters by cardio tag", () => {
    expect(filterLibraryByTag(library, "cardio")).toEqual(["Jump Rope"]);
  });

  it("filters by home-friendly tag", () => {
    expect(filterLibraryByTag(library, "home-friendly")).toContain("Push-Up");
  });
});

describe("getActiveLibraryTags", () => {
  it("returns only tags present in the library", () => {
    const tags = getActiveLibraryTags(["Push-Up", "Jump Rope"]);
    expect(tags).toContain("home-friendly");
    expect(tags).toContain("cardio");
    expect(tags).not.toContain("recovery");
  });
});

describe("groupCatalogueByCategory", () => {
  it("groups exercises by category and sorts names", () => {
    const grouped = groupCatalogueByCategory([
      { category: "Upper Body", name: "Push-Up" },
      { category: "Upper Body", name: "Pull-Up" },
      { category: "Glutes & Legs", name: "Hip Thrust (Barbell)" },
    ]);

    expect(grouped["Upper Body"]).toEqual(["Pull-Up", "Push-Up"]);
    expect(grouped["Glutes & Legs"]).toEqual(["Hip Thrust (Barbell)"]);
  });
});

describe("filterCategoriesBySearch", () => {
  const categories = {
    "Upper Body": ["Push-Up", "Pull-Up"],
    "Glutes & Legs": ["Hip Thrust (Barbell)"],
  };

  it("returns all categories when search is empty", () => {
    expect(filterCategoriesBySearch(categories, "")).toEqual(categories);
  });

  it("filters exercises by case-insensitive search", () => {
    expect(filterCategoriesBySearch(categories, "push")).toEqual({
      "Upper Body": ["Push-Up"],
    });
  });

  it("omits categories with no matches", () => {
    expect(filterCategoriesBySearch(categories, "plank")).toEqual({});
  });
});
