# SmartProcure360 – SAP Test Documentation

This folder documents the testing assets and validation strategy used for the SmartProcure360 SAP backend.

The project uses multiple testing levels:

```text
ABAP Logic Tests
       ↓
Database / Integration Tests
       ↓
OData Service Tests
       ↓
SAPUI5 End-to-End Tests
       ↓
Regression Validation
```

---

# 1. Testing Overview

SmartProcure360 was validated across the major backend and frontend components.

| Area | Validation | Status |
|---|---|---|
| Custom Tables | Activation and demo-data validation | PASS |
| Demo Data Loader | `ZSP360_LOAD_TEST_DATA` | PASS |
| Risk Engine | `ZSP360_TEST_RISK_ENGINE` | PASS |
| Database Risk Calculation | `ZSP360_RUN_RISK` | PASS |
| CDS Views | Data retrieval validation | PASS |
| OData Metadata | `$metadata` validation | PASS |
| Vendor Risk API | `VendorRiskSet` | PASS |
| PO Analytics API | `POAnalyticsSet` | PASS |
| Delivery Analytics API | `DeliveryAnlySet` | PASS |
| Procurement Overview API | `ProcOverviewSet` | PASS |
| PR API | `PRSet` | PASS |
| Approval API | `ApprovalSet` | PASS |
| Alerts API | `AlertSet` | PASS |
| Audit API | `AuditSet` | PASS |
| SAPUI5 Dashboard | Functional validation | PASS |
| Approval Workflow | Create / Approve / Reject | PASS |
| Search & Filters | Positive/negative testing | PASS |
| Refresh/Persistence | Backend persistence | PASS |

---

# 2. Test Reports

The project contains three primary executable ABAP reports for backend testing.

## 2.1 ZSP360_LOAD_TEST_DATA

Purpose:

```text
Load controlled SmartProcure360 demo data.
```

It populates:

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

This report provides repeatable data for testing and demonstrations.

---

## 2.2 ZSP360_TEST_RISK_ENGINE

Purpose:

```text
Validate the core mathematical risk-engine logic.
```

Test input:

```text
Delivery Score = 55
Quality Score  = 70
Price Score    = 65
History Score  = 72
```

Expected performance score:

```text
55 × 0.40 = 22.00
70 × 0.30 = 21.00
65 × 0.20 = 13.00
72 × 0.10 =  7.20

Performance Score = 63.20
```

Expected risk score:

```text
100 - 63.20 = 36.80
```

Expected result:

```text
Risk Level     = MEDIUM
Recommendation = MONITOR_PERFORMANCE
```

---

## 2.3 ZSP360_RUN_RISK

Purpose:

```text
Calculate vendor risk using live database data.
```

Example:

```text
P_VENDOR = V100000003
```

The report calls the database-driven risk-engine methods:

```text
GET_DELIVERY_SCORE
GET_QUALITY_SCORE
GET_PRICE_SCORE
GET_HISTORY_SCORE
CALCULATE_FINAL_SCORE
GET_RISK_LEVEL
GET_RECOMMENDATION
```

The final result is displayed for the selected vendor.

---

# 3. Risk Engine Test Cases

## Test Case RE-001 – Final Risk Calculation

**Input**

```text
Delivery = 55
Quality  = 70
Price    = 65
History  = 72
```

**Expected**

```text
Performance = 63.20
Risk        = 36.80
Level       = MEDIUM
Action      = MONITOR_PERFORMANCE
```

**Result:** PASS

---

## Test Case RE-002 – LOW Risk Boundary

Input:

```text
Risk Score = 30
```

Expected:

```text
Risk Level = LOW
Recommendation = NORMAL_MONITORING
```

---

## Test Case RE-003 – MEDIUM Risk Boundary

Input:

```text
Risk Score = 60
```

Expected:

```text
Risk Level = MEDIUM
Recommendation = MONITOR_PERFORMANCE
```

---

## Test Case RE-004 – HIGH Risk Boundary

Input:

```text
Risk Score = 80
```

Expected:

```text
Risk Level = HIGH
Recommendation = MANAGER_REVIEW
```

---

## Test Case RE-005 – CRITICAL Risk Boundary

Input:

```text
Risk Score = 81
```

Expected:

```text
Risk Level = CRITICAL
Recommendation = URGENT_REVIEW
```

---

# 4. Risk Threshold Validation

The configured risk model is:

