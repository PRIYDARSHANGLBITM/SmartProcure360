# SmartProcure360 – SAP Reports Documentation

This folder contains the executable ABAP reports used to load demonstration data, validate the vendor risk engine, and execute vendor risk calculations in the SmartProcure360 SAP backend.

## Reports Overview

| Report | Purpose | Main Usage |
|---|---|---|
| `ZSP360_LOAD_TEST_DATA` | Loads controlled demo/test data into SmartProcure360 custom tables | Initial setup and repeatable testing |
| `ZSP360_TEST_RISK_ENGINE` | Validates the static risk-engine calculation logic | Functional/unit-style verification |
| `ZSP360_RUN_RISK` | Calculates vendor risk using live database data | Operational risk calculation |

These reports support the development and testing lifecycle of the SmartProcure360 solution.

---

# 1. ZSP360_LOAD_TEST_DATA

## Purpose

`ZSP360_LOAD_TEST_DATA` is the demo-data loader for SmartProcure360.

It populates the custom procurement, vendor, delivery, quality, risk, approval, audit, and alert tables with a controlled dataset so that the complete application can be tested without manually entering records in SAP.

## Report Description

**Technical Name:** `ZSP360_LOAD_TEST_DATA`

**Description:** `SmartProcure360 - Load Demo Data`

**Package:** `ZSP360`

## Main Responsibilities

The report creates representative records for:

- Vendors
- Purchase Requisitions
- Purchase Requisition Items
- Purchase Orders
- Purchase Order Items
- Deliveries
- Quality inspections
- Vendor risk results
- Approval workflow records
- Audit records
- Smart alerts

## Demo Vendor Dataset

The standard demo dataset contains five vendors:

| Vendor ID | Vendor Name | Risk Level |
|---|---|---|
| `V100000001` | Alpha Components | LOW |
| `V100000002` | Beta Manufacturing | MEDIUM |
| `V100000003` | CycleTech Supplies | HIGH |
| `V100000004` | Global Parts Ltd | LOW |
| `V100000005` | RapidGear Industries | CRITICAL |

This distribution intentionally provides examples across all four SmartProcure360 risk levels.

## Related Tables

The loader works with the SmartProcure360 custom tables:

- `ZSP360_VENDOR`
- `ZSP360_PR`
- `ZSP360_PR_ITEM`
- `ZSP360_PO`
- `ZSP360_PO_ITEM`
- `ZSP360_DELIVERY`
- `ZSP360_QUALITY`
- `ZSP360_RISK`
- `ZSP360_APPROVAL`
- `ZSP360_AUDIT`
- `ZSP360_ALERT`

## Why This Report Exists

A controlled data-loader report provides a repeatable development environment.

It allows the project to:

1. Populate a fresh development/client environment quickly.
2. Reproduce UI and OData test scenarios.
3. Validate risk analytics with known records.
4. Demonstrate the application during interviews.
5. Reset/reload representative data when required.

## Execution

Run from SAP GUI using:

```text
SE38
```

Enter:

```text
ZSP360_LOAD_TEST_DATA
```

Execute the report.

After successful execution, verify records using:

```text
SE16H
```

for the relevant `ZSP360_*` tables.

---

# 2. ZSP360_TEST_RISK_ENGINE

## Purpose

`ZSP360_TEST_RISK_ENGINE` validates the core mathematical logic of the SmartProcure360 vendor risk engine independently from the database-driven vendor calculation.

It is useful for confirming that the weighting, risk-score conversion, risk-level classification, and recommendation logic behave as designed.

## Report Description

**Technical Name:** `ZSP360_TEST_RISK_ENGINE`

**Purpose:** Risk-engine functional validation

**Package:** `ZSP360`

## Test Inputs

The validated test scenario uses:

| Component | Score |
|---|---:|
| Delivery Score | 55 |
| Quality Score | 70 |
| Price Score | 65 |
| History Score | 72 |

## Risk Calculation

The performance score is calculated using the SmartProcure360 weighting model:

```text
Performance Score =
    Delivery × 40%
  + Quality  × 30%
  + Price    × 20%
  + History  × 10%
```

For the test values:

```text
= (55 × 0.40)
+ (70 × 0.30)
+ (65 × 0.20)
+ (72 × 0.10)

= 22.00
+ 21.00
+ 13.00
+ 7.20

= 63.20
```

