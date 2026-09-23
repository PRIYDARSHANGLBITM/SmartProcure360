# SmartProcure360 – SAP OData Documentation

This folder documents the custom SAP Gateway OData service used by SmartProcure360 to expose procurement, vendor-risk, analytics, approval, alert, and audit information to the SAPUI5 frontend.

## OData Overview

| Object | Technical Name |
|---|---|
| SEGW Project | `ZSP360_ODATA` |
| OData Service | `ZSP360_ODATA_SRV` |
| Version | `0001` |
| Data Provider Extension | `ZCL_ZSP360_ODATA_DPC_EXT` |
| Package | `ZSP360` |
| System Alias | `LOCAL` |

The service provides the integration layer between the SAP backend and the SmartProcure360 SAPUI5 application.

```text
SAP Tables / CDS Views
          ↓
ABAP DPC Extension
          ↓
ZSP360_ODATA_SRV
          ↓
SAPUI5 ODataModel
          ↓
SmartProcure360 Dashboard
```

---

# 1. SEGW Project

## Project Name

```text
ZSP360_ODATA
```

**Description:**

```text
SmartProcure360 OData Service
```

**Package:**

```text
ZSP360
```

The SEGW project defines the service metadata, entity types, entity sets, properties, keys, and generated runtime objects.

---

# 2. OData Service

## Technical Service Name

```text
ZSP360_ODATA_SRV
```

## Service Version

```text
0001
```

The service is registered in:

```text
/IWFND/MAINT_SERVICE
```

with:

```text
System Alias = LOCAL
```

The ICF service is activated for Gateway access.

---

# 3. Entity Types and Entity Sets

The current SmartProcure360 service exposes the following entity types and sets:

| Entity Type | Entity Set | Business Purpose |
|---|---|---|
| `VendorRisk` | `VendorRiskSet` | Vendor risk information |
| `Alert` | `AlertSet` | Smart alerts |
| `Audit` | `AuditSet` | Audit history |
| `Approval` | `ApprovalSet` | Approval workflow |
| `POAnalytics` | `POAnalyticsSet` | Purchase-order analytics |
| `ProcOverview` | `ProcOverviewSet` | Procurement overview |
| `DeliveryAnalytics` | `DeliveryAnlySet` | Delivery analytics |
| `PurchaseRequisition` | `PRSet` | Purchase requisition management |

---

# 4. VendorRiskSet

## Purpose

`VendorRiskSet` exposes vendor and risk information to the frontend.

Primary backend sources:

```text
ZSP360_VENDOR
ZSP360_RISK
ZC_SP360_VENDOR_RISK
```

The entity is primarily used for:

- Vendor Risk Overview
- Risk Summary
- Vendor search
- Risk filtering
- Vendor details
- Risk analytics
- Management action display

## GET Entity Set

Endpoint pattern:

```text
/VendorRiskSet
```

Implemented by:

```text
VENDORRISKSET_GET_ENTITYSET
```

The current implementation reads:

```text
ZC_SP360_VENDOR_RISK
```

and maps the result to the generated OData entity set.

## GET Single Entity

Endpoint pattern:

```text
/VendorRiskSet('V100000003')
```

Implemented by:

```text
VENDORRISKSET_GET_ENTITY
```

The vendor key is read from the OData key table and the corresponding risk record is selected from:

```text
ZSP360_RISK
```

---

# 5. AlertSet

## Purpose

`AlertSet` exposes SmartProcure360 alerts.

Backend table:

```text
ZSP360_ALERT
```

Typical alert information includes:

- Alert ID
- Vendor ID
- Alert type
- Severity
- Status
- Message

## GET Entity Set

Endpoint:

```text
/AlertSet
```

Implemented by:

```text
ALERTSET_GET_ENTITYSET
```

The implementation reads the alert table and maps the records into the generated OData entity structure.

## Example Business Scenario

A high-risk vendor can generate an alert such as:

```text
Vendor CycleTech Supplies has HIGH risk level.
Manager review required.
```

The UI displays these records in the Smart Alerts section.

---

