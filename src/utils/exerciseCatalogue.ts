export function groupCatalogueByCategory(
  catalogue: { category: string; name: string }[],
): Record<string, string[]> {
  return catalogue.reduce(
    (acc, ex) => {
      if (!acc[ex.category]) acc[ex.category] = [];
      acc[ex.category].push(ex.name);
      return acc;
    },
    {} as Record<string, string[]>,
  );
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