The final risk score is:

```text
Risk Score = 100 - Performance Score

Risk Score = 100 - 63.20

Risk Score = 36.80
```

## Expected Result

| Result | Expected Value |
|---|---|
| Performance Score | `63.20` |
| Final Risk Score | `36.80` |
| Risk Level | `MEDIUM` |
| Recommendation | `MONITOR_PERFORMANCE` |

## Risk-Level Validation

The report validates the configured thresholds:

| Risk Score | Risk Level |
|---:|---|
| `0–30` | `LOW` |
| `31–60` | `MEDIUM` |
| `61–80` | `HIGH` |
| `81–100` | `CRITICAL` |

## Recommendation Validation

| Risk Score | Recommendation |
|---:|---|
| `0–30` | `NORMAL_MONITORING` |
| `31–60` | `MONITOR_PERFORMANCE` |
| `61–80` | `MANAGER_REVIEW` |
| `81–100` | `URGENT_REVIEW` |

## Related Class

The report validates:

```text
ZCL_SP360_RISK_ENGINE
```

Important methods include:

```text
CALCULATE_FINAL_SCORE
GET_RISK_LEVEL
GET_RECOMMENDATION
```

The report therefore provides a simple verification layer before the same business logic is used by database-driven vendor risk calculations.

## Execution

Run from:

```text
SE38
```

with:

```text
ZSP360_TEST_RISK_ENGINE
```

The report should produce the expected calculation result described above.

---

# 3. ZSP360_RUN_RISK

## Purpose

`ZSP360_RUN_RISK` executes the complete SmartProcure360 vendor-risk calculation using actual records stored in the custom SAP tables.

Unlike `ZSP360_TEST_RISK_ENGINE`, which validates supplied component scores, this report obtains the component scores from the database-driven risk engine.

## Report Description

**Technical Name:** `ZSP360_RUN_RISK`

**Purpose:** Execute vendor risk calculation

**Package:** `ZSP360`

## Input

The report uses a vendor parameter:

```text
P_VENDOR
```

Example default/test vendor:

```text
V100000003
```

## Processing Flow

The report follows this logical sequence:

```text
Vendor ID
   ↓
GET_DELIVERY_SCORE
   ↓
GET_QUALITY_SCORE
   ↓
GET_PRICE_SCORE
   ↓
GET_HISTORY_SCORE
   ↓
CALCULATE_FINAL_SCORE
   ↓
GET_RISK_LEVEL
   ↓
GET_RECOMMENDATION
   ↓
Display Result
```

## Database-Driven Components

### Delivery Score

The risk engine evaluates delivery records by comparing delayed deliveries with the total relevant deliveries.

Conceptually:

```text
Delivery Score =
100 - (Delayed Deliveries / Total Deliveries × 100)
```

A default score is used when no relevant delivery history is available.

### Quality Score

The engine calculates the vendor's average quality score from:

```text
ZSP360_QUALITY
```

A default score is used when no quality history is available.

### Price Score

The engine compares the vendor's average purchase-item price against the overall average purchase-item price.

This provides a relative price-performance indicator.

### History Score

Historical performance combines:

- Delivery-delay history
- Quality-rejection history

The configured weighting is:

```text
History Score =
    Delivery History × 60%
  + Quality History  × 40%
```

### Final Risk Score

The component scores are passed to:

```text
ZCL_SP360_RISK_ENGINE=>CALCULATE_FINAL_SCORE
```

The result is converted into a risk level and management recommendation.

---

# 4. Example Execution

Example:

```text
P_VENDOR = V100000003
```

The report calculates the vendor's current component scores from SAP data and displays:

```text
Vendor ID
Delivery Score
Quality Score
Price Score
History Score
Final Risk Score
Risk Level
Recommendation
```

For the current demo dataset, `V100000003` is the CycleTech Supplies vendor and is represented as a `HIGH`-risk vendor in the project test data.

The exact component scores may change if the underlying delivery, quality, purchase-order, or other transactional data is changed.

---

# 5. Relationship Between the Reports

The three reports have different responsibilities.

```text
ZSP360_LOAD_TEST_DATA
        │
        │ populates
        ▼
ZSP360_* custom tables
        │
        │ database-driven calculations
        ▼
ZSP360_RUN_RISK
        │
        ▼
ZCL_SP360_RISK_ENGINE
```

Separately:

