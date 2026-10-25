import { FoodFilterCriteria, FoodItem, MealSlot } from "@/lib/types/food";
import { INDIAN_FOOD_DATABASE } from "@/data/foods/indianFoodsDataset";

/**
 * Deterministic dietary constraint filtering engine:
 * Strictly enforces Vegetarian, Jain, Non-Vegetarian, Allergen, and Meal-Slot rules.
 */
export function filterFoodsByConstraints(
  foods: FoodItem[] = INDIAN_FOOD_DATABASE,
  criteria: FoodFilterCriteria
): FoodItem[] {
  return foods.filter((food) => {
    // 1. Dietary Preference Filtering
    if (criteria.dietaryPreference === "vegetarian") {
      // Must be vegetarian, strictly no meat/poultry/fish/eggs
      if (!food.isVegetarian || food.isNonVegetarian) {
        return false;
      }
    } else if (criteria.dietaryPreference === "jain") {
      // Must be strictly Jain compliant (no roots, tubers, onions, garlic, non-veg, eggs)
      if (!food.isJain || !food.isVegetarian || food.isNonVegetarian) {
        return false;
      }
    } else if (criteria.dietaryPreference === "vegan") {
      const allergens = food.allergens.map((allergen) => allergen.toLowerCase());
      if (
        !food.isVegetarian ||
        food.isNonVegetarian ||
        food.category === "dairy" ||
        allergens.includes("milk") ||
        allergens.includes("egg")
      ) {
        return false;
      }
    }
    // If "non_vegetarian", both vegetarian and non-vegetarian foods are permissible

    // 2. Allergen / Intolerance Filtering
    if (criteria.excludedAllergens && criteria.excludedAllergens.length > 0) {
      const hasExcludedAllergen = criteria.excludedAllergens.some((excluded) =>
        food.allergens.map((a) => a.toLowerCase()).includes(excluded.toLowerCase())
      );
      if (hasExcludedAllergen) {
        return false;
      }
    }

    // 3. Meal Slot Compatibility
    if (criteria.mealSlot) {
      if (!food.appropriateMealSlots.includes(criteria.mealSlot)) {
        return false;
      }
    }

    // 4. Cost ceiling per serving (if specified)
    if (criteria.maxCostPerServingInr !== undefined) {
      if (food.approximateCostInr > criteria.maxCostPerServingInr) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Retrieves food options grouped by meal slot given an athlete's dietary rules.
 */
export function getAvailableFoodsBySlot(
  criteria: FoodFilterCriteria,
  dataset: FoodItem[] = INDIAN_FOOD_DATABASE
): Record<MealSlot, FoodItem[]> {
  const slots: MealSlot[] = [
    "breakfast",
    "mid_morning",
    "lunch",
    "pre_training",
    "post_training",
    "dinner",
    "snack",
  ];

  const result: Partial<Record<MealSlot, FoodItem[]>> = {};

  for (const slot of slots) {
    result[slot] = filterFoodsByConstraints(dataset, {
      ...criteria,
      mealSlot: slot,
    });
  }

  return result as Record<MealSlot, FoodItem[]>;
}

/**
 * Validates and imports external IFCT food records into the application database schema.
 */
export function validateAndImportFoodItem(item: Partial<FoodItem>): { success: boolean; item?: FoodItem; error?: string } {
  if (!item.id || !item.name) {
    return { success: false, error: "Food item must have a valid id and name" };
  }
  if (item.energyKcal === undefined || item.energyKcal < 0) {
    return { success: false, error: "Energy kcal must be a non-negative number" };
  }
  if (item.proteinG === undefined || item.proteinG < 0) {
    return { success: false, error: "Protein grams must be a non-negative number" };
  }
  if (item.carbohydratesG === undefined || item.carbohydratesG < 0) {
    return { success: false, error: "Carbohydrates grams must be a non-negative number" };
  }
  if (item.fatG === undefined || item.fatG < 0) {
    return { success: false, error: "Fat grams must be a non-negative number" };
  }
  if (item.approximateCostInr === undefined || item.approximateCostInr < 0) {
    return { success: false, error: "Approximate cost must be a non-negative number" };
  }

  const validItem: FoodItem = {
    id: item.id,
    name: item.name,
    hindiName: item.hindiName,
    category: item.category || "cereals_millets",
    appropriateMealSlots: item.appropriateMealSlots && item.appropriateMealSlots.length > 0 ? item.appropriateMealSlots : ["snack"],
    servingUnit: item.servingUnit || "1 serving",
    servingSizeGrams: item.servingSizeGrams || 100,
    energyKcal: item.energyKcal,
    proteinG: item.proteinG,
    carbohydratesG: item.carbohydratesG,
    fatG: item.fatG,
    fiberG: item.fiberG || 0,
    ironMg: item.ironMg || 0,
    calciumMg: item.calciumMg || 0,
    sodiumMg: item.sodiumMg || 0,
    isVegetarian: Boolean(item.isVegetarian),
    isNonVegetarian: Boolean(item.isNonVegetarian),
    isJain: Boolean(item.isJain),
    allergens: item.allergens || [],
    approximateCostInr: item.approximateCostInr,
    regionalCuisine: item.regionalCuisine || "pan_indian",
  };

  return { success: true, item: validItem };
}
