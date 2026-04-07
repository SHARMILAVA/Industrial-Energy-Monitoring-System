# IoT Dashboard - Formulas and Calculations Documentation

This document explains all the advanced calculations and formulas used in the IoT Dashboard analytics system.

## 1. Electrical Power Metrics

### 1.1 Real Power (W)
**Definition:** The actual power consumed by a device
**Formula:** P = V × I × PF
Where:
- V = Voltage (volts)
- I = Current (amperes)
- PF = Power Factor

**Unit:** Watts (W)
**Example:** A device with 220V, 5A, and 0.95 PF consumes 1045W

---

### 1.2 Apparent Power (VA)
**Definition:** The total power supplied to the device (real + reactive)
**Formula:** S = V × I
Where:
- V = Voltage (volts)
- I = Current (amperes)

**Unit:** Volt-Amperes (VA)
**Example:** 220V × 5A = 1100 VA
**Why it matters:** Higher than real power indicates poor power factor and inefficiency

---

### 1.3 Reactive Power (VAR)
**Definition:** Non-productive power that doesn't perform useful work (caused by inductance/capacitance)
**Formula:** Q = √(S² - P²)
Where:
- S = Apparent Power (VA)
- P = Real Power (W)

**Unit:** Volt-Amperes Reactive (VAR)
**Example:** S=1100VA, P=1045W → Q = √(1100² - 1045²) ≈ 327 VAR
**Why it matters:** High reactive power increases energy losses and utility costs

---

### 1.4 Power Factor
**Definition:** The ratio of real power to apparent power; indicates efficiency
**Formula:** PF = P / S = cos(θ)
Where:
- P = Real Power (W)
- S = Apparent Power (VA)
- θ = Phase angle between voltage and current

**Range:** 0 to 1 (1 is ideal)
**Example:** PF = 1045W / 1100VA = 0.95 (95% efficient)
**Interpretation:**
- 0.95-1.0: Excellent (industrial standard is 0.85+)
- 0.85-0.95: Good
- <0.85: Poor (adds extra costs)

---

## 2. Energy Consumption Metrics

### 2.1 Energy Consumption (kWh)
**Definition:** Total electrical energy consumed over a period
**Formula:** E = P × t / 1000
Where:
- P = Power (watts)
- t = Time (hours)

**Unit:** Kilowatt-hours (kWh)
**Example:** 2500W device running for 8 hours = 2500 × 8 / 1000 = 20 kWh
**Real-world relevance:** Used for billing and energy analysis

---

### 2.2 Load Factor
**Definition:** Ratio of average power to peak power; indicates consistency of usage
**Formula:** LF = (Average Power / Peak Power) × 100%
**Range:** 0 to 100%
**Example:** Avg=2400W, Peak=3200W → LF = (2400/3200) × 100 = 75%

**Interpretation:**
- 90-100%: Consistent load (steady operation)
- 70-90%: Variable load (fluctuating usage)
- <70%: Highly variable load (many on/off cycles)

**Why it matters:** Higher load factors indicate more predictable energy consumption

---

### 2.3 Efficiency
**Definition:** How well a device utilizes peak capacity
**Formula:** Efficiency = (Average Power / Peak Power) × 100%
**Range:** 0 to 100%
**Same as Load Factor** - measures operational efficiency

---

## 3. Power Quality Metrics

### 3.1 Power Quality Index (PQI)
**Definition:** Composite score combining power factor, load factor, and efficiency
**Formula:** PQI = PF × (LF/100) × (Efficiency/100)
**Range:** 0 to 1 (1 is perfect)
**Example:** PF=0.95, LF=75%, Efficiency=75% → PQI = 0.95 × 0.75 × 0.75 = 0.534

**Interpretation:**
- >0.8: Excellent power quality
- 0.6-0.8: Good power quality
- <0.6: Poor power quality

**Applications:** Overall health indicator for electrical installation

---

