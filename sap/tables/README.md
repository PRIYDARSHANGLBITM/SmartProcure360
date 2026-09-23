# SmartProcure360 - SAP Database Tables

This folder contains the documentation of the custom SAP database tables created for the SmartProcure360 procurement and vendor risk management system.

## Package

```text
ZSP360
SmartProcure360 - Procurement & Vendor Risk
```

## Table Overview

| # | Table | Purpose |
|---|---|---|
| 1 | `ZSP360_VENDOR` | Stores vendor master and risk information |
| 2 | `ZSP360_PR` | Stores purchase requisition header information |
| 3 | `ZSP360_PR_ITEM` | Stores purchase requisition item details |
| 4 | `ZSP360_PO` | Stores purchase order header information |
| 5 | `ZSP360_PO_ITEM` | Stores purchase order item details |
| 6 | `ZSP360_DELIVERY` | Stores delivery tracking information |
| 7 | `ZSP360_QUALITY` | Stores vendor quality inspection information |
| 8 | `ZSP360_RISK` | Stores calculated vendor risk information |
| 9 | `ZSP360_APPROVAL` | Stores vendor/document approval workflow information |
| 10 | `ZSP360_AUDIT` | Stores procurement and business audit history |
| 11 | `ZSP360_ALERT` | Stores vendor risk and procurement alerts |

---

## 1. ZSP360_VENDOR

### Purpose

Stores vendor master information along with the current vendor risk score and risk level.

### Fields

| Field | Type | Key | Description |
|---|---|---:|---|
| `MANDT` | MANDT | Yes | SAP Client |
| `VENDOR_ID` | ZSP360_E_VENDOR_ID | Yes | Unique Vendor ID |
| `VENDOR_NAME` | ZSP360_E_VENDOR_NAME | No | Vendor Name |
| `CATEGORY` | ZSP360_E_CATEGORY | No | Vendor Category |
| `COUNTRY` | LAND1 | No | Vendor Country |
| `EMAIL` | ZSP360_E_EMAIL | No | Vendor Email |
| `PHONE` | ZSP360_E_PHONE | No | Vendor Phone |
| `STATUS` | ZSP360_E_STATUS | No | Vendor Status |
| `RISK_SCORE` | ZSP360_E_RISK_SCORE | No | Current calculated risk score |
| `RISK_LEVEL` | ZSP360_E_RISK_LEVEL | No | LOW, MEDIUM, HIGH or CRITICAL |
| `CREATED_ON` | DATS | No | Creation Date |
| `CREATED_BY` | SYUNAME | No | Created By |

### Sample Vendors

| Vendor ID | Vendor Name | Risk Level |
|---|---|---|
| `V100000001` | Alpha Components | LOW |
| `V100000002` | Beta Manufacturing | MEDIUM |
| `V100000003` | CycleTech Supplies | HIGH |
| `V100000004` | Global Parts Ltd | LOW |
| `V100000005` | RapidGear Industries | CRITICAL |

---

## 2. ZSP360_PR

### Purpose

Stores purchase requisition header information.

### Fields

| Field | Type | Key | Description |
|---|---|---:|---|
| `MANDT` | MANDT | Yes | SAP Client |
| `PR_ID` | ZSP360_E_PR_ID | Yes | Purchase Requisition ID |
| `REQUESTER` | SYUNAME | No | Requesting User |
| `DEPARTMENT` | ZSP360_E_DEPARTMENT | No | Requesting Department |
| `PRIORITY` | ZSP360_E_PRIORITY | No | PR Priority |
| `REQUEST_DATE` | DATS | No | PR Request Date |
| `REQUIRED_DATE` | DATS | No | Required Delivery Date |
| `STATUS` | ZSP360_E_STATUS | No | PR Status |
| `TOTAL_AMOUNT` | ZSP360_E_AMOUNT | No | Total PR Amount |
| `CURRENCY` | ZSP360_E_CURRENCY | No | Currency |

### Example Status Values

```text
DRAFT
SUBMITTED
APPROVED
CONVERTED_TO_PO
```

