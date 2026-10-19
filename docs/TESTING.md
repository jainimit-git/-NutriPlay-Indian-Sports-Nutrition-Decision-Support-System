# NutriPlay Testing Strategy & Quality Assurance

Testing is a core quality requirement of the NutriPlay engineering lifecycle. Every calculation, filter, and integration flow is verified with automated tests.

---

## 1. Test Suite Structure

NutriPlay uses **Vitest** with JSDOM and `@testing-library/jest-dom` for ultra-fast native TypeScript execution.

| Test File | Type | Coverage Areas | Tests |
|---|---|---|---|
| `tests/unit/foundation.test.ts` | Unit | Environment configuration, math operations | 2 |
| `tests/unit/athleteValidation.test.ts` | Unit | Zod schema validation, physiological bounds, sweat inputs | 12 |
| `tests/unit/energyEngine.test.ts` | Unit | Mifflin-St Jeor BMR, MET exercise expenditure, TDEE, steps | 5 |
| `tests/unit/nutrientEngine.test.ts` | Unit | Protein scaling, carb periodization, fat floors, ICMR micronutrients | 3 |
| `tests/unit/dietaryFilter.test.ts` | Unit | Vegetarian, Jain strict compliance, allergen exclusions, IFCT validator | 7 |
| `tests/unit/optimisation.test.ts` | Unit | Feasibility, budget relaxation, Jain rules, synthetic toy dataset | 4 |
| `tests/unit/weather.test.ts` | Unit | NOAA Heat Index formula, risk classifications, offline climate fallbacks | 5 |
| `tests/unit/hydration.test.ts` | Unit | Baseline fluids, measured sweat tests, empirical fallback, sodium guidelines | 5 |
| `tests/unit/redsSafety.test.ts` | Unit | Energy availability thresholds, RED-S flags, overtraining screen | 4 |
| `tests/unit/evaluation.test.ts` | Unit | Baselines 1 & 2, weather and training ablation sensitivity | 4 |
| `tests/integration/recommendationFlow.test.ts` | Integration | Full end-to-end pipeline across multiple sports disciplines | 3 |

**Total Automated Tests:** 54 Passing Tests across 11 Test Suites.

---

## 2. Running Automated Tests

```bash
# Run all unit and integration test suites
npm test

# Run tests in watch mode during active development
npm run test:watch

# Run test coverage analysis
npm run test:coverage

# Run TypeScript strict type-check
npm run typecheck

# Execute research benchmark pipeline
npm run evaluate
```