# 6. AuditSet

## Purpose

`AuditSet` exposes the application audit history.

Backend table:

```text
ZSP360_AUDIT
```

The audit log records business events such as:

```text
CREATED
APPROVED
DELAY_DETECTED
```

## GET Entity Set

Endpoint:

```text
/AuditSet
```

Implemented by:

```text
AUDITSET_GET_ENTITYSET
```

## GET Single Entity

Endpoint pattern:

```text
/AuditSet('AUD10000001')
```

Implemented by:

```text
AUDITSET_GET_ENTITY
```

The implementation validates the `AuditId` key and returns the corresponding audit record.

## UI Usage

The SAPUI5 application displays:

- Audit ID
- Object type
- Object ID
- Action
- Changed by
- Changed on
- Changed at
- Old value
- New value

The OData V2 `Edm.Time` value is formatted in the UI controller for display as:

```text
HH:MM:SS
```

---

# 7. ApprovalSet

## Purpose

`ApprovalSet` provides the vendor-risk approval workflow API.

Backend table:

```text
ZSP360_APPROVAL
```

The service supports:

- Reading approval records
- Creating approval requests
- Updating approval decisions
- Reading a single approval record

## GET Entity Set

Endpoint:

```text
/ApprovalSet
```

Implemented by:

```text
APPROVALSET_GET_ENTITYSET
```

## GET Single Entity

Endpoint pattern:

```text
/ApprovalSet('<ApprovalId>')
```

Implemented by:

```text
APPROVALSET_GET_ENTITY
```

## CREATE

Endpoint:

```text
POST /ApprovalSet
```

Implemented by:

```text
APPROVALSET_CREATE_ENTITY
```

The implementation:

1. Reads incoming OData data.
2. Sets the SAP client.
3. Generates an approval ID when required.
4. Sets default document type.
5. Sets the approver.
6. Sets approval level.
7. Initializes the decision as `PENDING`.
8. Sets the decision date.
9. Sets default comments when required.
10. Inserts the record into `ZSP360_APPROVAL`.
11. Returns the created entity.

## UPDATE

Endpoint pattern:

```text
PUT /ApprovalSet('<ApprovalId>')
```

Implemented by:

```text
APPROVALSET_UPDATE_ENTITY
```

The implementation:

1. Reads the approval key.
2. Validates that the approval exists.
3. Reads the incoming data.
4. Updates the decision.
5. Updates the decision date.
6. Updates comments when supplied.
7. Ensures the approver is available.
8. Updates `ZSP360_APPROVAL`.
9. Returns the updated entity.

This supports the UI actions:

```text
Mark for Review
Approve
Reject
```

---

# 8. POAnalyticsSet

## Purpose

`POAnalyticsSet` provides purchase-order analytical data.

Source CDS view:

```text
ZC_SP360_PO_ANALYTICS
```

## GET Entity Set

Endpoint:

```text
/POAnalyticsSet
```

Implemented by:

```text
POANALYTICSSET_GET_ENTITYSET
```

The DPC extension selects from the CDS view and maps the result into the OData response.

## UI Metrics

The frontend derives:

```text
Total POs
Total PO Amount
Delivered POs
Delayed POs
```

## Current Demo Result

```text
Total POs       = 3
Total PO Amount = 36,500 USD
Delivered       = 1
Delayed         = 1
```

---

# 9. ProcOverviewSet

## Purpose

`ProcOverviewSet` combines procurement and vendor-risk information.

Source CDS view:

```text
ZC_SP360_PROCUREMENT_OVERVIEW
```

Endpoint:

```text
/ProcOverviewSet
```

The data includes:

- PO ID
- PR ID
- Vendor ID
- Vendor name
- Vendor category
- Risk score
- Risk level
- Order date
- Expected date
- Actual date
- Amount
- Currency
- PO status

## Current Demo Records

```text
PO100000001 → Alpha Components   → LOW
PO100000002 → Beta Manufacturing → MEDIUM
PO100000003 → CycleTech Supplies → HIGH
```

The frontend calculates procurement overview KPIs from this entity set.