---

## 3. ZSP360_PR_ITEM

### Purpose

Stores item-level details for purchase requisitions.

### Fields

| Field | Type | Key | Description |
|---|---|---:|---|
| `MANDT` | MANDT | Yes | SAP Client |
| `PR_ID` | ZSP360_E_PR_ID | Yes | Purchase Requisition ID |
| `ITEM_NO` | ZSP360_E_ITEM_NO | Yes | PR Item Number |
| `MATERIAL` | ZSP360_E_MATERIAL | No | Material Number |
| `DESCRIPTION` | ZSP360_E_VENDOR_NAME | No | Item Description |
| `QUANTITY` | ZSP360_E_QUANTITY | No | Requested Quantity |
| `UNIT` | ZSP360_E_UNIT | No | Unit of Measure |
| `EST_PRICE` | ZSP360_E_AMOUNT | No | Estimated Price |
| `VENDOR_ID` | ZSP360_E_VENDOR_ID | No | Suggested Vendor ID |

### Relationship

```text
ZSP360_PR
    |
    | 1 : N
    v
ZSP360_PR_ITEM
```

---

## 4. ZSP360_PO

### Purpose

Stores purchase order header information and procurement lifecycle status.

### Fields

| Field | Type | Key | Description |
|---|---|---:|---|
| `MANDT` | MANDT | Yes | SAP Client |
| `PO_ID` | ZSP360_E_PO_ID | Yes | Purchase Order ID |
| `PR_ID` | ZSP360_E_PR_ID | No | Related Purchase Requisition |
| `VENDOR_ID` | ZSP360_E_VENDOR_ID | No | Vendor ID |
| `ORDER_DATE` | DATS | No | PO Order Date |
| `EXPECTED_DATE` | DATS | No | Expected Delivery Date |
| `ACTUAL_DATE` | DATS | No | Actual Delivery Date |
| `TOTAL_AMOUNT` | ZSP360_E_AMOUNT | No | Total PO Amount |
| `CURRENCY` | ZSP360_E_CURRENCY | No | Currency |
| `STATUS` | ZSP360_E_STATUS | No | PO Status |

### Example Status Values

```text
OPEN
DELIVERED
DELAYED
```

---

## 5. ZSP360_PO_ITEM

### Purpose

Stores item-level purchase order information.

### Fields

| Field | Type | Key | Description |
|---|---|---:|---|
| `MANDT` | MANDT | Yes | SAP Client |
| `PO_ID` | ZSP360_E_PO_ID | Yes | Purchase Order ID |
| `ITEM_NO` | ZSP360_E_ITEM_NO | Yes | PO Item Number |
| `MATERIAL` | ZSP360_E_MATERIAL | No | Material Number |
| `QUANTITY` | ZSP360_E_QUANTITY | No | Ordered Quantity |
| `UNIT` | ZSP360_E_UNIT | No | Unit of Measure |
| `NET_PRICE` | ZSP360_E_AMOUNT | No | Net Item Price |

### Relationship

```text
ZSP360_PO
    |
    | 1 : N
    v
ZSP360_PO_ITEM
```

---

## 6. ZSP360_DELIVERY

### Purpose

Tracks vendor delivery performance and delivery delays.

### Fields

| Field | Type | Key | Description |
|---|---|---:|---|
| `MANDT` | MANDT | Yes | SAP Client |
| `DELIVERY_ID` | ZSP360_E_DELIVERY_ID | Yes | Delivery ID |
| `PO_ID` | ZSP360_E_PO_ID | No | Purchase Order ID |
| `ITEM_NO` | ZSP360_E_ITEM_NO | No | PO Item Number |
| `DELIVERY_DATE` | DATS | No | Actual Delivery Date |
| `QUANTITY` | ZSP360_E_QUANTITY | No | Delivered Quantity |
| `STATUS` | ZSP360_E_STATUS | No | Delivery Status |
| `DELAY_DAYS` | INT4 | No | Number of Delayed Days |

### Delivery Analytics

The delivery analytics CDS view uses this table together with `ZSP360_PO` to determine:

