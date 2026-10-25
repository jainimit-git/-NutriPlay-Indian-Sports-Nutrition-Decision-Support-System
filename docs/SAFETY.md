# NutriPlay Safety & RED-S Clinical Boundaries

## 1. Ethical & Legal Boundaries

> **MANDATORY LEGAL DISCLAIMER**
> NutriPlay is an engineering research and decision-support prototype. It does NOT provide medical diagnosis, clinical treatment, or replace individualized consultation with a qualified sports dietitian or licensed sports medicine physician.

The system enforces deterministic non-diagnostic alert phrasing:
`"Potential low-energy-availability risk — consider professional assessment"`

Under no circumstances does NutriPlay diagnose anorexia athletica, bulimia, or clinical endocrine failure.

## 2. Energy Availability (EA) Mathematical Screening

Energy Availability is calculated following the **International Olympic Committee (IOC) Consensus on RED-S** (Mountjoy et al., 2018; 2023):

$$\text{EA} = \frac{\text{Energy Intake (kcal)} - \text{Exercise Energy Expenditure (kcal)}}{\text{Fat-Free Mass (kg FFM)}}$$

Where Fat-Free Mass is estimated via validated gender-specific body fat baselines (14% for male athletes, 22% for female athletes) when dual-energy X-ray absorptiometry (DEXA) data is unavailable.

### IOC Risk Categorizations:
- **Optimal ($\text{EA} \ge 45\text{ kcal/kg FFM/day}$)**: Healthy physiological equilibrium; normal menstrual and testosterone function.
- **Sub-Optimal ($30 \le \text{EA} < 45\text{ kcal/kg FFM/day}$)**: Energy restriction zone; permissible only for short-term periodized weight classes with active recovery monitoring.
- **High Risk of Low Energy Availability ($\text{EA} < 30\text{ kcal/kg FFM/day}$)**: Associated with bone demineralization, hormonal suppression, recurrent stress fractures, and impaired immunity.

## 3. Multi-Risk Screening Matrix

1. **RED-S / LEA Screen**: Flags when net energy after workout falls below 30 kcal/kg FFM.
2. **Overtraining & Recovery Screen**: Flags athletes training 7 days per week with $\ge 90$ minutes daily duration without restorative rest intervals.
3. **Environmental Heat Illness Screen**: Flags sessions conducted under Heat Index Danger ($\ge 41^\circ\text{C}$) or Extreme Danger ($\ge 54^\circ\text{C}$), mandating scheduled cooling breaks and isotonic hydration.