---

# 10. DeliveryAnlySet

## Purpose

`DeliveryAnlySet` exposes delivery-performance analytics.

Source CDS view:

```text
ZC_SP360_DELIVERY_ANALYTICS
```

Endpoint:

```text
/DeliveryAnlySet
```

The entity includes:

- Delivery ID
- PO ID
- Item number
- Vendor ID
- Vendor name
- Vendor category
- Expected date
- Delivery date
- Quantity
- Delay days
- Delivery status

## Current Demo Result

```text
Total Deliveries = 3
Delivered        = 1
Pending          = 1
Delayed          = 1
Total Delay Days = 5
```

---

# 11. PRSet

## Purpose

`PRSet` exposes purchase requisition data.

Backend table:

```text
ZSP360_PR
```

## Key

The OData entity uses:

```text
PR_ID
```

as the entity key.

This is important because an OData entity must have a key defined in the metadata.

## Endpoint

```text
/PRSet
```

## Exposed Business Data

The PR entity contains:

```text
PR_ID
REQUESTER
DEPARTMENT
PRIORITY
REQUEST_DATE
REQUIRED_DATE
TOTAL_AMOUNT
CURRENCY
STATUS
```

## Current Demo Result

The test dataset contains:

```text
Total PRs        = 5
Total PR Amount  = 43,800 USD
Approved         = 2
Submitted        = 1
Draft            = 1
```

The fifth record is represented by another workflow state such as `CONVERTED_TO_PO`.

---

# 12. OData Metadata

The service metadata can be inspected through:

```text
/sap/opu/odata/sap/ZSP360_ODATA_SRV/$metadata
```

For local UI5 development:

```text
http://localhost:8080/sap/opu/odata/sap/ZSP360_ODATA_SRV/$metadata
```

The metadata describes:

- Entity types
- Entity sets
- Properties
- Data types
- Keys
- Nullability
- Navigation metadata where applicable

A successful metadata response confirms that the Gateway service is reachable and its service model is available.

---

# 13. Data Provider Extension

## Class

```text
ZCL_ZSP360_ODATA_DPC_EXT
```

The class inherits from the generated data provider class:

```text
ZCL_ZSP360_ODATA_DPC
```

The extension class contains custom business logic without modifying the generated base implementation.

This follows the standard Gateway extension pattern.

## Implemented Methods

Current custom implementations include:

```text
APPROVALSET_CREATE_ENTITY
APPROVALSET_GET_ENTITY
APPROVALSET_GET_ENTITYSET
APPROVALSET_UPDATE_ENTITY

VENDORRISKSET_GET_ENTITY
VENDORRISKSET_GET_ENTITYSET

ALERTSET_GET_ENTITYSET

AUDITSET_GET_ENTITY
AUDITSET_GET_ENTITYSET

POANALYTICSSET_GET_ENTITYSET
```

---

# 14. OData Method Pattern

The project follows the standard Gateway naming pattern:

```text
<EntitySet>_<Operation>
```

Examples:

```text
VENDORRISKSET_GET_ENTITYSET
VENDORRISKSET_GET_ENTITY

APPROVALSET_GET_ENTITYSET
APPROVALSET_GET_ENTITY
APPROVALSET_CREATE_ENTITY
APPROVALSET_UPDATE_ENTITY

AUDITSET_GET_ENTITYSET
AUDITSET_GET_ENTITY

POANALYTICSSET_GET_ENTITYSET
```

This keeps the custom implementation aligned with SAP Gateway runtime conventions.

---

# 15. Backend-to-OData Mapping