- Expected delivery date
- Actual delivery date
- Delivery status
- Delay days
- Vendor delivery performance

---

## 7. ZSP360_QUALITY

### Purpose

Stores vendor quality inspection results used by the risk engine.

### Fields

| Field | Type | Key | Description |
|---|---|---:|---|
| `MANDT` | MANDT | Yes | SAP Client |
| `QUALITY_ID` | ZSP360_E_QUALITY_ID | Yes | Quality Inspection ID |
| `VENDOR_ID` | ZSP360_E_VENDOR_ID | No | Vendor ID |
| `PO_ID` | ZSP360_E_PO_ID | No | Purchase Order ID |
| `INSPECTION_DATE` | DATS | No | Quality Inspection Date |
| `ACCEPTED_QTY` | ZSP360_E_QUANTITY | No | Accepted Quantity |
| `REJECTED_QTY` | ZSP360_E_QUANTITY | No | Rejected Quantity |
| `QUALITY_SCORE` | ZSP360_E_SCORE | No | Quality Score |
| `ISSUE_TYPE` | ZSP360_E_STATUS | No | Quality Issue Type |

### Risk Engine Usage

Quality data contributes to the overall vendor risk calculation through the quality score.

```text
ZSP360_QUALITY
       |
       v
GET_QUALITY_SCORE( )
       |
       v
Overall Vendor Risk
```

---

## 8. ZSP360_RISK

### Purpose

Stores the calculated vendor risk assessment and recommendation.

### Fields

| Field | Type | Key | Description |
|---|---|---:|---|
| `MANDT` | MANDT | Yes | SAP Client |
| `RISK_ID` | ZSP360_E_AUDIT_ID | Yes | Risk Assessment ID |
| `VENDOR_ID` | ZSP360_E_VENDOR_ID | No | Vendor ID |
| `CALCULATED_ON` | DATS | No | Risk Calculation Date |
| `DELIVERY_SCORE` | ZSP360_E_SCORE | No | Delivery Performance Score |
| `QUALITY_SCORE` | ZSP360_E_SCORE | No | Quality Performance Score |
| `PRICE_SCORE` | ZSP360_E_SCORE | No | Price Performance Score |
| `HISTORY_SCORE` | ZSP360_E_SCORE | No | Historical Performance Score |
| `RISK_SCORE` | ZSP360_E_RISK_SCORE | No | Final Risk Score |
| `RISK_LEVEL` | ZSP360_E_RISK_LEVEL | No | Risk Classification |
| `RECOMMENDATION` | ZSP360_E_STATUS | No | Recommended Management Action |

### Risk Formula

```text
Performance Score =
    Delivery Score × 40%
  + Quality Score  × 30%
  + Price Score    × 20%
  + History Score  × 10%

Risk Score = 100 - Performance Score
```

### Risk Levels

| Risk Score | Risk Level |
|---:|---|
| 0 - 30 | LOW |
| 31 - 60 | MEDIUM |
| 61 - 80 | HIGH |
| 81 - 100 | CRITICAL |

### Recommendations

| Risk Level | Recommendation |
|---|---|
| LOW | NORMAL_MONITORING |
| MEDIUM | MONITOR_PERFORMANCE |
| HIGH | MANAGER_REVIEW |
| CRITICAL | URGENT_REVIEW |

---

## 9. ZSP360_APPROVAL

### Purpose

Stores approval workflow information for vendor risk reviews and procurement documents.

### Fields

| Field | Type | Key | Description |
|---|---|---:|---|
| `MANDT` | MANDT | Yes | SAP Client |
| `APPROVAL_ID` | ZSP360_E_APPROVAL_ID | Yes | Approval Request ID |
| `DOCUMENT_TYPE` | DDIC-defined | No | Business Document Type |
| `DOCUMENT_ID` | DDIC-defined | No | Related Business Object ID |
| `APPROVER` | SYUNAME | No | Approver User |
| `APPROVAL_LEVEL` | DDIC-defined | No | Approval Level |
| `DECISION` | DDIC-defined | No | Approval Decision |
| `DECISION_DATE` | DATS | No | Decision Date |
| `COMMENTS` | DDIC-defined | No | Approval Comments |