### 3.2 Total Harmonic Distortion Index (HDI)
**Definition:** Measures voltage/current waveform distortion caused by non-linear devices
**Formula:** HDI = (Reactive Power / Apparent Power) × 100
**Range:** 0 to 100% (Theoretical limit is often <5% for residential)
**Example:** If Q/S × 100 = 12%, the signal has 12% distortion

**Interpretation:**
- <3%: Excellent
- 3-5%: Good
- 5-10%: Acceptable
- >10%: Poor (causes heating and equipment damage)

**Why it matters:** High distortion reduces equipment life and increases losses

---

## 4. Demand and Load Analysis

### 4.1 Peak Load Analysis
**Definition:** Identifies the maximum power consumption and when it occurs
**Formula:** Peak Load = Max(P over time period)
**Demand Charge Calculation:** Demand Cost = (Peak Load in kW) × Rate ($/kW)
**Example:** Peak Load = 4.2kW, Rate = $15/kW → Cost = $63/month

**Why it matters:** 
- Utilities often charge based on peak demand
- Reducing peak demand can significantly lower energy costs
- Helps identify equipment issues

---

### 4.2 Peak Time
**Definition:** The time when maximum power consumption occurred
**Format:** ISO 8601 timestamp
**Example:** "2026-02-18T15:45:00Z"

**Usage:** Helps identify usage patterns and peak period behavior

---

## 5. Energy Cost Analysis

### 5.1 Time-of-Use (TOU) Tariff Analysis
**Definition:** Analysis of energy cost based on when electricity is consumed
**Rate Structure:**
- Peak Hours (9am-5pm): $0.20/kWh
- Shoulder Hours (5pm-9pm): $0.15/kWh
- Off-Peak Hours (9pm-9am): $0.10/kWh

**Formula:** Total Cost = ∑(Energy in period × Rate for period)

**Example:**
- Peak energy: 45.2 kWh × $0.20 = $9.04
- Shoulder: 21.5 kWh × $0.15 = $3.23
- Off-peak: 78.5 kWh × $0.10 = $7.85
- **Total: $20.12**

**Why it matters:** Shifting usage to off-peak hours can reduce bills by 50%

---

## 6. Environmental Impact

### 6.1 Carbon Footprint (CO₂ Equivalent)
**Definition:** Total greenhouse gas emissions associated with energy consumption
**Formula:** CO₂ = Energy (kWh) × Emission Factor (kg CO₂/kWh)
**Default Emission Factor:** 0.82 kg CO₂/kWh (varies by region/power source)

**Example:** 145.2 kWh × 0.82 = 119.1 kg CO₂ equivalent

**Emission Factors by Region (Approximate):**
- Coal-heavy grid: 1.0+ kg CO₂/kWh
- Mixed grid (US average): 0.41 kg CO₂/kWh
- Natural gas: 0.5 kg CO₂/kWh
- Renewable-heavy: 0.05-0.1 kg CO₂/kWh

**Interpretation:**
- Represents equivalent CO₂ for 1 car driven 0.3 km per kWh
- Use to track sustainability goals

---

## 7. Predictive Analytics

### 7.1 Consumption Trend (Linear Regression)
**Definition:** Predicts future power consumption using linear regression
**Formula:** P(t) = m × t + b
Where:
- P(t) = Power at time t
- m = Slope (rate of change)
- b = Intercept (baseline power)

**Slope Interpretation:**
- Positive slope: Increasing consumption trend
- Negative slope: Decreasing consumption trend
- ~Zero slope: Stable consumption

**Example:**
- Slope = +35.2 W per interval
- Intercept = 2100 W
- Predicted power = 2100 + 35.2 × 5 = 2276 W for 5 intervals ahead

**Accuracy:** Best with consistent historical data; 60+ data points recommended

---

### 7.2 Next Hour Forecast
**Definition:** Predicts power consumption for the next hour
**Method:** Extrapolates from last 60 data points using linear regression
**Formula:** Forecast = yMean + (slope × 1 period)

**Example:** If averaging 2500W with +50W/period trend → Forecast ≈ 2550W

---

## 8. Demand Response Analysis

