import { describe, it, expect } from "vitest";
import {
  filterFoodsByConstraints,
  getAvailableFoodsBySlot,
  validateAndImportFoodItem,
} from "@/lib/nutrition/dietaryEngine";
import { INDIAN_FOOD_DATABASE } from "@/data/foods/indianFoodsDataset";

describe("Dietary Constraint Engine Unit Tests", () => {
  it("strictly excludes all poultry, fish, meat, and eggs for vegetarian athletes", () => {
    const vegFoods = filterFoodsByConstraints(INDIAN_FOOD_DATABASE, {
      dietaryPreference: "vegetarian",
    });

    expect(vegFoods.length).toBeGreaterThan(10);
    for (const food of vegFoods) {
      expect(food.isVegetarian).toBe(true);
      expect(food.isNonVegetarian).toBe(false);
      expect(food.category).not.toBe("poultry_meat_fish");
      expect(food.name.toLowerCase()).not.toContain("egg");
      expect(food.name.toLowerCase()).not.toContain("chicken");
      expect(food.name.toLowerCase()).not.toContain("fish");
    }
  });

  it("strictly enforces Jain dietary restrictions: excludes root vegetables, onions, garlic, and non-veg", () => {
    const jainFoods = filterFoodsByConstraints(INDIAN_FOOD_DATABASE, {
      dietaryPreference: "jain",
    });

    expect(jainFoods.length).toBeGreaterThan(5);
    for (const food of jainFoods) {
      expect(food.isJain).toBe(true);
      expect(food.isVegetarian).toBe(true);
      expect(food.isNonVegetarian).toBe(false);
      // No potato items
      expect(food.id).not.toBe("veg_aloo_jeera");
      // No standard onion-garlic tadka
      expect(food.id).not.toBe("pulse_yellow_dal_tadka");
    }

    const jainIds = jainFoods.map((f) => f.id);
    expect(jainIds).toContain("pulse_jain_dal_tadka");
    expect(jainIds).toContain("cereal_roti_wheat");
    expect(jainIds).toContain("fruit_fresh_banana");
  });

  it("allows both vegetarian and non-vegetarian foods for non-vegetarian athletes", () => {
    const allFoods = filterFoodsByConstraints(INDIAN_FOOD_DATABASE, {
      dietaryPreference: "non_vegetarian",
    });

    const hasChicken = allFoods.some((f) => f.id === "poultry_chicken_breast_curry");
    const hasRoti = allFoods.some((f) => f.id === "cereal_roti_wheat");
    const hasEggs = allFoods.some((f) => f.id === "poultry_boiled_eggs_whole");

    expect(hasChicken).toBe(true);
    expect(hasRoti).toBe(true);
    expect(hasEggs).toBe(true);
  });

  it("excludes tagged animal foods, dairy, and eggs for vegan plans", () => {
    const veganFoods = filterFoodsByConstraints(INDIAN_FOOD_DATABASE, {
      dietaryPreference: "vegan",
    });

    expect(veganFoods.length).toBeGreaterThan(0);
    for (const food of veganFoods) {
      expect(food.isVegetarian).toBe(true);
      expect(food.isNonVegetarian).toBe(false);
      expect(food.category).not.toBe("dairy");
      expect(food.allergens.map((allergen) => allergen.toLowerCase())).not.toContain("milk");
      expect(food.allergens.map((allergen) => allergen.toLowerCase())).not.toContain("egg");
    }
  });

  it("completely excludes dairy when 'milk' allergen is specified", () => {
    const lactoseFreeFoods = filterFoodsByConstraints(INDIAN_FOOD_DATABASE, {
      dietaryPreference: "vegetarian",
      excludedAllergens: ["milk"],
    });

    for (const food of lactoseFreeFoods) {
      expect(food.allergens).not.toContain("milk");
      expect(food.category).not.toBe("dairy");
      expect(food.id).not.toBe("dairy_paneer_bhurji");
      expect(food.id).not.toBe("dairy_curd_dahi");
      expect(food.id).not.toBe("dairy_cow_milk");
    }
  });

  it("completely excludes peanuts when 'peanuts' exclusion is specified", () => {
    const peanutFreeFoods = filterFoodsByConstraints(INDIAN_FOOD_DATABASE, {
      dietaryPreference: "vegetarian",
      excludedAllergens: ["peanuts"],
    });

    for (const food of peanutFreeFoods) {
      expect(food.allergens).not.toContain("peanuts");
      expect(food.id).not.toBe("nuts_roasted_peanuts");
      expect(food.id).not.toBe("cereal_poha_vegetable");
    }
  });

  it("correctly partitions foods across all standard sports meal slots", () => {
    const slotMap = getAvailableFoodsBySlot({
      dietaryPreference: "vegetarian",
    });

    expect(slotMap.breakfast.length).toBeGreaterThan(0);
    expect(slotMap.lunch.length).toBeGreaterThan(0);
    expect(slotMap.pre_training.length).toBeGreaterThan(0);
    expect(slotMap.post_training.length).toBeGreaterThan(0);
    expect(slotMap.dinner.length).toBeGreaterThan(0);
    expect(slotMap.snack.length).toBeGreaterThan(0);
  });

  it("validates external IFCT food records and rejects malformed records", () => {
    const validRaw = {
      id: "custom_millet_roti",
      name: "Ragi Millet Roti",
      energyKcal: 180,
      proteinG: 4.5,
      carbohydratesG: 38.0,
      fatG: 1.2,
      approximateCostInr: 12,
      isVegetarian: true,
      isNonVegetarian: false,
      isJain: true,
    };

    const validResult = validateAndImportFoodItem(validRaw);
    expect(validResult.success).toBe(true);
    expect(validResult.item?.name).toBe("Ragi Millet Roti");

    const invalidRaw = {
      id: "broken_item",
      // missing name and negative calories
      energyKcal: -100,
    };
    const invalidResult = validateAndImportFoodItem(invalidRaw);
    expect(invalidResult.success).toBe(false);
  });
});
