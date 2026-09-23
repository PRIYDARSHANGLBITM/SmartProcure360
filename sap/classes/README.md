# SmartProcure360 - ABAP Classes

This folder documents the custom ABAP classes used by the SmartProcure360 procurement and vendor risk management system.

## Package

```text
ZSP360
SmartProcure360 - Procurement & Vendor Risk
```

## Class Overview

| Class | Purpose |
|---|---|
| `ZCL_SP360_RISK_ENGINE` | Calculates vendor performance and risk |
| `ZCL_ZSP360_ODATA_DPC_EXT` | Implements custom OData business logic |

---

# 1. ZCL_SP360_RISK_ENGINE

## Purpose

`ZCL_SP360_RISK_ENGINE` is the core ABAP Object-Oriented business logic class responsible for calculating vendor risk.

It combines procurement performance indicators and converts them into:

- Final Risk Score
- Risk Level
- Management Recommendation

The class uses database-driven delivery, quality, price and historical performance information.

---

## Main Methods

```text
CALCULATE_FINAL_SCORE
GET_RISK_LEVEL
GET_RECOMMENDATION
GET_DELIVERY_SCORE
GET_QUALITY_SCORE
GET_PRICE_SCORE
GET_HISTORY_SCORE
CALCULATE_VENDOR_RISK
```

---

## CALCULATE_FINAL_SCORE

Calculates the final vendor risk score from four performance components.

### Inputs

```text
IV_DELIVERY_SCORE
IV_QUALITY_SCORE
IV_PRICE_SCORE
IV_HISTORY_SCORE
```

### Output

```text
RV_RISK_SCORE
```

### Formula

```text
Performance Score =
    Delivery Score × 40%
  + Quality Score  × 30%
  + Price Score    × 20%
  + History Score  × 10%

Risk Score = 100 - Performance Score
```

The result is restricted to the valid range:

```text
0 - 100
```

### ABAP Logic

```abap
DATA lv_performance_score TYPE zsp360_e_risk_score.

lv_performance_score =
    ( iv_delivery_score * '0.40' ) +
    ( iv_quality_score  * '0.30' ) +
    ( iv_price_score    * '0.20' ) +
    ( iv_history_score  * '0.10' ).

rv_risk_score = 100 - lv_performance_score.

IF rv_risk_score < 0.
  rv_risk_score = 0.
ELSEIF rv_risk_score > 100.
  rv_risk_score = 100.
ENDIF.
```

---

# GET_RISK_LEVEL

Converts the final risk score into a business risk category.

### Rules

| Risk Score | Risk Level |
|---:|---|
| `0 - 30` | LOW |
| `31 - 60` | MEDIUM |
| `61 - 80` | HIGH |
| `81 - 100` | CRITICAL |

### ABAP Logic

```abap
IF iv_risk_score <= 30.
  rv_risk_level = 'LOW'.
ELSEIF iv_risk_score <= 60.
  rv_risk_level = 'MEDIUM'.
ELSEIF iv_risk_score <= 80.
  rv_risk_level = 'HIGH'.
ELSE.
  rv_risk_level = 'CRITICAL'.
ENDIF.
```

---

# GET_RECOMMENDATION

Converts the risk score into a recommended management action.

| Risk Level | Recommendation |
|---|---|
| LOW | `NORMAL_MONITORING` |
| MEDIUM | `MONITOR_PERFORMANCE` |
| HIGH | `MANAGER_REVIEW` |
| CRITICAL | `URGENT_REVIEW` |

### ABAP Logic

```abap
IF iv_risk_score <= 30.
  rv_recommendation = 'NORMAL_MONITORING'.
ELSEIF iv_risk_score <= 60.
  rv_recommendation = 'MONITOR_PERFORMANCE'.
ELSEIF iv_risk_score <= 80.
  rv_recommendation = 'MANAGER_REVIEW'.
ELSE.
  rv_recommendation = 'URGENT_REVIEW'.
ENDIF.
```

---

# GET_DELIVERY_SCORE

Calculates vendor delivery performance from delivery records.

## Data Sources

```text
ZSP360_DELIVERY
ZSP360_PO
```

The method links delivery records with purchase orders using the purchase order ID.

## Logic

```text
Total Deliveries
        |
        v
Delayed Deliveries
        |
        v
Delivery Performance
```

The score is calculated as:

```text
Delivery Score =
100 - (Delayed Deliveries / Total Deliveries × 100)
```

If no delivery records are available, the method uses:

```text
Default Delivery Score = 50
```

A delivery with:

```text
DELAY_DAYS > 0
```

is considered delayed.

---

# GET_QUALITY_SCORE

Calculates the vendor quality performance score.

## Data Source

```text
ZSP360_QUALITY
```

The method calculates the average `QUALITY_SCORE` for the selected vendor.

If no quality records are available:

```text
Default Quality Score = 50
```

---

# GET_PRICE_SCORE