| OData Entity Set | Backend Source | DPC Method |
|---|---|---|
| `VendorRiskSet` | `ZC_SP360_VENDOR_RISK` / risk table | `VENDORRISKSET_GET_ENTITYSET` |
| `AlertSet` | `ZSP360_ALERT` | `ALERTSET_GET_ENTITYSET` |
| `AuditSet` | `ZSP360_AUDIT` | `AUDITSET_GET_ENTITYSET` |
| `ApprovalSet` | `ZSP360_APPROVAL` | Approval CRUD methods |
| `POAnalyticsSet` | `ZC_SP360_PO_ANALYTICS` | `POANALYTICSSET_GET_ENTITYSET` |
| `ProcOverviewSet` | `ZC_SP360_PROCUREMENT_OVERVIEW` | Generated/runtime mapping |
| `DeliveryAnlySet` | `ZC_SP360_DELIVERY_ANALYTICS` | Generated/runtime mapping |
| `PRSet` | `ZSP360_PR` | Generated/runtime mapping |

---

# 16. SAP Gateway Registration

The service is registered using:

```text
/IWFND/MAINT_SERVICE
```

The configured service is:

```text
ZSP360_ODATA_SRV
```

System alias:

```text
LOCAL
```

The service is assigned to package:

```text
ZSP360
```

The ICF node must be active for Gateway requests to reach the service.

---

# 17. Cache Management

During OData development, metadata and service-model caches can cause old definitions or generated metadata to remain visible.

The project uses the following Gateway cache cleanup transactions when required:

```text
/IWFND/CACHE_CLEANUP
/IWBEP/CACHE_CLEANUP
```

Typical sequence after a service-model change:

```text
SEGW
 ↓
Regenerate Runtime Objects
 ↓
Activate Objects
 ↓
Gateway Cache Cleanup
 ↓
Test $metadata
 ↓
Test Entity Set
```

---

# 18. OData Testing

The service can be tested independently of the UI.

## Metadata

```text
http://localhost:8080/sap/opu/odata/sap/ZSP360_ODATA_SRV/$metadata
```

## Vendor Risk

```text
http://localhost:8080/sap/opu/odata/sap/ZSP360_ODATA_SRV/VendorRiskSet
```

## Alerts

```text
http://localhost:8080/sap/opu/odata/sap/ZSP360_ODATA_SRV/AlertSet
```

## Audit

```text
http://localhost:8080/sap/opu/odata/sap/ZSP360_ODATA_SRV/AuditSet
```

## Approvals

```text
http://localhost:8080/sap/opu/odata/sap/ZSP360_ODATA_SRV/ApprovalSet
```

## Purchase Orders

```text
http://localhost:8080/sap/opu/odata/sap/ZSP360_ODATA_SRV/POAnalyticsSet
```

## Procurement Overview

```text
http://localhost:8080/sap/opu/odata/sap/ZSP360_ODATA_SRV/ProcOverviewSet
```

## Delivery Analytics

```text
http://localhost:8080/sap/opu/odata/sap/ZSP360_ODATA_SRV/DeliveryAnlySet
```

## Purchase Requisitions

```text
http://localhost:8080/sap/opu/odata/sap/ZSP360_ODATA_SRV/PRSet
```

These local URLs use the UI5 development proxy configured for the project.

---

# 19. SAPUI5 Integration

The frontend uses an OData V2 model.

Configured service URL:

```javascript
"/sap/opu/odata/sap/ZSP360_ODATA_SRV/"
```

The UI5 controller initializes the model and loads the entity sets.

Examples:

```javascript
oModel.read("/VendorRiskSet", {
    success: function (oData) {
        // Vendor risk data
    }
});
```

```javascript
oModel.read("/ApprovalSet", {
    success: function (oData) {
        // Approval data
    }
});
```

```javascript
oModel.read("/AlertSet", {
    success: function (oData) {
        // Alert data
    }
});
```

This allows the same OData service to support multiple dashboard modules.

---

# 20. Approval Workflow API Flow

The approval workflow follows this sequence:

```text
Vendor selected
      ↓
Mark for Review
      ↓
POST ApprovalSet
      ↓
ZSP360_APPROVAL
      ↓
Decision = PENDING
      ↓
Manager action
      ↓
PUT ApprovalSet('<ApprovalId>')
      ↓
Decision = APPROVED / REJECTED
```

The UI then refreshes the approval information and displays the updated review status.

---

# 21. OData Error Handling

The DPC extension uses Gateway business exceptions for controlled backend errors.