### Example Decisions

```text
PENDING
APPROVED
REJECTED
```

### Approval Workflow

```text
Vendor Risk Detected
        |
        v
Mark for Review
        |
        v
Approval Request Created
        |
        +------------------+
        |                  |
        v                  v
    APPROVED            REJECTED
```

---

## 10. ZSP360_AUDIT

### Purpose

Stores an audit trail of important procurement and business actions.

### Fields

| Field | Type | Key | Description |
|---|---|---:|---|
| `MANDT` | MANDT | Yes | SAP Client |
| `AUDIT_ID` | ZSP360_E_AUDIT_ID | Yes | Audit Record ID |
| `OBJECT_TYPE` | DDIC-defined | No | Business Object Type |
| `OBJECT_ID` | DDIC-defined | No | Business Object ID |
| `ACTION` | DDIC-defined | No | Performed Action |
| `CHANGED_BY` | SYUNAME | No | User who performed the action |
| `CHANGED_ON` | DATS | No | Change Date |
| `CHANGED_AT` | TIMS | No | Change Time |
| `OLD_VALUE` | DDIC-defined | No | Previous Value |
| `NEW_VALUE` | DDIC-defined | No | New Value |

### Example Audit Events

```text
PR CREATED
PR APPROVED
PO DELAY_DETECTED
```

### Audit Flow

```text
Business Action
      |
      v
ZSP360_AUDIT
      |
      v
AuditSet
      |
      v
SmartProcure360 UI
```

---

## 11. ZSP360_ALERT

### Purpose

Stores smart alerts generated from vendor risk and procurement conditions.

### Business Fields

| Field | Description |
|---|---|
| `ALERT_ID` | Unique Alert ID |
| `VENDOR_ID` | Related Vendor ID |
| `ALERT_TYPE` | Alert Category |
| `SEVERITY` | Alert Severity |
| `STATUS` | Alert Status |
| `MESSAGE` | Human-readable alert message |

### Example Alert

```text
Alert ID : 260921070049
Vendor   : V100000003
Type     : HIGH_RISK
Severity : HIGH
Status   : OPEN

Message:
Vendor CycleTech Supplies has HIGH risk level.
Manager review required.
```

### Alert Flow

```text
Risk Engine
     |
     v
High / Critical Risk
     |
     v
Smart Alert
     |
     v
ZSP360_ALERT
     |
     v
AlertSet
     |
     v
SAPUI5 Smart Alerts
```

---

# Table Relationships

The major database relationships are represented below:

```text
                    ZSP360_VENDOR
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
      ZSP360_PR      ZSP360_PO      ZSP360_RISK
          |              |
          v              v
   ZSP360_PR_ITEM   ZSP360_PO_ITEM
                         |
                         v
                  ZSP360_DELIVERY
                         |
                         v
                  Delivery Analytics

ZSP360_VENDOR
      |
      v
ZSP360_QUALITY
      |
      v
  Risk Engine

ZSP360_VENDOR
      |
      v
ZSP360_APPROVAL

Procurement / Risk Actions
      |
      +--------------------+
      |                    |
      v                    v
ZSP360_AUDIT          ZSP360_ALERT
```

---

# Procurement Data Flow

```text
Vendor Master
     |
     v
Purchase Requisition
     |
     v
Purchase Requisition Item
     |
     v
Purchase Order
     |
     v
Purchase Order Item
     |
     v
Delivery Tracking
     |
     v
Quality Inspection
     |
     v
Vendor Risk Engine
     |
     +-------------------+
     |                   |
     v                   v
Risk Assessment       Smart Alert
     |
     v
Approval Workflow
     |
     v
Audit Log
```

---

# Risk Engine Data Flow

The SmartProcure360 risk engine reads procurement performance data from multiple tables.