Calculates price performance by comparing vendor pricing against the overall average.

## Data Sources

```text
ZSP360_PO
ZSP360_PO_ITEM
```

## Logic

```text
Vendor Average Price
        |
        v
Overall Average Price
        |
        v
Price Comparison
        |
        v
Price Score
```

If the vendor's average price is less than or equal to the overall average:

```text
Price Score = 100
```

If the vendor price is higher, the score is reduced according to the percentage premium.

If sufficient price data is unavailable:

```text
Default Price Score = 50
```

---

# GET_HISTORY_SCORE

Calculates historical vendor performance using delivery and quality history.

The historical score combines:

```text
Delivery History  → 60%
Quality History   → 40%
```

The method uses:

```text
Delivery Delay History
Quality Rejection History
```

If required historical information is unavailable, default component values are used.

---

# CALCULATE_VENDOR_RISK

This is the main database-driven risk calculation method.

## Flow

```text
Vendor ID
   |
   +-----------------------+
   |                       |
   v                       v
Delivery Score        Quality Score
   |                       |
   +-----------+-----------+
               |
       +-------+-------+
       |               |
       v               v
 Price Score      History Score
       |               |
       +-------+-------+
               |
               v
    CALCULATE_FINAL_SCORE
               |
               v
          Risk Score
               |
               v
        GET_RISK_LEVEL
               |
               v
       Risk Classification
```

The method returns the calculated vendor risk information used by the application.

---

# Risk Engine Example

The test report:

```text
ZSP360_TEST_RISK_ENGINE
```

uses the following input values:

```text
Delivery Score : 55
Quality Score  : 70
Price Score    : 65
History Score  : 72
```

### Calculation

```text
Performance Score

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

Therefore:

```text
Risk Score = 100 - 63.20
           = 36.80
```

Result:

```text
Risk Level     : MEDIUM
Recommendation: MONITOR_PERFORMANCE
```

---

# Database-Driven Risk Example

The report:

```text
ZSP360_RUN_RISK
```

can calculate risk using actual database data for a vendor.

Example vendor:

```text
V100000003
CycleTech Supplies
```

The risk engine reads:

```text
ZSP360_DELIVERY
ZSP360_QUALITY
ZSP360_PO
ZSP360_PO_ITEM
```

and calculates the component scores before storing or displaying the resulting risk information.

---

# 2. ZCL_ZSP360_ODATA_DPC_EXT

## Purpose

`ZCL_ZSP360_ODATA_DPC_EXT` is the custom OData Data Provider Extension class.

It contains the custom ABAP implementation behind the SmartProcure360 OData service.

Service:

```text
ZSP360_ODATA_SRV
```

The class inherits from:

```text
ZCL_ZSP360_ODATA_DPC
```

---

# Implemented OData Methods

The current custom implementation includes:

```text
VENDORRISKSET_GET_ENTITY
VENDORRISKSET_GET_ENTITYSET

APPROVALSET_CREATE_ENTITY
APPROVALSET_GET_ENTITY
APPROVALSET_GET_ENTITYSET
APPROVALSET_UPDATE_ENTITY

ALERTSET_GET_ENTITYSET

AUDITSET_GET_ENTITY
AUDITSET_GET_ENTITYSET

POANALYTICSSET_GET_ENTITYSET
```

---

# Vendor Risk OData

## VENDORRISKSET_GET_ENTITYSET

Reads vendor risk analytics from:

```text
ZC_SP360_VENDOR_RISK
```

The CDS result is mapped to the OData entity set:

```text
VendorRiskSet
```

Used by the SAPUI5 Vendor Risk Overview and dashboard.

---

## VENDORRISKSET_GET_ENTITY

Reads a specific vendor risk record based on:

```text
VendorId
```

The method reads from:

```text
ZSP360_RISK
```

and returns the matching entity.

---

# Approval Workflow OData

## APPROVALSET_CREATE_ENTITY

Creates an approval request in:

```text
ZSP360_APPROVAL
```

The method:

1. Reads incoming OData data.
2. Assigns SAP client.
3. Generates an approval ID if required.
4. Sets default document type.
5. Sets approver if missing.
6. Sets approval level.
7. Sets decision to `PENDING`.
8. Sets decision date.
9. Sets default comments.
10. Inserts the record into the database.
11. Returns the created entity.

### Workflow

```text
UI
 |
 | POST
 v
ApprovalSet
 |
 v
APPROVALSET_CREATE_ENTITY
 |
 v
ZSP360_APPROVAL
```

---

## APPROVALSET_GET_ENTITYSET

Reads all approval records from:

```text
ZSP360_APPROVAL
```

and exposes them through:

```text
ApprovalSet
```

---

## APPROVALSET_GET_ENTITY

Reads a single approval record using:

```text
ApprovalId
```

---

## APPROVALSET_UPDATE_ENTITY

Updates an existing approval decision.

Typical business flow:

```text
PENDING
   |
   +--------+
   |        |
   v        v
