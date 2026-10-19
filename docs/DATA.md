# NutriPlay Data Architecture & IFCT Schema

## 1. Indian Food Composition Dataset

NutriPlay incorporates authentic Indian culinary staples derived from the **Indian Food Composition Tables (IFCT 2017)** compiled by the National Institute of Nutrition (ICMR-NIN).

### Schema Specification (`lib/types/food.ts`)

```typescript
export interface FoodItem {
  id: string;                         // Unique machine identifier
  name: string;                       // Standard English name
  hindiName?: string;                 // Traditional Indian name
  category: FoodCategory;             // Cereals, Pulses, Dairy, Poultry, Vegetables, etc.
  appropriateMealSlots: MealSlot[];   // Breakfast, Mid-Morning, Lunch, Pre/Post-Training, Dinner, Snack
  servingUnit: string;                // Domestic measure (e.g. "2 medium rotis (60g)", "1 katori (150g)")
  servingSizeGrams: number;           // Standard mass in grams

  // Macronutrients per serving
  energyKcal: number;
  proteinG: number;
  carbohydratesG: number;
  fatG: number;
  fiberG: number;

  // Micronutrients & Electrolytes per serving
  ironMg: number;
  calciumMg: number;
  sodiumMg: number;

  // Cultural & Religious Classifications
  isVegetarian: boolean;              // Lacto-vegetarian / vegetarian compliant
  isNonVegetarian: boolean;           // Contains meat, poultry, fish, or eggs
  isJain: boolean;                    // Complies with strict Jain dietary rules

  // Allergens & Exclusions
  allergens: string[];                // "milk", "egg", "peanuts", "tree_nuts", "soy", "gluten", "fish"

  // Economic Parameters
  approximateCostInr: number;         // Estimated domestic procurement price (₹ INR)
  regionalCuisine: RegionalCuisine;   // Pan-Indian, North, South, East, West
}
```

## 2. Jain Dietary Rules Encoding

NutriPlay rigorously documents and implements traditional Jain dietary restrictions:
1. **Zero Animal Flesh & Eggs**: Excludes all poultry, meat, fish, and eggs.
2. **Zero Underground Tubers / Roots**: Strictly excludes potatoes (`Aloo`), onions (`Piyaz`), garlic (`Lehsun`), carrots, and radishes.
3. **No Underground Peanuts / Groundnuts**: Excludes peanuts and items cooked with groundnut oil where traditional orthodox codes apply.
4. **Dairy Allowed**: Pure cow milk, homemade curd (`Dahi`), and fresh paneer without gelatin/rennet are permitted under orthodox lacto-vegetarian rules.

## 3. Extensible Import Pipeline

NutriPlay provides `validateAndImportFoodItem(rawItem)` to allow sports nutrition departments and dietitians to ingest new food items into the system with automated data validation and bounds checking.
