# NutriPlay System Architecture

## 1. Architectural Philosophy

NutriPlay is architectured as a multi-tier, modular sports nutrition decision-support system designed specifically for the unique dietary patterns, cultural requirements, environmental heat stresses, and economic realities of Indian athletes.

The system enforces a clean separation of concerns:

```
+-------------------------------------------------------------------------+
|                              PRESENTATION (UI)                          |
|  - AthleteForm (Zod-validated input & athlete presets)                  |
|  - AthleteSummaryCard (Demographics, sport discipline, weather status)  |
|  - VisualisationSection (Progress bars, macro splits, budget allocation)|
|  - MealPlanCard (Indian meal schedules, portion sizes, IFCT subtotals)  |
|  - HydrationCard (Sweat rates, Heat Index risk, electrolyte strategies) |
|  - SafetyAlertCard (RED-S screen, overtraining, mandatory disclaimer)   |
|  - ExplanationsCard (Transparent mathematical step breakdowns)          |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                         APPLICATION SERVICE LAYER                       |
|  - /api/plan route & recommendationService.ts                           |
|  - Orchestrates domain calculation engines and input validation         |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                            DOMAIN LOGIC ENGINES                         |
|  - energyEngine.ts: Mifflin-St Jeor BMR, MET exercise expenditure       |
|  - nutrientEngine.ts: Protein scaling, carb periodization, ICMR micronut|
|  - dietaryEngine.ts: Vegetarian, Jain, non-veg & allergen filtering     |
|  - mealOptimizer.ts: Multi-objective deterministic optimization         |
|  - heatIndex.ts: NOAA Rothfusz regression equation                     |
|  - sweatRateEngine.ts: Measured test vs empirical fallback sweat rate   |
|  - hydrationEngine.ts: Basal turnover, 125% sweat replacement, Na+     |
|  - redsSafetyEngine.ts: Energy Availability (EA), IOC RED-S thresholds  |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                                DATA LAYER                               |
|  - indianFoodsDataset.ts: IFCT 2017 & ICMR-NIN composition & costs      |
|  - sportsData.ts: MET values, category, carb & protein multipliers      |
|  - nutritionReference.ts: ICMR-NIN 2020 RDAs & macronutrient ranges    |
|  - athletePresets.ts: Realistic benchmark Indian athlete archetypes     |
+-------------------------------------------------------------------------+
```

## 2. Directory Hierarchy

```
app/
  api/
    plan/
      route.ts             # POST endpoint for decision-support assessment
  globals.css              # Tailwind CSS base styles
  layout.tsx               # Root layout with header, navigation, and disclaimer footer
  page.tsx                 # Interactive landing and evaluation dashboard
components/
  athlete/
    AthleteForm.tsx        # Interactive input form with presets and sweat rate test accordion
  dashboard/
    AthleteSummaryCard.tsx # Demographics, sport discipline, and weather conditions
    VisualisationSection.tsx # Progress charts for target vs actual macros & budget
    MealPlanCard.tsx       # Daily meal slots, IFCT food items, portions, and costs
    HydrationCard.tsx      # Sweat rates, Heat Index risk, and Indian electrolyte beverages
    SafetyAlertCard.tsx    # RED-S Energy Availability screen and overtraining warnings
    ExplanationsCard.tsx   # Mathematical step formulas for viva defense
lib/
  types/                   # Strict TypeScript domain interfaces
  validation/              # Zod input schemas
  nutrition/               # Energy, nutrient targets, and dietary filtering engines
  hydration/              # Sweat rate and fluid calculation engines
  weather/                # Weather service abstraction and Heat Index physics
  optimisation/           # Multi-objective optimization algorithm and weights
  safety/                 # RED-S safety and IOC energy availability thresholds
  recommendations/        # Master orchestration pipeline
  evaluation/             # Baseline comparison systems and ablation engine
data/
  foods/                  # Authentic Indian Food Composition Dataset (IFCT 2017)
  reference/              # Sports MET registry, ICMR-NIN nutritional standards, presets
scripts/
  runEvaluation.ts        # Automated research runner for synthetic cohort benchmarks
tests/
  unit/                   # Unit tests for every calculation and engine
  integration/            # End-to-end integration flow tests
docs/                     # Comprehensive scientific and architectural documentation
```

## 3. Design Principles

1. **Deterministic Over Generative AI**: Numerical nutritional quantities and energy values are computed through validated physiological formulas and mathematical optimization, completely eliminating artificial hallucinations.
2. **Strict Non-Diagnostic Ethics**: The system serves as a decision-support and educational tool, explicitly displaying non-diagnostic safety screens and requiring clinical consultation for clinical conditions.
3. **Graceful Fallbacks**: The server-side weather service guarantees application continuity even under complete external API outages or missing environment keys by utilizing an Indian regional climatological baseline.
4. **Transparency & Viva Readiness**: Every calculated recommendation contains human-readable rationale, mathematical formulas, and input-output mappings for academic defense.

