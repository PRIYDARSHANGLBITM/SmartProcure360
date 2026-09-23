# SmartProcure360 – SAP CDS Views Documentation

This folder contains the Core Data Services (CDS) views used by SmartProcure360 to provide reusable analytical and reporting datasets on top of the custom SAP procurement tables.

## CDS View Overview

| CDS View | SQL View Name | Purpose |
|---|---|---|
| `ZC_SP360_VENDOR_RISK` | `ZSP360VRISK` | Vendor risk analytics |
| `ZC_SP360_PO_ANALYTICS` | `ZSP360POANLY` | Purchase-order analytics |
| `ZC_SP360_DELIVERY_ANALYTICS` | `ZSP360DELANLY` | Delivery-performance analytics |
| `ZC_SP360_PROCUREMENT_OVERVIEW` | `ZSP360PROV` | Combined procurement overview |

The CDS layer sits between the SAP database tables and the OData/UI layer.

```text
ZSP360_* Tables
       ↓
   CDS Views
       ↓
 OData Service
       ↓
 SAPUI5 Dashboard
```

---

# 1. ZC_SP360_VENDOR_RISK

## Purpose

`ZC_SP360_VENDOR_RISK` provides a reporting-friendly vendor risk dataset.

It reads vendor master and calculated risk information from:

```text
ZSP360_VENDOR
```

and exposes the fields required by the SmartProcure360 risk dashboard.

## Technical Details

**CDS View:** `ZC_SP360_VENDOR_RISK`

**SQL View:** `ZSP360VRISK`

**Label:** `SmartProcure360 - Vendor Risk Analytics`

**Authorization Check:**

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
```

## Definition

```abap
@AbapCatalog.sqlViewName: 'ZSP360VRISK'
@AbapCatalog.compiler.compareFilter: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'SmartProcure360 - Vendor Risk Analytics'

define view ZC_SP360_VENDOR_RISK
  as select from zsp360_vendor as v
{
  key v.vendor_id as VendorId,
      v.vendor_name as VendorName,
      v.category as Category,
      v.country as Country,
      v.status as Status,
      v.risk_score as RiskScore,
      v.risk_level as RiskLevel,
      v.created_on as CreatedOn,
      v.created_by as CreatedBy
}
```

## Exposed Fields

| Field | Source | Purpose |
|---|---|---|
| `VendorId` | `ZSP360_VENDOR-VENDOR_ID` | Vendor identifier |
| `VendorName` | `ZSP360_VENDOR-VENDOR_NAME` | Vendor name |
| `Category` | `ZSP360_VENDOR-CATEGORY` | Vendor category |
| `Country` | `ZSP360_VENDOR-COUNTRY` | Vendor country |
| `Status` | `ZSP360_VENDOR-STATUS` | Vendor status |
| `RiskScore` | `ZSP360_VENDOR-RISK_SCORE` | Calculated risk score |
| `RiskLevel` | `ZSP360_VENDOR-RISK_LEVEL` | LOW/MEDIUM/HIGH/CRITICAL |
| `CreatedOn` | `ZSP360_VENDOR-CREATED_ON` | Creation date |
| `CreatedBy` | `ZSP360_VENDOR-CREATED_BY` | Creator |

## UI Usage

This CDS view feeds:

```text
VendorRiskSet
```

through the SmartProcure360 OData service.

The SAPUI5 dashboard uses this information for:

- Vendor Risk Overview
- Risk Summary
- Vendor search
- Risk-level filtering
- Vendor details
- Risk analytics

---

# 2. ZC_SP360_PO_ANALYTICS

## Purpose

`ZC_SP360_PO_ANALYTICS` provides purchase-order reporting data by combining purchase-order information with vendor information.

## Technical Details

**CDS View:** `ZC_SP360_PO_ANALYTICS`

**SQL View:** `ZSP360POANLY`

## Data Sources

Primary tables:

```text
ZSP360_PO
ZSP360_VENDOR
```

The relationship is based on:

```text
ZSP360_PO-VENDOR_ID
        ↓