```text
ZSP360_DELIVERY
       |
       v
Delivery Score
       |
       +--------------------+
                            |
ZSP360_QUALITY              |
       |                    |
       v                    |
Quality Score               |
                            |
ZSP360_PO_ITEM              |
       |                    |
       v                    |
Price Score                 |
                            |
Historical Data             |
       |                    |
       v                    |
History Score               |
       |                    |
       +---------+----------+
                 |
                 v
        CALCULATE_FINAL_SCORE
                 |
                 v
            Risk Score
                 |
        +--------+--------+
        |        |        |
        v        v        v
      LOW    MEDIUM     HIGH
                         |
                         v
                      CRITICAL
```

---

# Database-to-Application Architecture

```text
+--------------------------------------------------+
|                SAPUI5 Frontend                   |
|                                                  |
| Dashboard | Analytics | Alerts | Audit | Vendor |
+--------------------------+-----------------------+
                           |
                           v
+--------------------------------------------------+
|                 SAP OData Layer                  |
|                                                  |
| ZSP360_ODATA_SRV                                 |
|                                                  |
| VendorRiskSet                                    |
| POAnalyticsSet                                   |
| DeliveryAnlySet                                  |
| ProcOverviewSet                                  |
| PRSet                                            |
| ApprovalSet                                      |
| AlertSet                                         |
| AuditSet                                         |
+--------------------------+-----------------------+
                           |
                           v
+--------------------------------------------------+
|              ABAP Application Layer              |
|                                                  |
| ZCL_SP360_RISK_ENGINE                            |
| ZCL_ZSP360_ODATA_DPC_EXT                         |
| Reports / Business Logic                         |
+--------------------------+-----------------------+
                           |
                           v
+--------------------------------------------------+
|                 CDS Analytics                    |
|                                                  |
| ZC_SP360_VENDOR_RISK                             |
| ZC_SP360_PO_ANALYTICS                            |
| ZC_SP360_DELIVERY_ANALYTICS                      |
| ZC_SP360_PROCUREMENT_OVERVIEW                    |
+--------------------------+-----------------------+
                           |
                           v
+--------------------------------------------------+
|               SAP Database Tables                |
|                                                  |
| Vendor | PR | PO | Delivery | Quality            |
| Risk   | Approval | Audit | Alert                |
+--------------------------------------------------+
```

---

# CDS Views Using These Tables

## ZC_SP360_VENDOR_RISK

Purpose:

Provides vendor risk information for analytics and the SAPUI5 Vendor Risk Overview.

Main source:

```text
ZSP360_VENDOR
```

Important fields:

```text
VendorId
VendorName
Category
Country
Status
RiskScore
RiskLevel
CreatedOn
CreatedBy
```

---

## ZC_SP360_PO_ANALYTICS

Purpose:

Provides purchase order analytics by combining purchase orders with vendor information.

Main sources:

```text
ZSP360_PO
ZSP360_VENDOR
```

Important fields:

```text
PurchaseOrderId
PurchaseRequisitionId
VendorId
VendorName
VendorCategory
OrderDate
ExpectedDate
ActualDate
TotalAmount
Currency
POStatus
```

---

## ZC_SP360_DELIVERY_ANALYTICS

Purpose:

Provides delivery performance and delay analytics.

Main sources:

```text
ZSP360_DELIVERY
ZSP360_PO
ZSP360_VENDOR
```

Important fields:

```text
DeliveryId
PurchaseOrderId
ItemNo
VendorId
VendorName
VendorCategory
ExpectedDate
DeliveryDate
DeliveredQuantity
DeliveryStatus
DelayDays
```

---

## ZC_SP360_PROCUREMENT_OVERVIEW

Purpose:

Provides an overall procurement monitoring view combining PO and vendor risk information.

Main sources:

```text
ZSP360_PO
ZSP360_VENDOR
```

Important fields:

```text
PurchaseOrderId
PurchaseRequisitionId
VendorId
VendorName
VendorCategory
RiskScore
RiskLevel
OrderDate
ExpectedDate
ActualDate
TotalAmount
Currency
POStatus
```

---

# OData Exposure

The custom tables and CDS views are exposed through the SmartProcure360 OData service:

