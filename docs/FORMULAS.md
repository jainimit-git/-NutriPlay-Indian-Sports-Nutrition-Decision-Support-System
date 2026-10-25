# NutriPlay Mathematical & Physiological Formulas

This document details all mathematical, physiological, and biometeorological equations implemented across the NutriPlay decision-support engines.

---

## 1. Basal Metabolic Rate (BMR)

NutriPlay utilizes the validated **Mifflin-St Jeor Equation** (Mifflin et al., 1990), recognized by the Academy of Nutrition and Dietetics and the American College of Sports Medicine (ACSM) as the most reliable predictive formula for non-obese active individuals.

### Male Formula
$$\text{BMR}_{\text{male}} = 10 \times W + 6.25 \times H - 5 \times A + 5$$

### Female Formula
$$\text{BMR}_{\text{female}} = 10 \times W + 6.25 \times H - 5 \times A - 161$$

Where:
- $W$ = Body weight in kilograms (kg)
- $H$ = Stature / Height in centimeters (cm)
- $A$ = Age in years

---

## 2. Non-Training Physical Activity Level (PAL)

Athletes maintain ambulation and activities of daily living outside structured training sessions:

$$\text{Energy}_{\text{non-training}} = \text{BMR} \times \text{PAL}_{\text{baseline}}$$

NutriPlay sets $\text{PAL}_{\text{baseline}} = 1.35$ (Light non-training ambulation baseline for student-athletes).

---

## 3. Exercise Energy Expenditure (EEE)

Computed using the Metabolic Equivalent of Task (MET) standardized from the Compendium of Physical Activities and Indian sports registry:

$$\text{Effective MET} = \text{MET}_{\text{sport}} \times \text{Modifier}_{\text{intensity}}$$

Intensity modifiers:
- `rest`: $0.00$
- `light`: $0.85$
- `moderate`: $1.00$
- `high`: $1.15$
- `very_high`: $1.30$

$$\text{EEE (kcal)} = \text{Effective MET} \times W \times \left(\frac{D}{60}\right)$$

Where:
- $W$ = Weight in kg
- $D$ = Training duration in minutes

---

## 4. Total Daily Energy Expenditure (TDEE)

$$\text{TDEE} = \text{Energy}_{\text{non-training}} + \text{EEE}$$

Target caloric range:
- Recommended Target: $\text{TDEE}$
- Lower Boundary (95%): $\text{TDEE} \times 0.95$
- Upper Boundary (105%): $\text{TDEE} \times 1.05$

---

## 5. Macronutrient Distribution

1. **Protein Target**:
   $$\text{Protein (g)} = W \times \text{ProteinFactor}_{\text{sport, intensity}}$$
   Range: $1.2\text{ to }2.4\text{ g/kg body weight}$.
   $\text{Protein (kcal)} = \text{Protein (g)} \times 4.0\text{ kcal/g}$.

2. **Carbohydrate Target**:
   $$\text{Carbohydrate (g)} = W \times \text{CarbFactor}_{\text{sport, intensity}}$$
   Periodized by session workload ($3.5\text{ to }10.0\text{ g/kg}$).
   $\text{Carbohydrate (kcal)} = \text{Carbohydrate (g)} \times 4.0\text{ kcal/g}$.

3. **Dietary Fat Target**:
   $$\text{Fat (kcal)} = \text{Target Calories} - (\text{Protein kcal} + \text{Carbohydrate kcal})$$
   $$\text{Fat (g)} = \frac{\text{Fat (kcal)}}{9.0\text{ kcal/g}}$$
   *Safety Constraint*: Dietary fat is bounded between $20\%\text{ and }35\%$ of total daily energy to protect steroidogenesis, hormone production, and lipid-soluble vitamin absorption.

---

## 6. Biometeorological Heat Index (NOAA Rothfusz Regression)

Calculated in Fahrenheit and converted to Celsius:

For $T < 80^\circ\text{F}$ ($26.7^\circ\text{C}$):
$$\text{HI}_{\text{simple}} = 0.5 \times \left(T + 61.0 + (T - 68.0) \times 1.2 + \text{RH} \times 0.094\right)$$

For $T \ge 80^\circ\text{F}$:
$$\begin{aligned}
\text{HI} = &-42.379 + 2.04901523 \cdot T + 10.14333127 \cdot \text{RH} - 0.22475541 \cdot T \cdot \text{RH} \\
&- 0.00683783 \cdot T^2 - 0.05481717 \cdot \text{RH}^2 + 0.00122874 \cdot T^2 \cdot \text{RH} \\
&+ 0.00085282 \cdot T \cdot \text{RH}^2 - 0.00000199 \cdot T^2 \cdot \text{RH}^2
\end{aligned}$$

With low-humidity and high-humidity adjustments according to National Weather Service standards.

---

## 7. Sweat Rate & Fluid Turnover

### Measured Field Protocol
$$\text{Sweat Loss (L)} = (W_{\text{pre}} - W_{\text{post}}) + V_{\text{fluid}} - V_{\text{urine}}$$
$$\text{Sweat Rate (L/hr)} = \frac{\text{Sweat Loss (L)}}{D / 60}$$

### Empirical Fallback Model
$$\text{Sweat Rate}_{\text{est}} = \text{BaseRate}_{\text{intensity}} \times \left(\frac{W}{70}\right) \times \text{Multiplier}_{\text{HeatIndex}}$$

### Rehydration Target
$$\text{Training Rehydration (L)} = \text{Sweat Loss (L)} \times 1.25$$
$$\text{Total Daily Fluid (L)} = (W \times 0.035) + \text{Training Rehydration} + \text{Heat Stress Adjustment}$$

---

## 8. Relative Energy Deficiency in Sport (RED-S)

Energy Availability ($\text{EA}$) according to International Olympic Committee (IOC) consensus:

$$\text{Fat-Free Mass (kg)} = W \times \left(1 - \frac{\text{BodyFat}\%}{100}\right)$$

$$\text{EA} = \frac{\text{Energy Intake (kcal)} - \text{EEE (kcal)}}{\text{Fat-Free Mass (kg FFM)}}$$

### Risk Thresholds:
- $\text{EA} \ge 45\text{ kcal/kg FFM/day}$: **Optimal**
- $30 \le \text{EA} < 45\text{ kcal/kg FFM/day}$: **Sub-Optimal**
- $\text{EA} < 30\text{ kcal/kg FFM/day}$: **High Risk of Low Energy Availability (LEA) / RED-S**

