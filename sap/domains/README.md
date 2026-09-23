# SmartProcure360 - SAP Domains

This folder documents the custom SAP Dictionary domains created for the SmartProcure360 procurement and vendor risk management system.

## Package

```text
ZSP360
SmartProcure360 - Procurement & Vendor Risk
```

## Purpose

SAP domains define the technical characteristics and allowed value semantics used by the SmartProcure360 data elements and database tables.

The custom domains provide reusable definitions for:

- Vendor information
- Procurement documents
- Materials and quantities
- Financial amounts
- Risk scores and risk levels
- Delivery and quality tracking
- Approval and audit identifiers

---

## Domain Overview

| # | Domain | Technical Type | Length / Format | Purpose |
|---|---|---|---|---|
| 1 | `ZSP360_D_VENDOR_ID` | CHAR | 10 | Vendor ID |
| 2 | `ZSP360_D_VENDOR_NAME` | CHAR | 40 | Vendor Name |
| 3 | `ZSP360_D_CATEGORY` | CHAR | 20 | Vendor Category |
| 4 | `ZSP360_D_EMAIL` | CHAR | 50 | Email Address |
| 5 | `ZSP360_D_PHONE` | CHAR | 20 | Phone Number |
| 6 | `ZSP360_D_STATUS` | CHAR | 20 | Business Status |
| 7 | `ZSP360_D_RISK_LEVEL` | CHAR | 10 | Risk Classification |
| 8 | `ZSP360_D_RISK_SCORE` | DEC | 5,2 | Final Risk Score |
| 9 | `ZSP360_D_PR_ID` | CHAR | 12 | Purchase Requisition ID |
| 10 | `ZSP360_D_ITEM_NO` | NUMC | 5 | Item Number |
| 11 | `ZSP360_D_DEPARTMENT` | CHAR | 30 | Department |
| 12 | `ZSP360_D_PRIORITY` | CHAR | 10 | Procurement Priority |
| 13 | `ZSP360_D_PO_ID` | CHAR | 12 | Purchase Order ID |
| 14 | `ZSP360_D_MATERIAL` | CHAR | 18 | Material Number |
| 15 | `ZSP360_D_QUANTITY` | DEC | 13,3 | Quantity |
| 16 | `ZSP360_D_UNIT` | CHAR | 5 | Unit of Measure |
| 17 | `ZSP360_D_AMOUNT` | DEC | 15,2 | Monetary Amount |
| 18 | `ZSP360_D_CURRENCY` | CUKY | 5 | Currency |
| 19 | `ZSP360_D_DELIVERY_ID` | CHAR | 12 | Delivery ID |
| 20 | `ZSP360_D_QUALITY_ID` | CHAR | 12 | Quality Inspection ID |
| 21 | `ZSP360_D_APPROVAL_ID` | CHAR | 12 | Approval ID |
| 22 | `ZSP360_D_AUDIT_ID` | CHAR | 12 | Audit ID |
| 23 | `ZSP360_D_SCORE` | DEC | 5,2 | Component Score |
| 24 | `ZSP360_D_DELAY_DAYS` | INT4 | 4-byte Integer | Delivery Delay Days |

---

# 1. ZSP360_D_VENDOR_ID

**Purpose:** Defines the unique identifier used for SmartProcure360 vendors.

```text
Type   : CHAR
Length : 10
```

Example:

```text
V100000001
V100000002
V100000003
```

Used by:

```text
ZSP360_VENDOR
ZSP360_PR_ITEM
ZSP360_PO
ZSP360_QUALITY
ZSP360_RISK
ZSP360_ALERT
```

---

# 2. ZSP360_D_VENDOR_NAME

**Purpose:** Stores vendor names.

```text
Type   : CHAR
Length : 40
```

Examples:

```text
Alpha Components
Beta Manufacturing
CycleTech Supplies
```

---

# 3. ZSP360_D_CATEGORY

**Purpose:** Defines the business category of a vendor.

```text
Type   : CHAR
Length : 20
```

Examples:

```text
COMPONENTS
RAW_MATERIAL
ELECTRONICS
MANUFACTURING
```

---

# 4. ZSP360_D_EMAIL

**Purpose:** Stores vendor email addresses.

```text
Type   : CHAR
Length : 50
```

Example:

```text
vendor@example.com
```

---

# 5. ZSP360_D_PHONE

**Purpose:** Stores vendor contact phone numbers.

```text
Type   : CHAR
Length : 20
```

---

# 6. ZSP360_D_STATUS

**Purpose:** Provides a reusable character domain for business status values.

