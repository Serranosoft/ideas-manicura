// Start of this content update: 29 September 2026, midnight in Madrid.
// Move this date forward when preparing the next content update.
export const CATEGORY_UPDATE_SINCE = "2026-09-28T22:00:00Z";

export function applyCategoryUpdates(categories, updates) {
    const changed = new Set(
        (Array.isArray(updates?.categories) ? updates.categories : [])
            .filter((item) => item && typeof item.category === "string" && Number.isInteger(item.count) && item.count > 0)
            .map((item) => item.category)
    );
    return categories.map((category) => ({
        ...category,
        isNew: changed.has(category.name.toLowerCase().split(" ").join("-")),
    }));
}