ZSP360_VENDOR-VENDOR_ID
```

## Exposed Fields

| Field | Purpose |
|---|---|
| `PurchaseOrderId` | Purchase-order identifier |
| `PurchaseRequisitionId` | Related PR identifier |
| `VendorId` | Vendor identifier |
| `VendorName` | Vendor name |
| `VendorCategory` | Vendor category |
| `OrderDate` | PO creation/order date |
| `ExpectedDate` | Expected delivery date |
| `ActualDate` | Actual delivery date |
| `TotalAmount` | PO total amount |
| `Currency` | Transaction currency |
| `POStatus` | PO processing status |

## UI Usage

The view is exposed through:

```text
POAnalyticsSet
```

The SAPUI5 application uses this data for:

- Total PO count
- Total PO amount
- Delivered PO count
- Delayed PO count
- Purchase Order Analytics table

---

# 3. ZC_SP360_DELIVERY_ANALYTICS

## Purpose

`ZC_SP360_DELIVERY_ANALYTICS` provides delivery-performance analytics by connecting delivery records with their purchase orders and vendors.

## Technical Details

**CDS View:** `ZC_SP360_DELIVERY_ANALYTICS`

**SQL View:** `ZSP360DELANLY`

## Data Sources

The analytical relationship is:

```text
ZSP360_DELIVERY
        ↓
ZSP360_PO
        ↓
ZSP360_VENDOR
```

Primary relationships:

```text
DELIVERY-PO_ID → PO-PO_ID
PO-VENDOR_ID   → VENDOR-VENDOR_ID
```

## Exposed Fields

| Field | Purpose |
|---|---|
| `DeliveryId` | Delivery identifier |
| `PurchaseOrderId` | Related PO |
| `ItemNo` | PO item number |
| `VendorId` | Vendor identifier |
| `VendorName` | Vendor name |
| `VendorCategory` | Vendor category |
| `ExpectedDate` | Expected delivery date |
| `DeliveryDate` | Actual delivery date |
| `DeliveredQuantity` | Delivered quantity |
| `DeliveryStatus` | Delivery status |
| `DelayDays` | Number of delayed days |

## UI Usage

The view is exposed through:

```text
DeliveryAnlySet
```

The UI calculates and displays:

- Total deliveries
- Delivered deliveries
- Pending deliveries
- Delayed deliveries
- Total delay days
- Detailed delivery records

---

# 4. ZC_SP360_PROCUREMENT_OVERVIEW

## Purpose

`ZC_SP360_PROCUREMENT_OVERVIEW` combines purchase-order and vendor-risk information into a single procurement-management dataset.

It is intended for management-level monitoring where procurement activity and vendor risk need to be viewed together.

## Technical Details

**CDS View:** `ZC_SP360_PROCUREMENT_OVERVIEW`

**SQL View:** `ZSP360PROV`

## Data Sources

```text
ZSP360_PO
    ↓
ZSP360_VENDOR
```

The vendor relationship is:

```text
PO-VENDOR_ID → VENDOR-VENDOR_ID
```

## Exposed Fields

| Field | Purpose |
|---|---|
| `PurchaseOrderId` | Purchase-order identifier |
| `PurchaseRequisitionId` | Related PR identifier |
| `VendorId` | Vendor identifier |
| `VendorName` | Vendor name |
| `VendorCategory` | Vendor category |
| `RiskScore` | Current vendor risk score |
| `RiskLevel` | Current vendor risk level |
| `OrderDate` | PO order date |
| `ExpectedDate` | Expected delivery date |
| `ActualDate` | Actual delivery date |
| `TotalAmount` | PO amount |
| `Currency` | Currency |
| `POStatus` | PO status |

## UI Usage

The view is exposed through:

```text
ProcOverviewSet
```

The SAPUI5 application uses it to calculate/display:

- Total POs
- Total PO amount
- Low-risk POs
- High-risk POs
- Delayed POs
- Procurement overview records

---

# 5. CDS Architecture

The four views provide separate analytical responsibilities.

```text
                    SAP Custom Tables
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
      Vendor/Risk       PO Data         Delivery Data
          │                │                │
          ▼                ▼                ▼
 ZC_SP360_VENDOR_RISK  ZC_SP360_PO_ANALYTICS
                                      │
                                      ▼
                         ZC_SP360_DELIVERY_ANALYTICS

             PO + Vendor + Risk
                    │
                    ▼
       ZC_SP360_PROCUREMENT_OVERVIEW
                    │
                    ▼
              OData Service
                    │
                    ▼
             SAPUI5 Dashboard
```

---

# 6. Why CDS Is Used

The CDS layer provides a reusable semantic/analytical layer between database storage and application consumption.

Benefits in SmartProcure360 include:

- Reusable data models
- Cleaner OData implementation
- Reduced repeated join logic
- Centralized analytical datasets
- Better separation of database and UI concerns
- Easier reporting integration
- Clear relationship between business entities

Instead of performing every join directly in the OData implementation, the application can consume predefined CDS datasets.

---

# 7. CDS and OData Integration

The OData data-provider implementation reads the CDS views using Open SQL.

Examples:

```abap
SELECT *
  FROM zc_sp360_vendor_risk
  INTO TABLE @lt_vendor_risk.