APPROVED  REJECTED
```

The method updates:

```text
DECISION
DECISION_DATE
COMMENTS
APPROVER
```

---

# Smart Alerts OData

## ALERTSET_GET_ENTITYSET

Reads alert records from:

```text
ZSP360_ALERT
```

and exposes them through:

```text
AlertSet
```

The frontend uses this data to display:

- Total Alerts
- Open Alerts
- High Severity Alerts
- Critical Alerts
- Alert Messages

---

# Audit OData

## AUDITSET_GET_ENTITYSET

Reads audit records from:

```text
ZSP360_AUDIT
```

and exposes them through:

```text
AuditSet
```

---

## AUDITSET_GET_ENTITY

Reads one audit record using:

```text
AuditId
```

The method validates that an audit ID was supplied and raises an OData business exception when the requested record does not exist.

---

# Purchase Order Analytics OData

## POANALYTICSSET_GET_ENTITYSET

Reads purchase order analytics from:

```text
ZC_SP360_PO_ANALYTICS
```

and exposes the result through:

```text
POAnalyticsSet
```

The SAPUI5 application uses this entity set for:

- Total PO count
- Total PO amount
- Delivered PO count
- Delayed PO count
- Vendor-level PO analytics

---

# OData Backend Architecture

```text
                    SAPUI5
                       |
                       v
               ZSP360_ODATA_SRV
                       |
                       v
              DPC Extension Class
                       |
        +--------------+--------------+
        |              |              |
        v              v              v
     Database        CDS Views     Business Logic
        |              |              |
        +--------------+--------------+
                       |
                       v
              SmartProcure360
```

---

# Exception Handling

The OData implementation uses SAP Gateway business exceptions where required.

Examples:

```abap
RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
```

This allows backend validation errors to be returned through the OData layer rather than causing uncontrolled application failures.

---

# ABAP OO Design

The SmartProcure360 backend separates responsibilities:

```text
ZCL_SP360_RISK_ENGINE
        |
        +--> Risk Calculation
        +--> Risk Classification
        +--> Recommendation
        +--> Performance Scoring


ZCL_ZSP360_ODATA_DPC_EXT
        |
        +--> OData Read Operations
        +--> OData Create Operations
        +--> OData Update Operations
        +--> Gateway Error Handling
```

This separation keeps business calculation logic independent from OData transport logic.

---

# Related Reports

The classes are used together with:

```text
ZSP360_LOAD_TEST_DATA
ZSP360_TEST_RISK_ENGINE
ZSP360_RUN_RISK
```

## ZSP360_LOAD_TEST_DATA

Loads demo procurement and vendor data into the SmartProcure360 tables.

## ZSP360_TEST_RISK_ENGINE

Tests the mathematical risk calculation using controlled input values.

## ZSP360_RUN_RISK

Runs database-driven risk calculation for a selected vendor.

---

# Related Database Objects

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

---

# Related CDS Views

```text
ZC_SP360_VENDOR_RISK
ZC_SP360_PO_ANALYTICS
ZC_SP360_DELIVERY_ANALYTICS
ZC_SP360_PROCUREMENT_OVERVIEW
```

---

# OData Entity Sets

```text
VendorRiskSet
ApprovalSet
AlertSet
AuditSet
POAnalyticsSet
ProcOverviewSet
DeliveryAnlySet
PRSet
```

---

# End-to-End Processing

The complete SmartProcure360 backend flow is:

```text
SAP Database Tables
        |
        v
CDS Analytics Views
        |
        v
ABAP Business Logic
        |
        +------------------+
        |                  |
        v                  v
Risk Engine          OData DPC Extension
        |                  |
        +---------+--------+
                  |
                  v
           ZSP360_ODATA_SRV
                  |
                  v
             SAPUI5 UI
```

---

# Technical Highlights

The custom classes demonstrate:

- ABAP Object-Oriented Programming
- Static methods
- Method parameters and return values
- Database access using Open SQL
- CDS consumption from ABAP
- Internal tables
- Work areas
- Field symbols
- `MOVE-CORRESPONDING`
- OData Gateway implementation
- Entity and EntitySet processing
- CRUD operations
- Business exception handling
- Database-driven business calculations
- Reusable business logic

---

# Development Environment

```text
SAP S/4HANA 1809
ABAP Platform 1809
Global Bike 3.3
Eclipse ADT
SAP GUI
```

---

# Summary

The SmartProcure360 ABAP class layer contains the core backend logic required for vendor risk management and OData integration.

`ZCL_SP360_RISK_ENGINE` is responsible for calculating vendor performance and risk.

`ZCL_ZSP360_ODATA_DPC_EXT` connects the SAP backend business objects and CDS views to the OData service consumed by the SAPUI5 frontend.

Together, these classes provide the main ABAP application layer of SmartProcure360.