```text
Type   : CHAR
Length : 20
```

Used for multiple business objects.

Examples include:

```text
ACTIVE
INACTIVE
OPEN
DELIVERED
DELAYED
DRAFT
SUBMITTED
APPROVED
REJECTED
PENDING
```

---

# 7. ZSP360_D_RISK_LEVEL

**Purpose:** Defines the vendor risk classification.

```text
Type   : CHAR
Length : 10
```

Supported business values:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Risk classification is calculated by the SmartProcure360 risk engine.

---

# 8. ZSP360_D_RISK_SCORE

**Purpose:** Stores the final calculated vendor risk score.

```text
Type      : DEC
Length    : 5
Decimals  : 2
```

Valid logical range:

```text
0.00 - 100.00
```

The risk engine ensures that the final risk score does not fall below 0 or exceed 100.

---

# 9. ZSP360_D_PR_ID

**Purpose:** Defines the unique Purchase Requisition identifier.

```text
Type   : CHAR
Length : 12
```

Examples:

```text
PR100000001
PR100000002
PR100000003
```

Used by:

```text
ZSP360_PR
ZSP360_PR_ITEM
ZSP360_PO
```

---

# 10. ZSP360_D_ITEM_NO

**Purpose:** Stores procurement document item numbers.

```text
Type   : NUMC
Length : 5
```

Used by:

```text
ZSP360_PR_ITEM
ZSP360_PO_ITEM
ZSP360_DELIVERY
```

---

# 11. ZSP360_D_DEPARTMENT

**Purpose:** Stores the department responsible for a purchase requisition.

```text
Type   : CHAR
Length : 30
```

Examples:

```text
PROCUREMENT
PRODUCTION
MAINTENANCE
IT
```

---

# 12. ZSP360_D_PRIORITY

**Purpose:** Defines the priority of a purchase requisition.

```text
Type   : CHAR
Length : 10
```

Examples:

```text
LOW
MEDIUM
HIGH
```

---

# 13. ZSP360_D_PO_ID

**Purpose:** Defines the unique Purchase Order identifier.

```text
Type   : CHAR
Length : 12
```

Examples:

```text
PO100000001
PO100000002
PO100000003
```

Used by:

```text
ZSP360_PO
ZSP360_PO_ITEM
ZSP360_DELIVERY
ZSP360_QUALITY
```

---

# 14. ZSP360_D_MATERIAL

**Purpose:** Stores material numbers associated with procurement items.

```text
Type   : CHAR
Length : 18
```

Used by:

```text
ZSP360_PR_ITEM
ZSP360_PO_ITEM
```

---

# 15. ZSP360_D_QUANTITY

**Purpose:** Stores procurement quantities.

```text
Type      : DEC
Length    : 13
Decimals  : 3
```

Supports quantities such as:

```text
10.000
125.500
1000.250
```

Used by:

```text
ZSP360_PR_ITEM
ZSP360_PO_ITEM
ZSP360_DELIVERY
ZSP360_QUALITY
```

---

# 16. ZSP360_D_UNIT

**Purpose:** Stores the unit of measure for procurement quantities.

```text
Type   : CHAR
Length : 5
```

Examples:

```text
EA
KG
BOX
PCS
```

---

# 17. ZSP360_D_AMOUNT

**Purpose:** Stores procurement monetary amounts.

```text
Type      : DEC
Length    : 15
Decimals  : 2
```

Used by:

```text
ZSP360_PR
ZSP360_PR_ITEM
ZSP360_PO
```

Examples:

```text
12500.00
8700.00
15300.00
```

---

# 18. ZSP360_D_CURRENCY

**Purpose:** Defines currency fields used by procurement documents.

```text
Type   : CUKY
Length : 5
```

Example:

```text
USD
```

Used by:

```text
ZSP360_PR
ZSP360_PO
```

---

# 19. ZSP360_D_DELIVERY_ID

**Purpose:** Defines the unique delivery identifier.

```text
Type   : CHAR
Length : 12
```

Used by:

```text
ZSP360_DELIVERY
```

---

# 20. ZSP360_D_QUALITY_ID

**Purpose:** Defines the unique quality inspection identifier.

```text
Type   : CHAR
Length : 12
```

Used by:

```text
ZSP360_QUALITY
```

---

# 21. ZSP360_D_APPROVAL_ID

**Purpose:** Defines the unique approval workflow request identifier.

```text
Type   : CHAR
Length : 12
```

Used by:

```text
ZSP360_APPROVAL
```

Example generated approval IDs:

```text
260922101327
```

---

# 22. ZSP360_D_AUDIT_ID