Example pattern:

```abap
RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
  EXPORTING
    message = 'Approval record could not be updated'.
```

The UI controller also contains an OData error-message helper so that backend errors can be presented to the user in a readable form.

This prevents raw Gateway errors from becoming the only user-facing feedback.

---

# 22. Important OData Development Lessons

During SmartProcure360 development, several common Gateway issues were handled.

## Method Not Implemented

Example:

```text
/IWBEP/CM_MGW_RT/021
```

This indicates that a required DPC method has not been implemented.

Resolution:

```text
SEGW
 ↓
Generate Runtime Objects
 ↓
Redefine required DPC_EXT method
 ↓
Implement Open SQL / mapping
 ↓
Activate
```

## Resource Not Found

A resource-not-found response can result from:

- Incorrect entity-set name
- Entity not included in the service model
- Runtime objects not regenerated
- Incorrect service URL
- Metadata/cache mismatch

Validation should start with:

```text
$metadata
```

before debugging the UI.

## Internal Server Error

For a 500 response:

1. Test the entity set directly.
2. Check DPC implementation.
3. Verify table/CDS fields.
4. Check generated entity properties.
5. Check Gateway error logs.
6. Clean Gateway caches if the model was changed.
7. Retest `$metadata`.

---

# 23. OData Development Workflow

Recommended workflow for this project:

```text
1. Define entity in SEGW
2. Define properties
3. Define key
4. Create entity set
5. Generate runtime objects
6. Redefine DPC_EXT method
7. Implement backend logic
8. Activate
9. Register service
10. Clean Gateway cache if required
11. Test $metadata
12. Test entity set directly
13. Connect UI5
14. Perform end-to-end test
```

This approach helps isolate backend service issues before frontend debugging.

---

# 24. Security Notes

The local UI5 project uses environment variables for SAP credentials.

The credentials are not part of the OData documentation or source repository.

The repository uses:

```text
.env
```

and this file is excluded through `.gitignore`.

For production systems, additional security controls should be applied, including:

- SAP authorization roles
- Gateway service authorization
- HTTPS
- Secure credential handling
- Proper authentication
- Least-privilege access
- CDS/DCL authorization where appropriate
- Audit monitoring

The current project configuration is intended for a controlled development/demo environment.

---

# 25. Technical Architecture

```text
                    SAP S/4HANA 1809
                           │
             ┌─────────────┴─────────────┐
             │                           │
       Custom Tables                 CDS Views
             │                           │
             └─────────────┬─────────────┘
                           │
                 ZCL_ZSP360_ODATA_DPC_EXT
                           │
                    ZSP360_ODATA_SRV
                           │
                 SAP Gateway / ICF
                           │
                    UI5 Proxy / HTTP
                           │
                  SAPUI5 ODataModel
                           │
                  SmartProcure360 UI
```

---

# 26. Interview-Relevant Explanation

A concise interview explanation is:

> "I created a custom SAP Gateway OData service using SEGW for SmartProcure360. The service exposes vendor risk, procurement analytics, delivery analytics, purchase requisitions, approvals, alerts, and audit data. I implemented the required DPC extension methods using Open SQL and CDS views, registered the service in `/IWFND/MAINT_SERVICE`, and consumed the service from a SAPUI5 OData V2 model."

Important concepts demonstrated:

- SAP Gateway
- SEGW
- OData V2
- Entity types
- Entity sets
- DPC/DPC_EXT
- CRUD operations
- Open SQL
- CDS integration
- Gateway service registration
- Metadata testing
- SAPUI5 ODataModel
- Error handling
- Approval workflow integration

---

# 27. Phase 12.1G Status

This documentation covers:

- SEGW project
- OData service
- All current entity sets
- DPC extension methods
- CRUD implementation
- CDS/table mappings
- Approval workflow API
- Alert and audit APIs
- OData testing
- Metadata
- Gateway registration
- Cache management
- UI5 integration
- Error handling
- Security considerations
- Interview explanation

File location:

```text
SmartProcure360/
└── sap/
    └── odata/
        └── README.md
```