```text
ZSP360_ODATA_SRV
```

Main entity sets:

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

The OData service is consumed by the SAPUI5 frontend.

---

# Test Data

The project includes demo procurement data used for development and end-to-end testing.

### Vendors

```text
V100000001  Alpha Components       LOW
V100000002  Beta Manufacturing     MEDIUM
V100000003  CycleTech Supplies     HIGH
V100000004  Global Parts Ltd       LOW
V100000005  RapidGear Industries   CRITICAL
```

### Purchase Orders

```text
PO100000001  Alpha Components
PO100000002  Beta Manufacturing
PO100000003  CycleTech Supplies
```

### Purchase Requisitions

```text
PR100000001
PR100000002
PR100000003
PR100000004
PR100000005
```

---

# Current Demo Analytics

The current test data produces the following validated UI analytics.

## Vendor Risk

```text
Total Vendors : 5
Low Risk      : 2
Medium Risk   : 1
High Risk     : 1
Critical Risk : 1
```

## Purchase Orders

```text
Total POs       : 3
Total PO Amount : 36,500 USD
Delivered       : 1
Delayed         : 1
```

## Purchase Requisitions

```text
Total PRs       : 5
Total PR Amount : 43,800 USD
Approved        : 2
Submitted       : 1
Draft           : 1
```

## Delivery Analytics

```text
Total Deliveries : 3
Delivered        : 1
Pending          : 1
Delayed          : 1
Total Delay Days : 5
```

---

# SAP Technical Notes

## Table Creation

All custom tables were created in the SAP ABAP Dictionary using:

```text
SE11
```

Each table contains:

- SAP Client field `MANDT`
- Appropriate primary key fields
- Custom domains/data elements where required
- Activation in the ABAP Dictionary

## Package

All SmartProcure360 backend objects belong to:

```text
ZSP360
```

## Development System

```text
SAP S/4HANA 1809
ABAP Platform 1809
Global Bike 3.3
```

---

# Related SAP Objects

The database tables are used by the following SmartProcure360 components.

### ABAP Classes

```text
ZCL_SP360_RISK_ENGINE
ZCL_ZSP360_ODATA_DPC_EXT
```

### Reports

```text
ZSP360_LOAD_TEST_DATA
ZSP360_TEST_RISK_ENGINE
ZSP360_RUN_RISK
```

### CDS Views

```text
ZC_SP360_VENDOR_RISK
ZC_SP360_PO_ANALYTICS
ZC_SP360_DELIVERY_ANALYTICS
ZC_SP360_PROCUREMENT_OVERVIEW
```

### OData Service

```text
ZSP360_ODATA_SRV
```

---

# Design Principles

The SmartProcure360 database design follows these principles:

1. Separate procurement objects into dedicated tables.
2. Maintain vendor risk independently from vendor master data.
3. Store delivery and quality performance separately for risk calculation.
4. Maintain approval workflow history.
5. Maintain an audit trail for important business events.
6. Provide alert persistence for risk-related notifications.
7. Use CDS views for analytical consumption.
8. Expose business data through OData services.
9. Keep the frontend decoupled from direct database access.
10. Use reusable ABAP business logic for risk calculation.

---

# Folder Purpose

The `sap/tables` folder is intended to document the SAP database layer of SmartProcure360.

```text
sap/
└── tables/
    └── README.md
```

Additional SAP source documentation is maintained in:

```text
sap/
├── classes/
├── cds/
├── data-elements/
├── domains/
├── odata/
├── reports/
├── tables/
└── tests/
```

---

# Summary

The SmartProcure360 database layer provides the foundation for an end-to-end intelligent procurement and vendor risk management system.

The tables support:

- Vendor Management
- Purchase Requisitions
- Purchase Orders
- Delivery Tracking
- Quality Management
- Vendor Risk Calculation
- Approval Workflow
- Smart Alerts
- Audit Logging
- Procurement Analytics

Together with ABAP, CDS, OData and SAPUI5, these tables form the core persistence layer of the SmartProcure360 solution.
