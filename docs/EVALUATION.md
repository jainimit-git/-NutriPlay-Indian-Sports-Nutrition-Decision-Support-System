# NutriPlay Research Evaluation & Empirical Findings

## 1. Experimental Methodology

To evaluate NutriPlay objectively for academic viva defense and research-paper readiness, we formulated an automated benchmarking pipeline (`scripts/runEvaluation.ts`) executed across a standardized cohort of 10 synthetic Indian athlete profiles.

The cohort intentionally reflects realistic variability across:
- **Sports Disciplines**: Cricket, Badminton, Kabaddi, Running, Weightlifting, Field Hockey, Football, Swimming, Cycling, Athletics.
- **Biometric Profiles**: Male and Female athletes, body masses from 50 kg to 85 kg, ages 19–27 years.
- **Dietary Categories**: Lacto-Vegetarian, Non-Vegetarian, and orthodox Jain diets.
- **Regional Climate Environments**: Mumbai, Delhi, Chennai, Bengaluru, Hyderabad, Kolkata, Ahmedabad, Pune, Chandigarh, Jaipur.
- **Economic Budgets**: ₹320 to ₹600 INR/day.

---

## 2. Baseline Comparison Systems

NutriPlay was benchmarked against two standard approaches:

1. **Baseline 1 (Generic Clinical Nutrition)**:
   - Uses Mifflin-St Jeor with a static non-sports Physical Activity Level ($\text{PAL} = 1.60$).
   - Flat general population protein recommendation of $1.0\text{ g/kg body weight}$.
   - Static 3-meal clinical template without periodized pre/post workout sports nutrition.

2. **Baseline 2 (Greedy Rule-Based Planner)**:
   - Matches target energy greedily by adding the first available foods until calories are met.
   - Ignores budget constraints, variety penalties, and sports nutrient timing.

---

## 3. Empirical Results Summary

From actual benchmark execution across the 10-athlete synthetic cohort:

| System | Mean Calorie Adequacy | Mean Protein Adequacy | Multi-Objective Score |
|---|---|---|---|
| **NutriPlay (Proposed Full System)** | **102%** | **122%** | **81 / 100** |
| **Baseline 1 (Generic Clinical)** | 42% (Chronic Deficit) | 65% | 34 / 100 |
| **Baseline 2 (Greedy Rule-Based)** | 97% | 98% | 58 / 100 |

### Key Scientific Takeaways:
1. **Clinical Template Inadequacy**: Baseline 1 severely under-fuels competitive athletes (achieving only 42% of required daily athletic calories) because standard domestic plates designed for sedentary individuals fail to match the energetic demands of 1.5–3.0 hours of sports practice.
2. **Greedy Deficiencies**: While Baseline 2 reaches raw calories (97%), it repeatedly selects monotonous single items (e.g. 5 rotis or 4 bowls of dal) and regularly blows through athlete budgets without timing sports recovery.
3. **NutriPlay Performance**: NutriPlay achieves 102% caloric adequacy and 122% protein target satisfaction with 100% strict dietary compliance (0 non-Jain items in Jain plans, 0 meat/egg items in vegetarian plans).

---

## 4. Ablation Study Findings

Systematic module disabling confirms the individual necessity of each subsystem:

1. **Weather Sensitivity**: Disabling environmental weather modeling in high-heat cities (e.g. Mumbai, Chennai, Delhi) resulted in an average hydration deficit of **+0.4L to +0.8L per day**, putting athletes at risk of heat exhaustion and severe cramp risk.
2. **Training Load Sensitivity**: Disabling training-load periodization dropped energy targets by **800 to 1,600 kcal/day** and carbohydrate targets by **150 to 350 g/day**, demonstrating that NutriPlay sensitively periods athletic fuel based on session load.

Raw results are machine-readable in `docs/EVALUATION_RESULTS.json` and `docs/ABLATION_RESULTS.csv`.
