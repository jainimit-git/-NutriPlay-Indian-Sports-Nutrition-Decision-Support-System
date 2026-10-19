export type MealSlot =
  | "breakfast"
  | "mid_morning"
  | "lunch"
  | "pre_training"
  | "post_training"
  | "dinner"
  | "snack";

export type FoodCategory =
  | "cereals_millets"
  | "pulses_legumes"
  | "dairy"
  | "poultry_meat_fish"
  | "vegetables"
  | "fruits"
  | "nuts_seeds"
  | "beverages_sports";

export type RegionalCuisine =
  | "pan_indian"
  | "north_indian"
  | "south_indian"
  | "west_indian"
  | "east_indian";

export interface FoodItem {
  id: string;
  name: string;
  hindiName?: string;
  category: FoodCategory;
  appropriateMealSlots: MealSlot[];
  servingUnit: string; // e.g. "2 medium rotis (60g)", "1 katori (150g)"
  servingSizeGrams: number;

  // Macronutrients per serving
  energyKcal: number;
  proteinG: number;
  carbohydratesG: number;
  fatG: number;
  fiberG: number;

  // Micronutrients per serving
  ironMg: number;
  calciumMg: number;
  sodiumMg: number;

  // Dietary & Cultural flags
  isVegetarian: boolean;
  isNonVegetarian: boolean;
  isJain: boolean; // Strictly complies with Jain restrictions (no roots, onion, garlic, animal flesh, eggs)

  // Allergen / Exclusion markers
  allergens: string[]; // "milk", "egg", "peanuts", "tree_nuts", "soy", "gluten", "fish"

  // Cost & Sourcing
  approximateCostInr: number; // INR per standard serving
  regionalCuisine: RegionalCuisine;
}

export interface FoodFilterCriteria {
  dietaryPreference: "vegetarian" | "non_vegetarian" | "jain";
  excludedAllergens?: string[];
  mealSlot?: MealSlot;
  maxCostPerServingInr?: number;
}