### 8.1 Demand Response Potential
**Definition:** Identifies potential energy savings through load reduction
**Formula:** Savings = (Peak Load - Target Load) × Operating Hours / 1000
**Target:** Usually 10% reduction of peak load
**Cost Savings:** Savings (kWh) × Electricity Rate ($/kWh)

**Example:**
- Peak Load: 4200W
- Target Reduction: 10% (420W)
- Target Load: 3780W
- Daily potential: (4200 - 3780) × 24 / 1000 = 10.08 kWh/day
- At $0.18/kWh: $1.81 savings/day × 365 = ~$660/year

**Usage:** Helps justify investment in efficiency measures

---

## 9. Temperature Impact Analysis

### 9.1 Thermal Efficiency Loss
**Definition:** How temperature changes affect device efficiency
**Formula:** Efficiency Loss (%) = (T current - T optimal) / 10 × 2.5%
**Optimal Temperature:** 25°C (typical for electronics)

**Example:**
- Current Temp: 45°C
- Loss = (45 - 25) / 10 × 2.5% = 5%
- Reduced efficiency by 5%

**Thermal Status Categories:**
- Optimal: <30°C (very good)
- Moderate: 30-40°C (acceptable)
- High: >40°C (concerning, cooling needed)

**Why it matters:**
- Every 10°C increase reduces device lifespan by ~50%
- Increases energy consumption
- Indicates cooling system issues

---

## 10. Comparative Analysis

### 10.1 Device Comparison Metrics
**Definition:** Compares performance between multiple devices
**Metrics Calculated:**
1. Power Difference: P₁ - P₂
2. Efficiency Difference: Eff₁ - Eff₂
3. Cost Difference: Cost₁ - Cost₂
4. Energy Difference: E₁ - E₂

**Example Interpretation:**
- Device 1 uses 150W more than Device 2
- But is 5% more efficient overall

**Usage:** Helps identify which devices are energy hogs

---

## Summary Table

| Metric | Formula | Unit | Range | Importance |
|--------|---------|------|-------|------------|
| Power Factor | P/S | - | 0-1 | High |
| Load Factor | Avg/Peak | % | 0-100 | Medium |
| Efficiency | Avg/Peak | % | 0-100 | Medium |
| PQI | PF×LF×Eff | - | 0-1 | High |
| Carbon | Energy×Factor | kg CO₂ | - | Medium |
| Peak Load | Max(P) | W | - | High |
| HDI | Q/S | % | 0-100 | Medium |
| Cost | ∑(E×Rate) | $ | - | High |

---

## Data Collection Assumptions

1. **Measurement Intervals:** Data typically collected every 5 minutes
2. **Accuracy:** ±2-5% for modern smart meters
3. **Historical Period:** Analysis uses 60-8000 data points
4. **Time Zone:** All timestamps in UTC (ISO 8601 format)
5. **Firmware Updates:** May cause gaps in data collection

---

## Advanced Formula Examples

### Complete Power Analysis for a Single Reading
Given:
- Voltage: 220V
- Current: 12A
- Peak capacity: 5000W

Calculations:
1. **Apparent Power:** S = 220 × 12 = 2640 VA
2. **Assuming PF=0.92:** Real Power = 2640 × 0.92 = 2428.8W
3. **Reactive Power:** Q = √(2640² - 2428.8²) ≈ 1038 VAR
4. **Power Quality:** HDI = (1038/2640) × 100 ≈ 39.3% (needs improvement!)

---

## Troubleshooting Unusual Readings

| Issue | Possible Cause | Solution |
|-------|---|---|
| PF < 0.8 | High inductive load (motors, transformers) | Add capacitor bank |
| Oscillating power | Loose connection or arcing | Check wiring |
| Very high temperatures | Poor ventilation or overload | Clean/upgrade cooling |
| High peak but low average | Intermittent high-load use | Spread usage over time |

---

**Last Updated:** February 18, 2026
**Document Version:** 1.0
**Author:** IoT Dashboard Team