| Risk Score | Risk Level | Recommendation |
|---:|---|---|
| `0–30` | LOW | `NORMAL_MONITORING` |
| `31–60` | MEDIUM | `MONITOR_PERFORMANCE` |
| `61–80` | HIGH | `MANAGER_REVIEW` |
| `81–100` | CRITICAL | `URGENT_REVIEW` |

The threshold tests ensure that boundary values do not produce unexpected classifications.

---

# 5. Database-Driven Risk Tests

## Delivery Score

The engine evaluates delivery history using:

```text
ZSP360_DELIVERY
ZSP360_PO
```

Test scenarios include:

- No delivery history
- All deliveries on time
- Some delayed deliveries
- All deliveries delayed

Expected behavior:

```text
No history → default score
No delays → high delivery performance
More delays → lower delivery performance
```

---

## Quality Score

Source:

```text
ZSP360_QUALITY
```

Test scenarios:

- No quality history
- High quality scores
- Mixed quality scores
- Low quality scores

The engine uses the vendor's average quality score.

---

## Price Score

Source:

```text
ZSP360_PO_ITEM
```

The vendor's average net price is compared against the overall average.

Expected behavior:

```text
Vendor price <= overall average
        ↓
Price score = 100
```

When the vendor is priced above the overall average, the score is reduced based on the relative premium.

---

## History Score

Historical performance combines:

```text
Delivery history = 60%
Quality history  = 40%
```

Expected behavior:

```text
Better history → higher performance score
Poor history   → lower performance score
```

---

# 6. CDS View Tests

The following CDS views were validated:

```text
ZC_SP360_VENDOR_RISK
ZC_SP360_PO_ANALYTICS
ZC_SP360_DELIVERY_ANALYTICS
ZC_SP360_PROCUREMENT_OVERVIEW
```

## Vendor Risk CDS

Expected source:

```text
ZSP360_VENDOR
```

Validation:

- Vendor ID available
- Vendor name available
- Category available
- Risk score available
- Risk level available

Result:

```text
PASS
```

---

## PO Analytics CDS

Validation:

- PO ID
- PR ID
- Vendor
- Dates
- Amount
- Currency
- Status

Result:

```text
PASS
```

---

## Delivery Analytics CDS

Validation:

- Delivery ID
- PO ID
- Vendor
- Expected date
- Delivery date
- Quantity
- Delay days
- Status

Result:

```text
PASS
```

---

## Procurement Overview CDS

Validation:

- PO information
- Vendor information
- Risk score
- Risk level
- Amount
- Dates
- Status

Result:

```text
PASS
```

---

# 7. OData API Tests

The service under test is:

```text
ZSP360_ODATA_SRV
```

## Metadata Test

Endpoint:

```text
/sap/opu/odata/sap/ZSP360_ODATA_SRV/$metadata
```

Expected:

```text
HTTP 200
Valid EDMX metadata
```

Result:

```text
PASS
```

---

# 8. Vendor Risk API Test

Endpoint:

```text
/VendorRiskSet
```

Test:

```text
GET VendorRiskSet
```

Expected:

```text
Vendor records returned
Risk score populated
Risk level populated
```

Result:

```text
PASS
```

---

# 9. PO Analytics API Test

Endpoint:

```text
/POAnalyticsSet
```

Expected demo result:

```text
Total POs = 3
Total Amount = 36,500 USD
```

Result:

```text
PASS
```

---

# 10. Delivery Analytics API Test

Endpoint:

```text
/DeliveryAnlySet
```

Expected:

```text
Total Deliveries = 3
Delivered        = 1
Pending          = 1
Delayed          = 1
Total Delay Days = 5
```

Result:

```text
PASS
```

---

# 11. Procurement Overview API Test

Endpoint:

```text
/ProcOverviewSet
```

Expected:

```text
PO100000001 → Alpha Components → LOW
PO100000002 → Beta Manufacturing → MEDIUM
PO100000003 → CycleTech Supplies → HIGH
```

Result:

```text
PASS
```

---

# 12. Purchase Requisition API Test

Endpoint:

```text
/PRSet
```

Expected demo result:

```text
Total PRs       = 5
Total PR Amount = 43,800 USD
Approved        = 2
Submitted       = 1
Draft           = 1
```

Result:

```text
PASS
```

---

# 13. Approval Workflow Tests

## Test Case AW-001 – Create Approval Request

Action:

```text
Mark for Review
```

Expected:

```text
POST ApprovalSet
Approval ID generated
Decision = PENDING
Review Status = PENDING
```