```

```abap
SELECT *
  FROM zc_sp360_po_analytics
  INTO TABLE @lt_po.
```

The resulting internal tables are mapped to the generated OData entity sets.

Relevant mappings:

| CDS View | OData Entity Set |
|---|---|
| `ZC_SP360_VENDOR_RISK` | `VendorRiskSet` |
| `ZC_SP360_PO_ANALYTICS` | `POAnalyticsSet` |
| `ZC_SP360_DELIVERY_ANALYTICS` | `DeliveryAnlySet` |
| `ZC_SP360_PROCUREMENT_OVERVIEW` | `ProcOverviewSet` |

---

# 8. CDS and SAPUI5 Integration

The final application flow is:

```text
SAP Database Tables
       ↓
CDS Analytical Views
       ↓
ABAP OData Data Provider
       ↓
ZSP360_ODATA_SRV
       ↓
SAPUI5 ODataModel
       ↓
JSON Models
       ↓
Dashboard / Tables / Analytics
```

The UI5 controller loads the entity sets using the OData V2 model.

Example:

```javascript
oModel.read("/POAnalyticsSet", {
    success: function (oData) {
        // Process analytics data
    }
});
```

---

# 9. Current Demo Analytics

The CDS/OData/UI integration is validated against the SmartProcure360 demo dataset.

## Purchase Orders

Current demo analytics:

```text
Total POs       = 3
Total PO Amount = 36,500 USD
Delivered       = 1
Delayed         = 1
```

## Deliveries

Current demo analytics:

```text
Total Deliveries = 3
Delivered        = 1
Pending          = 1
Delayed          = 1
Delay Days       = 5
```

## Procurement Overview

Current demo data includes:

```text
PO100000001 → Alpha Components     → LOW
PO100000002 → Beta Manufacturing   → MEDIUM
PO100000003 → CycleTech Supplies   → HIGH
```

This allows the dashboard to demonstrate the relationship between procurement transactions and vendor risk.

---

# 10. Development and Testing

CDS views can be inspected in:

```text
Eclipse / ABAP Development Tools
```

The views can also be validated through the OData service.

Example service:

```text
ZSP360_ODATA_SRV
```

Relevant endpoints:

```text
VendorRiskSet
POAnalyticsSet
DeliveryAnlySet
ProcOverviewSet
```

For local UI5 testing, the service is accessed through the configured `/sap` proxy.

---

# 11. Related SAP Objects

## Database Tables

```text
ZSP360_VENDOR
ZSP360_PO
ZSP360_PO_ITEM
ZSP360_DELIVERY
```

## ABAP Classes

```text
ZCL_SP360_RISK_ENGINE
ZCL_ZSP360_ODATA_DPC_EXT
```

## OData Service

```text
ZSP360_ODATA_SRV
```

## UI5 Application

```text
SmartProcure360
```

---

# 12. Technical Notes

## Naming Convention

The project uses:

```text
ZC_SP360_*
```

for CDS views.

The `ZC` prefix represents a custom CDS view naming convention used for the SmartProcure360 application layer.

## SQL View Names

Classic CDS SQL view names are used for the ABAP Platform 1809 environment:

```text
ZSP360VRISK
ZSP360POANLY
ZSP360DELANLY
ZSP360PROV
```

This matches the project's SAP S/4HANA 1809 development environment.

## Authorization

The current CDS views use:

```abap
@AccessControl.authorizationCheck: #NOT_REQUIRED
```

This is suitable for the controlled project/demo environment.

For a production implementation, CDS access control/DCL and backend authorization objects should be evaluated according to organizational security requirements.

---

# 13. Interview-Relevant Technical Explanation

A concise interview explanation is:

> "I created CDS views to separate analytical data modeling from the transactional tables. The views combine vendor, purchase-order, delivery, and risk information and are consumed by the custom OData service. This keeps the UI and OData layer simpler while providing reusable analytical datasets."

Key concepts demonstrated:

- ABAP CDS
- SQL view naming
- CDS annotations
- Database joins
- Analytical data modeling
- OData integration
- SAPUI5 consumption
- Separation of concerns
- SAP S/4HANA 1809 compatibility

---

# 14. Phase 12.1F Status

This documentation covers:

- All SmartProcure360 CDS views
- SQL view names
- Source tables
- Relationships
- Exposed fields
- OData mappings
- SAPUI5 integration
- Analytics examples
- Authorization notes
- Technical/interview relevance

This file belongs in:

```text
SmartProcure360/
└── sap/
    └── cds/
        └── README.md
```