```text
ZSP360_TEST_RISK_ENGINE
        │
        ▼
ZCL_SP360_RISK_ENGINE
```

This separation makes the project easier to test:

- The loader establishes predictable test data.
- The risk-engine test validates mathematical/business rules.
- The runtime report validates the same rules against actual SAP database data.

---

# 6. Reporting and Application Integration

The reports are not isolated utilities. Their results support the wider SmartProcure360 architecture.

## SAP Backend

```text
ABAP Reports
    ↓
ABAP Risk Engine
    ↓
Custom SAP Tables
    ↓
CDS Views
    ↓
OData Service
```

## Frontend

The resulting data is consumed by the SAPUI5 application through:

```text
ZSP360_ODATA_SRV
```

Relevant entity sets include:

```text
VendorRiskSet
POAnalyticsSet
DeliveryAnlySet
ProcOverviewSet
PRSet
ApprovalSet
AlertSet
AuditSet
```

This allows the same backend data and business rules to be represented in the SmartProcure360 dashboard.

---

# 7. Testing Strategy

The reports support multiple levels of testing.

## Level 1 – Data Setup

Run:

```text
ZSP360_LOAD_TEST_DATA
```

Purpose:

- Create known demo records.
- Establish repeatable test scenarios.

## Level 2 – Business Logic Test

Run:

```text
ZSP360_TEST_RISK_ENGINE
```

Purpose:

- Validate weighting calculations.
- Validate risk thresholds.
- Validate recommendations.

## Level 3 – Database Integration Test

Run:

```text
ZSP360_RUN_RISK
```

Purpose:

- Read actual SAP table data.
- Calculate component scores.
- Produce a complete vendor risk result.

## Level 4 – OData/UI Integration Test

Verify the calculated backend information through:

```text
ZSP360_ODATA_SRV
```

and the SmartProcure360 SAPUI5 application.

---

# 8. Related Development Objects

## Classes

```text
ZCL_SP360_RISK_ENGINE
ZCL_ZSP360_ODATA_DPC_EXT
```

## Tables

```text
ZSP360_VENDOR
ZSP360_PR
ZSP360_PR_ITEM
ZSP360_PO
ZSP360_PO_ITEM
ZSP360_DELIVERY
ZSP360_QUALITY
ZSP360_RISK
ZSP360_APPROVAL
ZSP360_AUDIT
ZSP360_ALERT
```

## CDS Views

```text
ZC_SP360_VENDOR_RISK
ZC_SP360_PO_ANALYTICS
ZC_SP360_DELIVERY_ANALYTICS
ZC_SP360_PROCUREMENT_OVERVIEW
```

## OData Service

```text
ZSP360_ODATA_SRV
```

---

# 9. Interview-Relevant Technical Points

These reports demonstrate several SAP ABAP development concepts:

- Executable ABAP reports
- Selection-screen parameters
- ABAP Objects method calls
- Database access using Open SQL
- Business-rule validation
- Reusable class-based calculations
- Integration between reports and custom tables
- Test-data generation
- Functional testing of business logic
- Database-driven calculation
- Integration testing before OData/UI consumption

A concise interview explanation is:

> "I created separate ABAP reports for SmartProcure360 data setup, risk-engine validation, and live vendor-risk execution. This separates test-data preparation, business-rule verification, and database-driven execution, making the application easier to test and demonstrate."

---

# 10. Maintenance Notes

When changing the SmartProcure360 risk model:

1. Update the central logic in `ZCL_SP360_RISK_ENGINE`.
2. Update `ZSP360_TEST_RISK_ENGINE` test expectations if required.
3. Run the risk-engine test.
4. Run `ZSP360_RUN_RISK` for representative vendors.
5. Verify `ZSP360_RISK`.
6. Verify the CDS/OData output.
7. Regression-test the SAPUI5 dashboard.

The reports should remain focused on execution and testing; business logic should remain centralized in the risk-engine class.

---

# 11. Phase 12.1E Status

The report documentation covers:

- `ZSP360_LOAD_TEST_DATA`
- `ZSP360_TEST_RISK_ENGINE`
- `ZSP360_RUN_RISK`
- Test scenarios
- Risk formulas
- Database integration
- OData/UI integration
- Related SAP objects
- Interview relevance
- Maintenance guidance

This documentation is part of the **Phase 12 – Final Professionalization** repository cleanup.