Result:

```text
PASS
```

---

## Test Case AW-002 – Approve Vendor

Action:

```text
Approve
```

Expected:

```text
PUT ApprovalSet('<ApprovalId>')
Decision = APPROVED
```

Result:

```text
PASS
```

---

## Test Case AW-003 – Reject Vendor

Action:

```text
Reject
```

Expected:

```text
PUT ApprovalSet('<ApprovalId>')
Decision = REJECTED
```

Result:

```text
PASS
```

---

## Test Case AW-004 – Persistence

Action:

```text
Refresh browser
```

Expected:

```text
Approval state remains unchanged.
```

Result:

```text
PASS
```

---

# 14. Smart Alert Tests

Endpoint:

```text
/AlertSet
```

Current demo alert:

```text
Alert ID  = 260921070049
Vendor    = V100000003
Type      = HIGH_RISK
Severity  = HIGH
Status    = OPEN
```

Message:

```text
Vendor CycleTech Supplies has HIGH risk level.
Manager review required.
```

Result:

```text
PASS
```

---

# 15. Audit Log Tests

Endpoint:

```text
/AuditSet
```

Validated records include:

```text
AUD10000001
PR100000001
CREATED

AUD10000002
PR100000001
APPROVED

AUD10000003
PO100000003
DELAY_DETECTED
```

The UI also validates OData V2 `Edm.Time` formatting.

Expected display:

```text
09:00:00
11:00:00
10:00:00
```

Result:

```text
PASS
```

---

# 16. SAPUI5 Functional Tests

## Test Case UI-001 – Dashboard

Expected:

```text
Total Vendors = 5
LOW           = 2
MEDIUM        = 1
HIGH          = 1
CRITICAL      = 1
```

Result:

```text
PASS
```

---

## Test Case UI-002 – Delivery Analytics

Expected:

```text
Total Deliveries = 3
Delivered        = 1
Pending          = 1
Delayed          = 1
Delay Days       = 5
```

Result:

```text
PASS
```

---

## Test Case UI-003 – PO Analytics

Expected:

```text
Total POs       = 3
Total Amount    = 36,500 USD
Delivered       = 1
Delayed         = 1
```

Result:

```text
PASS
```

---

## Test Case UI-004 – Procurement Overview

Expected:

```text
Total POs       = 3
Total Amount    = 36,500 USD
Low Risk POs   = 1
High Risk POs  = 1
Delayed POs    = 1
```

Result:

```text
PASS
```

---

## Test Case UI-005 – Purchase Requisitions

Expected:

```text
Total PRs       = 5
Total Amount    = 43,800 USD
Approved        = 2
Submitted       = 1
Draft           = 1
```

Result:

```text
PASS
```

---

# 17. Search and Filter Tests

## Test Case SF-001 – Vendor Search

Search:

```text
CycleTech
```

Expected:

```text
CycleTech Supplies
```

Result:

```text
PASS
```

---

## Test Case SF-002 – HIGH Risk Filter

Filter:

```text
HIGH
```

Expected:

```text
CycleTech Supplies
```

Result:

```text
PASS
```

---

## Test Case SF-003 – CRITICAL Risk Filter

Filter:

```text
CRITICAL
```

Expected:

```text
RapidGear Industries
```

Result:

```text
PASS
```

---

## Test Case SF-004 – No Results

Search:

```text
XYZ999
```

Expected:

```text
No matching vendors
```

The application must not crash or display a backend error.

Result:

```text
PASS
```

---

## Test Case SF-005 – Special Character

Search:

```text
@
```

Expected:

```text
No application crash
No red backend error
```

Result:

```text
PASS
```

---

# 18. Vendor Details Tests

## Test Case VD-001

Select:

```text
CycleTech Supplies
```

Expected:

```text
Risk Score = 72.53
Risk Level = HIGH
Recommendation = MANAGER REVIEW
```

The vendor details dialog should display:

- Vendor information
- Risk analysis
- Management action
- Approval workflow
- Review status
- Approval action buttons

Result:

```text
PASS
```

---

# 19. Refresh and Persistence Tests

The application was tested after browser refresh.

Expected:

- Vendor data remains available.
- Approval decisions remain persisted.
- Alerts remain available.
- Audit data remains available.
- Analytics remain available.
- Filters can be cleared and reapplied.
- No frontend runtime error occurs.

Result:

```text
PASS
```

---

# 20. Regression Checklist

Before considering a backend change complete, execute:

