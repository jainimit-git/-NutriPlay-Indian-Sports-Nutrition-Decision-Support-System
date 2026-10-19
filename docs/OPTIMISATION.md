# NutriPlay Multi-Objective Optimisation Engine

## 1. Problem Formulation

Meal planning for athletes is modeled as a constrained multi-objective combinatorial optimization problem. An athlete requires sufficient caloric and macronutrient support, must remain within daily economic constraints, must adhere strictly to religious or cultural dietary boundaries (such as Jainism or Lacto-Vegetarianism), and should consume a practical, non-repetitive variety of dishes.

### Mathematical Objective Function

$$\max_{\mathbf{x}} \quad \text{Score}(\mathbf{x}) = w_1 \cdot S_{\text{nutrition}}(\mathbf{x}) + w_2 \cdot S_{\text{affordability}}(\mathbf{x}) + w_3 \cdot S_{\text{variety}}(\mathbf{x}) + w_4 \cdot S_{\text{practicality}}(\mathbf{x})$$

Subject to:
1. $\sum_{i \in \text{meals}} \text{Cost}(i) \le \text{Budget}$ (when feasible)
2. $\forall f \in \text{plan}, \quad \text{DietaryConstraint}(f) = 1$
3. $\forall f \in \text{plan}, \quad \text{Allergens}(f) \cap \text{Exclusions} = \emptyset$

Where default weights are configurable:
- $w_1 = 0.45$ (Nutritional Adequacy)
- $w_2 = 0.25$ (Economic Affordability)
- $w_3 = 0.15$ (Food Variety)
- $w_4 = 0.15$ (Meal Timing Practicality)

$$\sum_{k=1}^4 w_k = 1.0$$

---

## 2. Component Scoring Metrics

### A. Nutritional Adequacy Score ($S_{\text{nutrition}}$)
Measures normalized error distance from the target profile across Calories, Protein, Carbohydrates, and Fat:

$$\Delta_{\text{cal}} = \frac{|\text{Actual}_{\text{cal}} - \text{Target}_{\text{cal}}|}{\text{Target}_{\text{cal}}}$$
$$\Delta_{\text{prot}} = \frac{|\text{Actual}_{\text{prot}} - \text{Target}_{\text{prot}}|}{\text{Target}_{\text{prot}}}$$
$$\Delta_{\text{carb}} = \frac{|\text{Actual}_{\text{carb}} - \text{Target}_{\text{carb}}|}{\text{Target}_{\text{carb}}}$$
$$\Delta_{\text{fat}} = \frac{|\text{Actual}_{\text{fat}} - \text{Target}_{\text{fat}}|}{\text{Target}_{\text{fat}}}$$

$$\text{Composite Error } \delta = 0.40 \cdot \Delta_{\text{cal}} + 0.30 \cdot \Delta_{\text{prot}} + 0.20 \cdot \Delta_{\text{carb}} + 0.10 \cdot \Delta_{\text{fat}}$$

$$S_{\text{nutrition}} = \max\left(0, \min\left(100, (1.0 - \delta) \times 100\right)\right)$$

### B. Affordability Score ($S_{\text{affordability}}$)
If the meal plan is within budget ($\text{Cost} \le \text{Budget}$):
$$S_{\text{affordability}} = \max\left(70, 100 - \frac{\text{Cost}}{\text{Budget}} \times 20\right)$$

If the meal plan exceeds budget ($\text{Cost} > \text{Budget}$):
$$S_{\text{affordability}} = \max\left(0, \left(1.0 - \frac{\text{Cost} - \text{Budget}}{\text{Budget}} \times 2\right) \times 100\right)$$

### C. Variety Score ($S_{\text{variety}}$)
Penalizes repetitive mono-dieting and rewards distinct ingredient selections:
$$S_{\text{variety}} = \min\left(100, \frac{N_{\text{unique}}}{10} \times 70 + \text{Penalty}_{\text{repeat}}\right)$$

### D. Practicality Score ($S_{\text{practicality}}$)
Evaluates whether fast-digesting carbohydrates are placed in pre-training slots and high-biological-value protein in post-training slots.

---

## 3. Infeasibility Detection & Relaxation Mechanism

If an athlete specifies an artificially low budget (e.g. ₹90/day) that cannot mathematically procure the necessary 3000 kcal and 140g protein:
1. NutriPlay **refuses to silently produce a deficient plan**.
2. It flags `status: "budget_infeasible"`.
3. It deterministically computes the minimum feasible procurement cost:
   $$\text{Budget}_{\text{min}} = \lceil \text{Cost}_{\text{actual}} \times 1.05 \rceil$$
4. It presents an actionable advisory:
   *"Your daily budget of ₹X is insufficient. Increasing your budget to at least ₹Y will satisfy both macronutrient targets and dietary constraints."*