**Purpose:** Defines the unique audit record identifier.

```text
Type   : CHAR
Length : 12
```

Used by:

```text
ZSP360_AUDIT
ZSP360_RISK
```

Example:

```text
AUD10000001
AUD10000002
AUD10000003
```

---

# 23. ZSP360_D_SCORE

**Purpose:** Stores individual procurement performance component scores.

```text
Type      : DEC
Length    : 5
Decimals  : 2
```

Logical range:

```text
0.00 - 100.00
```

Used for:

```text
DELIVERY_SCORE
QUALITY_SCORE
PRICE_SCORE
HISTORY_SCORE
QUALITY_SCORE
```

---

# 24. ZSP360_D_DELAY_DAYS

**Purpose:** Stores the number of days by which a delivery is delayed.

```text
Type : INT4
```

Examples:

```text
0
2
5
10
```

Used by:

```text
ZSP360_DELIVERY
```

The value is also consumed by the risk engine to calculate delivery and historical performance.

---

# Standard SAP Types Used Alongside Custom Domains

SmartProcure360 also uses standard SAP Dictionary types where appropriate.

| SAP Type | Usage |
|---|---|
| `MANDT` | SAP Client |
| `DATS` | Dates |
| `TIMS` | Time |
| `SYUNAME` | SAP User Name |
| `LAND1` | Country |
| `CUKY` | Currency |

---

# Domain Usage Architecture

```text
SAP Domains
     |
     v
Data Elements
     |
     v
Database Tables
     |
     +-------------------+
     |                   |
     v                   v
ABAP Logic          CDS Views
     |                   |
     +---------+---------+
               |
               v
          OData Service
               |
               v
          SAPUI5 Frontend
```

---

# Domain-to-Table Mapping

| Domain | Main Tables |
|---|---|
| `ZSP360_D_VENDOR_ID` | Vendor, PR Item, PO, Quality, Risk, Alert |
| `ZSP360_D_VENDOR_NAME` | Vendor, PR Item |
| `ZSP360_D_CATEGORY` | Vendor |
| `ZSP360_D_EMAIL` | Vendor |
| `ZSP360_D_PHONE` | Vendor |
| `ZSP360_D_STATUS` | Vendor, PR, PO, Delivery |
| `ZSP360_D_RISK_LEVEL` | Vendor, Risk |
| `ZSP360_D_RISK_SCORE` | Vendor, Risk |
| `ZSP360_D_PR_ID` | PR, PR Item, PO |
| `ZSP360_D_ITEM_NO` | PR Item, PO Item, Delivery |
| `ZSP360_D_DEPARTMENT` | PR |
| `ZSP360_D_PRIORITY` | PR |
| `ZSP360_D_PO_ID` | PO, PO Item, Delivery, Quality |
| `ZSP360_D_MATERIAL` | PR Item, PO Item |
| `ZSP360_D_QUANTITY` | PR Item, PO Item, Delivery, Quality |
| `ZSP360_D_UNIT` | PR Item, PO Item |
| `ZSP360_D_AMOUNT` | PR, PR Item, PO |
| `ZSP360_D_CURRENCY` | PR, PO |
| `ZSP360_D_DELIVERY_ID` | Delivery |
| `ZSP360_D_QUALITY_ID` | Quality |
| `ZSP360_D_APPROVAL_ID` | Approval |
| `ZSP360_D_AUDIT_ID` | Audit, Risk |
| `ZSP360_D_SCORE` | Quality, Risk |
| `ZSP360_D_DELAY_DAYS` | Delivery |

---

# SAP Technical Notes

All custom domains were created in the SAP ABAP Dictionary using:

```text
SE11
```

The domains are part of the:

```text
ZSP360
```

package.

The custom domains are reused through corresponding `ZSP360_E_*` data elements wherever applicable.

This provides a centralized and reusable definition of technical field characteristics across the SmartProcure360 database model.

---

# Related Components

The domains support the following SmartProcure360 backend components:

### Database Tables

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

### ABAP Classes

```text
ZCL_SP360_RISK_ENGINE
ZCL_ZSP360_ODATA_DPC_EXT
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

# Summary

The SmartProcure360 domain layer provides reusable SAP Dictionary definitions for the complete procurement and vendor risk management solution.

The domains standardize:

- Vendor identification
- Procurement document identification
- Material and quantity handling
- Financial values
- Currency handling
- Risk scores
- Risk classifications
- Delivery tracking
- Quality tracking
- Approval workflow
- Audit tracking

This domain-based design keeps the SmartProcure360 SAP data model consistent, reusable and maintainable.