```text
[ ] Activate changed SAP object
[ ] Test affected ABAP method/report
[ ] Test related CDS view
[ ] Test $metadata if service model changed
[ ] Test affected OData entity set
[ ] Test UI5 screen
[ ] Test search/filter if affected
[ ] Test approval workflow if affected
[ ] Refresh browser
[ ] Check browser console
[ ] Check Gateway errors
```

---

# 21. Troubleshooting Guide

## OData Method Not Implemented

Error:

```text
/IWBEP/CM_MGW_RT/021
```

Check:

```text
DPC_EXT method
```

Then:

```text
Redefine
 ↓
Implement
 ↓
Activate
```

---

## Entity Not Found

Check:

```text
SEGW entity
Entity Set
Generated runtime objects
$metadata
```

If the service model changed:

```text
Regenerate Runtime Objects
```

Then clear Gateway caches if required.

---

## Internal Server Error

Check in this order:

```text
1. Direct OData URL
2. $metadata
3. DPC_EXT implementation
4. CDS/table field names
5. Generated entity structure
6. SAP Gateway error logs
7. Gateway caches
```

---

## UI Shows `[object Object]`

For OData V2 complex values such as `Edm.Time`, use an appropriate formatter.

SmartProcure360 uses a formatter for the audit `ChangedAt` value so that the UI displays:

```text
09:00:00
```

instead of:

```text
[object Object]
```

---

# 22. Test Data Reference

## Vendors

| Vendor ID | Vendor | Risk |
|---|---|---|
| `V100000001` | Alpha Components | LOW |
| `V100000002` | Beta Manufacturing | MEDIUM |
| `V100000003` | CycleTech Supplies | HIGH |
| `V100000004` | Global Parts Ltd | LOW |
| `V100000005` | RapidGear Industries | CRITICAL |

## Purchase Orders

| PO | Vendor | Status | Amount |
|---|---|---|---:|
| `PO100000001` | Alpha Components | DELIVERED | 12,500 USD |
| `PO100000002` | Beta Manufacturing | OPEN | 8,700 USD |
| `PO100000003` | CycleTech Supplies | DELAYED | 15,300 USD |

Total:

```text
36,500 USD
```

---

# 23. Test Architecture

```text
                    Test Data
                       │
                       ▼
             ZSP360_LOAD_TEST_DATA
                       │
                       ▼
                Custom Tables
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
  ZSP360_TEST_RISK_ENGINE     ZSP360_RUN_RISK
          │                         │
          ▼                         ▼
          └──────────┬──────────────┘
                     ▼
            ZCL_SP360_RISK_ENGINE
                     │
                     ▼
                CDS Views
                     │
                     ▼
              OData Service
                     │
                     ▼
               SAPUI5 UI
                     │
                     ▼
              End-to-End Test
```

---

# 24. Testing Principles

The SmartProcure360 testing strategy follows these principles:

## Isolation

Test backend logic independently before testing the UI.

## Repeatability

Use controlled demo data so scenarios can be reproduced.

## Layered Validation

Validate:

```text
ABAP
 ↓
Database
 ↓
CDS
 ↓
OData
 ↓
UI5
```

## Positive and Negative Testing

Test both:

- Valid inputs
- Empty/no-result searches
- Special characters
- Missing keys
- Invalid backend states

## Persistence

Verify that important business actions remain stored after refresh.

---

# 25. Interview-Relevant Explanation

A concise interview explanation is:

> "I tested SmartProcure360 in layers. First I validated the ABAP risk-engine calculations, then database-driven vendor risk, CDS views, OData entity sets, and finally the SAPUI5 application. I also tested approval creation, approval/rejection, search filters, no-result scenarios, persistence after refresh, alerts, and audit logging."

Key testing concepts demonstrated:

- ABAP unit-style testing
- Functional testing
- Integration testing
- API testing
- UI functional testing
- Positive testing
- Negative testing
- Boundary testing
- Regression testing
- End-to-end testing

---

# 26. Phase 12.1H Status

This document covers:

- Backend test reports
- Risk-engine test cases
- Risk threshold validation
- Database-driven scoring tests
- CDS validation
- OData API testing
- Approval workflow testing
- Alert testing
- Audit testing
- SAPUI5 functional testing
- Search/filter testing
- Negative testing
- Persistence testing
- Regression checklist
- Troubleshooting
- Test data reference
- Interview explanation

File location:

```text
SmartProcure360/
└── sap/
    └── tests/
        └── README.md
```
