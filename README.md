# NutriPlay — Indian Sports Nutrition Decision-Support System

[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-54%20Passing-emerald?style=flat&logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **NutriPlay** is an engineering decision-support system designed to generate scientifically personalized one-day meal, macro, and hydration plans for Indian athletes based on Indian Food Composition Tables (IFCT), individual anthropometrics, training load periodization, environmental heat stress, dietary/cultural constraints, and daily food budget.

---

## 1. Project Overview
NutriPlay addresses the nutritional and hydration needs of Indian athletes participating in competitive sports (Cricket, Badminton, Kabaddi, Field Hockey, Weightlifting, Running, Football, Wrestling, Swimming). It operates as a deterministic decision engine rather than an opaque generative AI chatbot, ensuring reproducibility, safety, and academic rigor suitable for engineering defense and sports-science research.

## 2. Problem Statement
Most conventional nutrition apps rely on Western dietary databases (USDA) and neglect Indian culinary traditions, pulse-and-cereal pairings, vegetarian staples, and strict Jain dietary laws (avoidance of root vegetables, onions, and garlic). Furthermore, they fail to model tropical environmental heat stress (Heat Index) and ignore grassroots athletic budget boundaries, leading to impractical or culturally incompatible plans.

## 3. Motivation
In India, millions of aspiring athletes train in high-heat, high-humidity environments on limited budgets. Due to a lack of affordable sports dietitians, many suffer from chronic under-fueling, muscle cramping, hyponatremia, and Low Energy Availability (LEA). NutriPlay bridges this gap with an accessible, scientifically grounded, transparent software tool.

## 4. Research Gap
- **Absence of IFCT-Grounded Sports Models**: Existing tools use generic databases lacking authentic Indian food composition data (ICMR-NIN).
- **Static vs. Climate-Aware Hydration**: Traditional guidelines ignore biometeorological heat indices and seasonal Indian climates.
- **Single vs. Multi-Objective Trade-offs**: Most apps optimize purely for calories while ignoring affordability, variety, and cultural rules.

## 5. Key Features
- **Individualized Athlete Profiling**: Validates age, sex, weight, height, sport discipline, training volume, and budget.
- **Transparent Energy Requirement Engine**: Mifflin-St Jeor BMR + Non-training PAL + Exercise Energy Expenditure (METs).
- **Nutrient Periodization**: Sports-specific protein (1.2–2.4 g/kg), load-periodized carbs (3.5–10 g/kg), and ICMR micronutrients (Iron: 19mg male, 29mg female).
- **IFCT Indian Food Database**: Authentic Indian staples with domestic portions and real-market cost indices.
- **Strict Dietary Constraints**: Vegetarian, Non-Vegetarian, and orthodox Jain diet filtering with custom allergen exclusions.
- **Multi-Objective Optimization**: Balances nutrition, affordability, variety, and meal timing.
- **Budget Infeasibility Detection**: Flags unrealistic budgets without silently generating starved plans; suggests minimum feasible procurement cost.
- **Climate-Aware Hydration & Heat Index**: NOAA Rothfusz regression equation adjusting fluid and electrolyte intake.
- **Measured vs. Empirical Sweat Rate**: Supports verified field test data or empirical sports fallbacks.
- **RED-S & Low Energy Availability Safety Screen**: Conservative IOC consensus energy availability screening ($EA < 30\text{ kcal/kg FFM}$).
- **Explainable Recommendations**: Step-by-step mathematical explanations for every major calculation.

---

## 6. Architecture
NutriPlay employs a clean separation of concerns across Presentation (UI), Application Service, Domain Logic Engines, and Data Layers. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete details.

---

## 7. Technology Stack
- **Frontend Framework**: Next.js 14 (App Router), React 18, TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Validation**: Zod (Runtime input and profile boundary validation)
- **Testing**: Vitest, JSDOM, `@testing-library/jest-dom`
- **Icons**: Lucide React
- **Script Runner**: tsx

---

## 8. Installation

```bash
# Clone the repository
git clone https://github.com/jainimit-git/-NutriPlay-Indian-Sports-Nutrition-Decision-Support-System.git
cd "-NutriPlay-Indian-Sports-Nutrition-Decision-Support-System"

# Install dependencies
npm install
```

---

## 9. Environment Variables
Create a `.env.local` file from the provided template:

```bash
cp .env.example .env.local
```

Configure your environment settings (optional live weather API key):
```env
WEATHER_API_KEY=your_openweathermap_api_key_here
WEATHER_API_BASE_URL=https://api.openweathermap.org/data/2.5
```
*Note: If no API key is provided, the system gracefully uses the scientific Indian regional climatological baseline.*

---

## 10. How to Run

```bash
# Start the Next.js development server
npm run dev

# Open in browser
# http://localhost:3000
```

To build and run in production:
```bash
npm run build
npm start
```

---

## 11. How to Test

```bash
# Run all unit and integration test suites (54 automated tests)
npm test

# Run tests with real-time watch mode
npm run test:watch

# Run TypeScript strict type verification
npm run typecheck

# Run automated research benchmark and ablation evaluation
npm run evaluate
```

---

## 12. How Optimisation Works
NutriPlay solves a multi-objective optimization problem:
$$\text{Score} = 0.45 \times \text{NutritionAdequacy} + 0.25 \times \text{Affordability} + 0.15 \times \text{Variety} + 0.15 \times \text{Practicality}$$
Detailed in [docs/OPTIMISATION.md](docs/OPTIMISATION.md).

---

## 13. How Nutrition Calculations Work
- **BMR**: Mifflin-St Jeor formula.
- **PAL**: 1.35 baseline non-training ambulation.
- **EEE**: Sport MET $\times$ Intensity modifier $\times$ Weight $\times$ Duration.
- **Macros**: Periodized based on sport category and training load.
Detailed in [docs/FORMULAS.md](docs/FORMULAS.md).

---

## 14. How Weather Integration Works
Server-side weather abstraction calculates ambient temperature and relative humidity for the athlete's location, running the NOAA Rothfusz regression equation to compute the biometeorological Heat Index.

---

## 15. How Hydration Estimation Works
- Basal fluid: $35\text{ ml/kg body weight}$.
- Training fluid: $125\%$ of sweat deficit.
- Heat adjustment: $+0.2\text{L to }+0.8\text{L}$ based on Heat Index.
- Electrolytes: Sodium replenishment guidance featuring authentic Indian solutions (Tender Coconut Water, Masala Chaas, Nimbu Pani, ORS).

---

## 16. RED-S Safety Mechanism
Calculates Energy Availability ($EA$):
$$EA = \frac{\text{Energy Intake} - \text{Exercise Energy Expenditure}}{\text{Fat-Free Mass (kg)}}$$
Flags `"Potential low-energy-availability risk — consider professional assessment"` if $EA < 30\text{ kcal/kg FFM}$.
Detailed in [docs/SAFETY.md](docs/SAFETY.md).

---

## 17. Dataset Structure
IFCT 2017 food composition dataset covering cereals, pulses, dairy, poultry, fish, vegetables, fruits, and hydration beverages. Detailed in [docs/DATA.md](docs/DATA.md).

---

## 18. Evaluation Methodology
Automated benchmark across 10 synthetic athlete profiles against Baseline 1 (Generic Clinical) and Baseline 2 (Greedy Planner), and systematic ablation trials. Detailed in [docs/EVALUATION.md](docs/EVALUATION.md).

---

## 19. Limitations
- Does not replace biochemical lab testing or individualized clinical monitoring.
- Uses estimated rather than dual-energy X-ray absorptiometry (DEXA) measured Fat-Free Mass.
- Retail food pricing reflects urban/semi-urban averages and may fluctuate seasonally.

---

## 20. Future Work
- Integration with wearable sensor telemetry (continuous heart rate and GPS player tracking).
- Computer vision for domestic Indian plate portion scanning.
- Longitudinal multi-day macro periodization across microcycles and macrocycles.

---

## License
MIT License. Copyright &copy; 2026 Nimit Jain.
