sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    JSONModel,
    ODataModel,
    MessageToast,
    MessageBox
) {

    "use strict";

    return Controller.extend("smartprocure360.controller.App", {

        /* =================================================
         * INIT
         * ================================================= */

        onInit: function () {

            var sServiceUrl =
                "/sap/opu/odata/sap/ZSP360_ODATA_SRV/";

            console.log("=================================");
            console.log("SmartProcure360 OData Service");
            console.log(sServiceUrl);
            console.log("=================================");

            var oODataModel = new ODataModel(
                sServiceUrl,
                {
                    json: true,
                    useBatch: false,
                    withCredentials: true,
                    refreshAfterChange: true
                }
            );

            this.getView().setModel(oODataModel);


            /* =================================================
             * Dashboard Model
             * ================================================= */

            this.getView().setModel(
                new JSONModel({
                    totalVendors: 0,
                    lowRisk: 0,
                    mediumRisk: 0,
                    highRisk: 0,
                    criticalRisk: 0
                }),
                "dashboard"
            );


            /* =================================================
             * Analytics Model
             * ================================================= */

            this.getView().setModel(
                new JSONModel({
                    averageRiskScore: "0.00",
                    lowPercentage: 0,
                    mediumPercentage: 0,
                    highPercentage: 0,
                    criticalPercentage: 0,
                    riskStatusText:
                        "No vendor risk data available."
                }),
                "analytics"
            );


            /* =================================================
             * Vendor Model
             * ================================================= */

            this.getView().setModel(
                new JSONModel({
                    VendorRiskSet: []
                }),
                "vendor"
            );

            this.getView().setModel(
    new JSONModel({
        POAnalyticsSet: [],
        totalPOs: 0,
        totalAmount: 0,
        deliveredPOs: 0,
        delayedPOs: 0
    }),
    "poAnalytics"
);

this.getView().setModel(
    new JSONModel({
        PRSet: [],
        totalPRs: 0,
        totalAmount: 0,
        approvedPRs: 0,
        submittedPRs: 0,
        draftPRs: 0
    }),
    "prAnalytics"
);

this.getView().setModel(
    new JSONModel({
        ProcOverviewSet: [],
        totalPOs: 0,
        totalAmount: 0,
        lowRiskPOs: 0,
        highRiskPOs: 0,
        delayedPOs: 0
    }),
    "procOverview"
);
this.getView().setModel(
    new JSONModel({
        DeliveryAnlySet: [],
        totalDeliveries: 0,
        deliveredDeliveries: 0,
        pendingDeliveries: 0,
        delayedDeliveries: 0,
        totalDelayDays: 0
    }),
    "deliveryAnalytics"
);



            /* =================================================
 * Smart Alerts Model
 * ================================================= */

this.getView().setModel(
    new JSONModel({
        AlertSet: [],
        totalAlerts: 0,
        openAlerts: 0,
        highAlerts: 0,
        criticalAlerts: 0
    }),
    "alerts"
);

this.getView().setModel(
    new JSONModel({
        AuditSet: [],
        totalAudit: 0
    }),
    "audit"
);


            /* =================================================
             * Selected Vendor Model
             * ================================================= */

            this.getView().setModel(
                new JSONModel({

                    VendorId: "",
                    VendorName: "",
                    Category: "",
                    Country: "",
                    Status: "",

                    RiskScore: "",
                    RiskLevel: "",

                    Assessment: "",
                    Recommendation: "",
                    ManagementAction: "",

                    ReviewStatus: "NOT REVIEWED",

                    ApprovalId: "",
                    ApprovalDecision: ""

                }),
                "selectedVendor"
            );


            /* =================================================
             * Approval Cache
             *
             * IMPORTANT:
             * These are rebuilt from SAP ApprovalSet.
             * They are NOT treated as the source of truth.
             * ================================================= */

            this._oReviewStatus = {};
            this._oApprovalIds = {};
            this._oApprovalDecisions = {};
            this._oApprovalRecords = {};

            this._aAllVendors = [];
            this._aAllApprovals = [];


            /* =================================================
             * Load SAP Data
             * ================================================= */

            this.loadVendorData();

            this.loadApprovalData();

            this.loadAlertData();

            this.loadAuditData();
            this.loadPOAnalytics();
            this.loadPRData();
            this.loadProcurementOverview();
            this.loadDeliveryAnalytics();
        },


        /* =================================================
         * LOAD VENDOR DATA
         * ================================================= */

        loadVendorData: function () {

            var oModel =
                this.getView().getModel();

            if (!oModel) {

                MessageBox.error(
                    "SAP OData model could not be initialized."
                );

                return;
            }

            var that = this;

            this.getView().setBusy(true);


            oModel.read(
                "/VendorRiskSet",
                {

                    success: function (oData) {

                        that.getView().setBusy(false);

                        var aVendors =
                            oData.results || [];

                        that._aAllVendors =
                            aVendors.slice();


                        that.getView()
                            .getModel("vendor")
                            .setProperty(
                                "/VendorRiskSet",
                                aVendors
                            );


                        /* =================================================
                         * Calculate Dashboard KPIs
                         * ================================================= */

                        var iLow = 0;
                        var iMedium = 0;
                        var iHigh = 0;
                        var iCritical = 0;

                        var fTotalRiskScore = 0;


                        aVendors.forEach(
                            function (oVendor) {

                                var sRiskLevel =
                                    String(
                                        oVendor.RiskLevel || ""
                                    ).toUpperCase();


                                switch (sRiskLevel) {

                                    case "LOW":
                                        iLow++;
                                        break;

                                    case "MEDIUM":
                                        iMedium++;
                                        break;

                                    case "HIGH":
                                        iHigh++;
                                        break;

                                    case "CRITICAL":
                                        iCritical++;
                                        break;

                                }


                                var fRiskScore =
                                    parseFloat(
                                        oVendor.RiskScore
                                    );


                                if (!isNaN(fRiskScore)) {

                                    fTotalRiskScore +=
                                        fRiskScore;
                                }

                            }
                        );


                        var iTotal =
                            aVendors.length;


                        var fAverageRiskScore =
                            iTotal > 0
                                ? fTotalRiskScore / iTotal
                                : 0;


                        var fLowPercentage = 0;
                        var fMediumPercentage = 0;
                        var fHighPercentage = 0;
                        var fCriticalPercentage = 0;


                        if (iTotal > 0) {

                            fLowPercentage =
                                (iLow / iTotal) * 100;

                            fMediumPercentage =
                                (iMedium / iTotal) * 100;

                            fHighPercentage =
                                (iHigh / iTotal) * 100;

                            fCriticalPercentage =
                                (iCritical / iTotal) * 100;
                        }


                        that.getView()
                            .getModel("dashboard")
                            .setData({

                                totalVendors:
                                    iTotal,

                                lowRisk:
                                    iLow,

                                mediumRisk:
                                    iMedium,

                                highRisk:
                                    iHigh,

                                criticalRisk:
                                    iCritical

                            });


                        var sRiskStatusText;


                        if (iCritical > 0) {

                            sRiskStatusText =
                                iCritical +
                                " critical-risk vendor(s) require close attention.";

                        } else if (iHigh > 0) {

                            sRiskStatusText =
                                iHigh +
                                " high-risk vendor(s) require management review.";

                        } else {

                            sRiskStatusText =
                                "No high or critical-risk vendors detected.";
                        }


                        that.getView()
                            .getModel("analytics")
                            .setData({

                                averageRiskScore:
                                    fAverageRiskScore.toFixed(2),

                                lowPercentage:
                                    fLowPercentage.toFixed(1),

                                mediumPercentage:
                                    fMediumPercentage.toFixed(1),

                                highPercentage:
                                    fHighPercentage.toFixed(1),

                                criticalPercentage:
                                    fCriticalPercentage.toFixed(1),

                                riskStatusText:
                                    sRiskStatusText

                            });


                        console.log(
                            "VendorRiskSet loaded successfully:",
                            aVendors
                        );


                        MessageToast.show(
                            aVendors.length +
                            " vendor records loaded from SAP."
                        );
                    },


                    error: function (oError) {

                        that.getView().setBusy(false);

                        console.error(
                            "SAP OData Error:",
                            oError
                        );


                        MessageBox.error(
                            "SAP OData data could not be loaded.\n\n" +
                            "Service: ZSP360_ODATA_SRV\n" +
                            "Entity Set: VendorRiskSet\n\n" +
                            that.getODataErrorMessage(oError)
                        );
                    }

                }
            );
        },


        /* =================================================
         * LOAD APPROVAL DATA FROM SAP
         *
         * THIS IS NOW THE SOURCE OF TRUTH.
         * ================================================= */

        loadApprovalData: function (
            fnAfterLoad
        ) {

            var oModel =
                this.getView().getModel();


            if (!oModel) {

                console.error(
                    "SAP OData model not available while loading approvals."
                );

                if (fnAfterLoad) {
                    fnAfterLoad(false);
                }

                return;
            }


            var that = this;


            console.log(
                "Loading ApprovalSet from SAP..."
            );


            oModel.read(
                "/ApprovalSet",
                {

                    success: function (oData) {

                        var aApprovals =
                            oData.results || [];


                        that._aAllApprovals =
                            aApprovals.slice();


                        /*
                         * Reset approval cache.
                         */

                        that._oReviewStatus = {};
                        that._oApprovalIds = {};
                        that._oApprovalDecisions = {};
                        that._oApprovalRecords = {};


                        /*
                         * Group vendor approvals.
                         *
                         * For each vendor we select the
                         * latest Approval ID.
                         */

                        aApprovals.forEach(
                            function (oApproval) {

                                var sDocumentType =
                                    String(
                                        oApproval.DocumentType || ""
                                    ).toUpperCase();


                                var sVendorId =
                                    String(
                                        oApproval.DocumentId || ""
                                    );


                                /*
                                 * Only Vendor approval records
                                 * belong to Vendor Risk Workflow.
                                 */

                                if (
                                    sDocumentType !== "VENDOR" ||
                                    !sVendorId
                                ) {

                                    return;
                                }


                                var sApprovalId =
                                    String(
                                        oApproval.ApprovalId || ""
                                    );


                                var oExisting =
                                    that._oApprovalRecords[
                                        sVendorId
                                    ];


                                /*
                                 * Approval IDs generated by backend
                                 * are YYMMDDHHMMSS.
                                 *
                                 * Therefore lexicographical comparison
                                 * gives latest record.
                                 */

                                if (
                                    !oExisting ||
                                    sApprovalId >
                                    String(
                                        oExisting.ApprovalId || ""
                                    )
                                ) {

                                    that._oApprovalRecords[
                                        sVendorId
                                    ] = oApproval;
                                }

                            }
                        );


                        /*
                         * Convert latest approval records
                         * into UI lookup maps.
                         */

                        Object.keys(
                            that._oApprovalRecords
                        ).forEach(
                            function (sVendorId) {

                                var oApproval =
                                    that._oApprovalRecords[
                                        sVendorId
                                    ];


                                var sDecision =
                                    String(
                                        oApproval.Decision || ""
                                    ).toUpperCase();


                                var sStatus =
                                    sDecision || "PENDING";


                                that._oReviewStatus[
                                    sVendorId
                                ] = sStatus;


                                that._oApprovalIds[
                                    sVendorId
                                ] =
                                    oApproval.ApprovalId || "";


                                that._oApprovalDecisions[
                                    sVendorId
                                ] = sStatus;

                            }
                        );


                        console.log(
                            "ApprovalSet loaded successfully from SAP:",
                            aApprovals
                        );


                        console.log(
                            "Latest Vendor Approval Map:",
                            that._oApprovalRecords
                        );


                        /*
                         * If a vendor dialog is currently open,
                         * synchronize it with SAP data.
                         */

                        that.syncSelectedVendorApproval();


                        if (fnAfterLoad) {
                            fnAfterLoad(true);
                        }

                    },


                    error: function (oError) {

                        console.error(
                            "ApprovalSet READ failed:",
                            oError
                        );


                        if (fnAfterLoad) {
                            fnAfterLoad(false);
                        }

                    }

                }
            );
        },

        /* =================================================
         * LOAD SMART ALERTS FROM SAP
         * ================================================= */

        loadAlertData: function () {

            var oModel = this.getView().getModel();

            if (!oModel) {

                console.error(
                    "SAP OData model not available while loading alerts."
                );

                return;
            }

            var that = this;

            console.log(
                "Loading AlertSet from SAP..."
            );

            oModel.read(
                "/AlertSet",
                {

                    success: function (oData) {

                        var aAlerts =
                            oData.results || [];

                        var iTotal =
                            aAlerts.length;

                        var iOpen = 0;
                        var iHigh = 0;
                        var iCritical = 0;

                        aAlerts.forEach(
                            function (oAlert) {

                                var sStatus =
                                    String(
                                        oAlert.Status || ""
                                    ).toUpperCase();

                                var sSeverity =
                                    String(
                                        oAlert.Severity || ""
                                    ).toUpperCase();

                                if (sStatus === "OPEN") {
                                    iOpen++;
                                }

                                if (sSeverity === "HIGH") {
                                    iHigh++;
                                }

                                if (sSeverity === "CRITICAL") {
                                    iCritical++;
                                }
                            }
                        );

                        var oAlertModel =
                            that.getView()
                                .getModel("alerts");

                        if (oAlertModel) {

                            oAlertModel.setData({

                                AlertSet:
                                    aAlerts,

                                totalAlerts:
                                    iTotal,

                                openAlerts:
                                    iOpen,

                                highAlerts:
                                    iHigh,

                                criticalAlerts:
                                    iCritical
                            });
                        }

                        console.log(
                            "AlertSet loaded successfully:",
                            aAlerts
                        );

                        console.log(
                            "Alert statistics:",
                            {
                                total: iTotal,
                                open: iOpen,
                                high: iHigh,
                                critical: iCritical
                            }
                        );
                    },

                    error: function (oError) {

                        console.error(
                            "AlertSet READ failed:",
                            oError
                        );

                    }
                }
            );
        },

        /* =================================================
 * LOAD AUDIT LOG FROM SAP
 * ================================================= */

loadAuditData: function () {

    var oModel = this.getView().getModel();

    if (!oModel) {

        console.error(
            "SAP OData model not available while loading audit log."
        );

        return;
    }

    var that = this;

    console.log(
        "Loading AuditSet from SAP..."
    );

    oModel.read(
        "/AuditSet",
        {

            success: function (oData) {

                var aAudit =
                    oData.results || [];

                var oAuditModel =
                    that.getView()
                        .getModel("audit");

                if (oAuditModel) {

                    oAuditModel.setData({

                        AuditSet:
                            aAudit,

                        totalAudit:
                            aAudit.length

                    });

                }

                console.log(
                    "AuditSet loaded successfully:",
                    aAudit
                );

                console.log(
                    "Total audit records:",
                    aAudit.length
                );
            },

            error: function (oError) {

                console.error(
                    "AuditSet READ failed:",
                    oError
                );

            }
        }
    );
},


loadPOAnalytics: function () {

    var oModel = this.getView().getModel();
    var oPOAnalyticsModel = this.getView().getModel("poAnalytics");

    oModel.read("/POAnalyticsSet", {

        success: function (oData) {

            var aPOs = oData.results || [];

            var fTotalAmount = 0;
            var iDelivered = 0;
            var iDelayed = 0;

            aPOs.forEach(function (oPO) {

                fTotalAmount += parseFloat(oPO.TotalAmount) || 0;

                if (oPO.POStatus === "DELIVERED") {
                    iDelivered++;
                }

                if (oPO.POStatus === "DELAYED") {
                    iDelayed++;
                }

            });

            oPOAnalyticsModel.setData({
                POAnalyticsSet: aPOs,
                totalPOs: aPOs.length,
                totalAmount: fTotalAmount,
                deliveredPOs: iDelivered,
                delayedPOs: iDelayed
            });

        }.bind(this),

        error: function () {

            sap.m.MessageBox.error(
                "Purchase Order Analytics could not be loaded."
            );

        }.bind(this)

    });

},
loadPRData: function () {

    var oODataModel = this.getView().getModel();
    var oPRModel = this.getView().getModel("prAnalytics");

    oODataModel.read("/PRSet", {

        success: function (oData) {

            var aPRs = oData.results || [];

            var iTotalPRs = aPRs.length;
            var fTotalAmount = 0;
            var iApprovedPRs = 0;
            var iSubmittedPRs = 0;
            var iDraftPRs = 0;

            aPRs.forEach(function (oPR) {

                fTotalAmount +=
                    parseFloat(oPR.TOTAL_AMOUNT) || 0;

                var sStatus =
                    String(oPR.STATUS || "").toUpperCase();

                switch (sStatus) {

                    case "APPROVED":
                        iApprovedPRs++;
                        break;

                    case "SUBMITTED":
                        iSubmittedPRs++;
                        break;

                    case "DRAFT":
                        iDraftPRs++;
                        break;

                    default:
                        break;
                }

            });

            oPRModel.setProperty(
                "/PRSet",
                aPRs
            );

            oPRModel.setProperty(
                "/totalPRs",
                iTotalPRs
            );

            oPRModel.setProperty(
                "/totalAmount",
                fTotalAmount.toFixed(2)
            );

            oPRModel.setProperty(
                "/approvedPRs",
                iApprovedPRs
            );

            oPRModel.setProperty(
                "/submittedPRs",
                iSubmittedPRs
            );

            oPRModel.setProperty(
                "/draftPRs",
                iDraftPRs
            );

        },

        error: function (oError) {

            MessageBox.error(
                "Unable to load Purchase Requisition data."
            );

            console.error(
                "PRSet read failed:",
                oError
            );

        }

    });
},

loadProcurementOverview: function () {

    var oModel = this.getView().getModel();
    var oProcOverviewModel =
        this.getView().getModel("procOverview");

    oModel.read("/ProcOverviewSet", {

        success: function (oData) {

            var aData = oData.results || [];

            var fTotalAmount = 0;
            var iLowRisk = 0;
            var iHighRisk = 0;
            var iDelayed = 0;

            aData.forEach(function (oItem) {

                fTotalAmount +=
                    parseFloat(oItem.TotalAmount) || 0;

                var sRisk =
                    String(oItem.RiskLevel || "").toUpperCase();

                if (sRisk === "LOW") {
                    iLowRisk++;
                }

                if (
                    sRisk === "HIGH" ||
                    sRisk === "CRITICAL"
                ) {
                    iHighRisk++;
                }

                if (
                    String(oItem.POStatus || "").toUpperCase()
                    === "DELAYED"
                ) {
                    iDelayed++;
                }

            });

            oProcOverviewModel.setData({

                ProcOverviewSet: aData,

                totalPOs: aData.length,

                totalAmount: fTotalAmount,

                lowRiskPOs: iLowRisk,

                highRiskPOs: iHighRisk,

                delayedPOs: iDelayed

            });

        }.bind(this),

        error: function () {

            sap.m.MessageBox.error(
                "Procurement Overview could not be loaded."
            );

        }.bind(this)

    });

},


/* =================================================
 * DELIVERY ANALYTICS
 * ================================================= */

loadDeliveryAnalytics: function () {

    var oModel = this.getView().getModel();
    var oDeliveryModel =
        this.getView().getModel("deliveryAnalytics");

    oModel.read("/DeliveryAnlySet", {

        success: function (oData) {

            var aDeliveries = oData.results || [];

            var iDelivered = 0;
            var iPending = 0;
            var iDelayed = 0;
            var iTotalDelayDays = 0;

            aDeliveries.forEach(function (oDelivery) {

                var sStatus =
                    String(
                        oDelivery.DeliveryStatus || ""
                    ).toUpperCase();

                var iDelay =
                    parseInt(
                        oDelivery.DelayDays,
                        10
                    ) || 0;

                iTotalDelayDays += iDelay;

                if (sStatus === "DELIVERED") {
                    iDelivered++;
                }

                if (sStatus === "PENDING") {
                    iPending++;
                }

                if (sStatus === "DELAYED") {
                    iDelayed++;
                }

            });

            oDeliveryModel.setData({

                DeliveryAnlySet: aDeliveries,

                totalDeliveries:
                    aDeliveries.length,

                deliveredDeliveries:
                    iDelivered,

                pendingDeliveries:
                    iPending,

                delayedDeliveries:
                    iDelayed,

                totalDelayDays:
                    iTotalDelayDays

            });

        }.bind(this),

        error: function () {

            sap.m.MessageBox.error(
                "Delivery Analytics could not be loaded."
            );

        }.bind(this)

    });

},


        /* =================================================
         * SYNC CURRENT SELECTED VENDOR WITH SAP
         * ================================================= */

        syncSelectedVendorApproval: function () {

            var oSelectedModel =
                this.getView()
                    .getModel("selectedVendor");


            if (!oSelectedModel) {
                return;
            }


            var oVendor =
                oSelectedModel.getData();


            if (!oVendor ||
                !oVendor.VendorId) {

                return;
            }


            var sVendorId =
                oVendor.VendorId;


            var sReviewStatus =
                this.getReviewStatus(
                    sVendorId
                );


            var sApprovalId =
                this.getApprovalId(
                    sVendorId
                );


            var sApprovalDecision =
                this.getApprovalDecision(
                    sVendorId
                );


            oSelectedModel.setProperty(
                "/ReviewStatus",
                sReviewStatus
            );


            oSelectedModel.setProperty(
                "/ApprovalId",
                sApprovalId
            );


            oSelectedModel.setProperty(
                "/ApprovalDecision",
                sApprovalDecision
            );
        },


        /* =================================================
         * VENDOR ROW CLICK
         * ================================================= */

        onVendorPress: function (oEvent) {

            var oItem =
                oEvent.getSource();


            if (!oItem) {

                MessageBox.error(
                    "Vendor row could not be identified."
                );

                return;
            }


            var oContext =
                oItem.getBindingContext("vendor");


            if (!oContext) {

                MessageBox.error(
                    "Vendor binding context could not be found."
                );

                return;
            }


            var oVendor =
                oContext.getObject();


            var fRiskScore =
                parseFloat(
                    oVendor.RiskScore
                );


            if (isNaN(fRiskScore)) {
                fRiskScore = 0;
            }


            var sRiskLevel =
                String(
                    oVendor.RiskLevel || ""
                ).toUpperCase();


            /*
             * IMPORTANT:
             * Read approval status from SAP-loaded cache.
             */

            var sReviewStatus =
                this.getReviewStatus(
                    oVendor.VendorId
                );


            var sApprovalId =
                this.getApprovalId(
                    oVendor.VendorId
                );


            var sApprovalDecision =
                this.getApprovalDecision(
                    oVendor.VendorId
                );


            this.getView()
                .getModel("selectedVendor")
                .setData({

                    VendorId:
                        oVendor.VendorId || "",

                    VendorName:
                        oVendor.VendorName || "",

                    Category:
                        oVendor.Category || "",

                    Country:
                        oVendor.Country || "",

                    Status:
                        oVendor.Status || "",

                    RiskScore:
                        oVendor.RiskScore !== undefined
                            ? oVendor.RiskScore
                            : "",

                    RiskLevel:
                        sRiskLevel,

                    Assessment:
                        this.getRiskAssessment(
                            fRiskScore,
                            sRiskLevel
                        ),

                    Recommendation:
                        this.getRiskRecommendation(
                            fRiskScore,
                            sRiskLevel
                        ),

                    ManagementAction:
                        this.getManagementAction(
                            fRiskScore,
                            sRiskLevel
                        ),

                    ReviewStatus:
                        sReviewStatus,

                    ApprovalId:
                        sApprovalId,

                    ApprovalDecision:
                        sApprovalDecision

                });


            var oDialog =
                this.byId(
                    "vendorDetailsDialog"
                );


            if (!oDialog) {

                MessageBox.error(
                    "Vendor details dialog could not be found."
                );

                return;
            }


            oDialog.open();
        },


        /* =================================================
         * RISK ASSESSMENT
         * ================================================= */

        getRiskAssessment: function (
            fRiskScore,
            sRiskLevel
        ) {

            switch (sRiskLevel) {

                case "LOW":

                    return (
                        "Vendor currently presents a low " +
                        "procurement risk based on the available " +
                        "SAP risk score."
                    );


                case "MEDIUM":

                    return (
                        "Vendor presents a moderate procurement " +
                        "risk. Performance should be monitored regularly."
                    );


                case "HIGH":

                    return (
                        "Vendor presents a high procurement risk. " +
                        "Management review and closer monitoring " +
                        "are recommended."
                    );


                case "CRITICAL":

                    return (
                        "Vendor presents a critical procurement risk. " +
                        "Immediate management attention and risk review " +
                        "are required."
                    );


                default:

                    return (
                        "Risk score requires further assessment."
                    );
            }
        },


        /* =================================================
         * RISK RECOMMENDATION
         * ================================================= */

        getRiskRecommendation: function (
            fRiskScore,
            sRiskLevel
        ) {

            if (
                sRiskLevel === "LOW" ||
                fRiskScore <= 30
            ) {

                return "NORMAL MONITORING";
            }


            if (
                sRiskLevel === "MEDIUM" ||
                fRiskScore <= 60
            ) {

                return "MONITOR PERFORMANCE";
            }


            if (
                sRiskLevel === "HIGH" ||
                fRiskScore <= 80
            ) {

                return "MANAGER REVIEW";
            }


            return "URGENT REVIEW";
        },


        /* =================================================
         * MANAGEMENT ACTION
         * ================================================= */

        getManagementAction: function (
            fRiskScore,
            sRiskLevel
        ) {

            if (
                sRiskLevel === "LOW" ||
                fRiskScore <= 30
            ) {

                return (
                    "Continue normal vendor monitoring " +
                    "and periodic performance review."
                );
            }


            if (
                sRiskLevel === "MEDIUM" ||
                fRiskScore <= 60
            ) {

                return (
                    "Monitor vendor delivery, quality and " +
                    "commercial performance more frequently."
                );
            }


            if (
                sRiskLevel === "HIGH" ||
                fRiskScore <= 80
            ) {

                return (
                    "Escalate the vendor for manager review " +
                    "and closely monitor procurement performance."
                );
            }


            return (
                "Initiate urgent risk review and evaluate " +
                "appropriate corrective procurement action."
            );
        },


        /* =================================================
         * REVIEW STATUS
         * ================================================= */

        getReviewStatus: function (
            sVendorId
        ) {

            return (
                this._oReviewStatus &&
                this._oReviewStatus[sVendorId]
            ) || "NOT REVIEWED";
        },


        /* =================================================
         * APPROVAL ID
         * ================================================= */

        getApprovalId: function (
            sVendorId
        ) {

            return (
                this._oApprovalIds &&
                this._oApprovalIds[sVendorId]
            ) || "";
        },


        /* =================================================
         * APPROVAL DECISION
         * ================================================= */

        getApprovalDecision: function (
            sVendorId
        ) {

            return (
                this._oApprovalDecisions &&
                this._oApprovalDecisions[sVendorId]
            ) || "";
        },


        /* =================================================
         * MARK FOR REVIEW
         * ================================================= */

        onMarkForReview: function () {

            var oSelectedModel =
                this.getView()
                    .getModel("selectedVendor");


            var oVendor =
                oSelectedModel.getData();


            if (!oVendor.VendorId) {

                MessageBox.error(
                    "No vendor is currently selected."
                );

                return;
            }


            /*
             * Always check current SAP state before creating.
             */

            var that = this;


            this.loadApprovalData(
                function () {

                    /*
                     * Re-read current vendor approval state.
                     */

                    var sCurrentStatus =
                        that.getReviewStatus(
                            oVendor.VendorId
                        );


                    var sCurrentApprovalId =
                        that.getApprovalId(
                            oVendor.VendorId
                        );


                    /*
                     * Existing PENDING record.
                     * DO NOT CREATE DUPLICATE.
                     */

                    if (
                        sCurrentStatus === "PENDING"
                    ) {

                        oSelectedModel.setProperty(
                            "/ReviewStatus",
                            "PENDING"
                        );


                        oSelectedModel.setProperty(
                            "/ApprovalId",
                            sCurrentApprovalId
                        );


                        oSelectedModel.setProperty(
                            "/ApprovalDecision",
                            "PENDING"
                        );


                        MessageBox.information(
                            "This vendor already has a pending review request.\n\n" +
                            "Vendor: " +
                            oVendor.VendorId +
                            "\n" +
                            "Approval ID: " +
                            sCurrentApprovalId,
                            {
                                title:
                                    "Review Already Pending"
                            }
                        );

                        return;
                    }


                    /*
                     * Completed decision.
                     */

                    if (
                        sCurrentStatus === "APPROVED" ||
                        sCurrentStatus === "REJECTED"
                    ) {

                        MessageBox.information(
                            "This vendor already has a completed approval decision.\n\n" +
                            "Vendor: " +
                            oVendor.VendorId +
                            "\n" +
                            "Approval ID: " +
                            sCurrentApprovalId +
                            "\n" +
                            "Decision: " +
                            sCurrentStatus,
                            {
                                title:
                                    "Approval Already Completed"
                            }
                        );

                        return;
                    }


                    /*
                     * No existing approval.
                     * Now allow CREATE.
                     */

                    MessageBox.confirm(
                        "Create SAP management review request for vendor " +
                        oVendor.VendorId +
                        "?",
                        {

                            title:
                                "Create Risk Review",

                            actions: [
                                MessageBox.Action.OK,
                                MessageBox.Action.CANCEL
                            ],

                            emphasizedAction:
                                MessageBox.Action.OK,

                            onClose:
                                function (sAction) {

                                    if (
                                        sAction !==
                                        MessageBox.Action.OK
                                    ) {
                                        return;
                                    }


                                    that.createApprovalRequest(
                                        oVendor
                                    );
                                }

                        }
                    );

                }
            );
        },


        /* =================================================
         * CREATE APPROVAL REQUEST
         * ================================================= */

        createApprovalRequest: function (
            oVendor
        ) {

            var oModel =
                this.getView().getModel();


            if (!oModel) {

                MessageBox.error(
                    "SAP OData model is not available."
                );

                return;
            }


            var that = this;


            /*
             * Double protection:
             *
             * Check ApprovalSet AGAIN immediately
             * before CREATE.
             *
             * This prevents duplicate creation if
             * user clicks quickly or state changed.
             */

            this.getView().setBusy(true);


            oModel.read(
                "/ApprovalSet",
                {

                    success: function (oData) {

                        var aApprovals =
                            oData.results || [];


                        var aVendorApprovals =
                            aApprovals.filter(
                                function (oApproval) {

                                    return (
                                        String(
                                            oApproval.DocumentType || ""
                                        ).toUpperCase() === "VENDOR" &&

                                        String(
                                            oApproval.DocumentId || ""
                                        ) ===
                                        String(
                                            oVendor.VendorId
                                        )
                                    );

                                }
                            );


                        /*
                         * Find latest approval.
                         */

                        aVendorApprovals.sort(
                            function (a, b) {

                                return String(
                                    b.ApprovalId || ""
                                ).localeCompare(
                                    String(
                                        a.ApprovalId || ""
                                    )
                                );
                            }
                        );


                        var oLatestApproval =
                            aVendorApprovals.length > 0
                                ? aVendorApprovals[0]
                                : null;


                        if (
                            oLatestApproval &&
                            String(
                                oLatestApproval.Decision || ""
                            ).toUpperCase() === "PENDING"
                        ) {

                            that.getView()
                                .setBusy(false);


                            /*
                             * Sync this record.
                             */

                            that._oApprovalRecords[
                                oVendor.VendorId
                            ] =
                                oLatestApproval;


                            that._oReviewStatus[
                                oVendor.VendorId
                            ] = "PENDING";


                            that._oApprovalIds[
                                oVendor.VendorId
                            ] =
                                oLatestApproval.ApprovalId;


                            that._oApprovalDecisions[
                                oVendor.VendorId
                            ] = "PENDING";


                            that.syncSelectedVendorApproval();


                            MessageBox.information(
                                "A pending approval request already exists in SAP.\n\n" +
                                "Vendor: " +
                                oVendor.VendorId +
                                "\n" +
                                "Approval ID: " +
                                oLatestApproval.ApprovalId,
                                {
                                    title:
                                        "Existing Approval Found"
                                }
                            );

                            return;
                        }


                        /*
                         * No PENDING record.
                         * Create new approval.
                         */

                        var oPayload = {

                            DocumentType:
                                "VENDOR",

                            DocumentId:
                                oVendor.VendorId,

                            ApprovalLevel:
                                "1",

                            Decision:
                                "PENDING"

                        };


                        console.log(
                            "Creating ApprovalSet record:",
                            oPayload
                        );


                        oModel.create(
                            "/ApprovalSet",
                            oPayload,
                            {

                                success:
                                    function (oCreatedData) {

                                        console.log(
                                            "Approval created successfully:",
                                            oCreatedData
                                        );


                                        /*
                                         * DO NOT TRUST ONLY
                                         * LOCAL CREATE RESPONSE.
                                         *
                                         * Reload actual SAP records.
                                         */

                                        that.loadApprovalData(
                                            function (bLoaded) {

                                                that.getView()
                                                    .setBusy(false);


                                                if (!bLoaded) {

                                                    MessageBox.warning(
                                                        "Approval was created, but SAP ApprovalSet could not be refreshed."
                                                    );

                                                    return;
                                                }


                                                var sApprovalId =
                                                    that.getApprovalId(
                                                        oVendor.VendorId
                                                    );


                                                var oSelectedVendorModel =
                                                    that.getView()
                                                        .getModel(
                                                            "selectedVendor"
                                                        );


                                                oSelectedVendorModel.setProperty(
                                                    "/ReviewStatus",
                                                    "PENDING"
                                                );


                                                oSelectedVendorModel.setProperty(
                                                    "/ApprovalId",
                                                    sApprovalId
                                                );


                                                oSelectedVendorModel.setProperty(
                                                    "/ApprovalDecision",
                                                    "PENDING"
                                                );


                                                MessageBox.success(
                                                    "Vendor review request created successfully.\n\n" +
                                                    "Vendor: " +
                                                    oVendor.VendorId +
                                                    "\n" +
                                                    "Approval ID: " +
                                                    (
                                                        sApprovalId ||
                                                        "Generated by SAP"
                                                    ) +
                                                    "\n" +
                                                    "Decision: PENDING",
                                                    {
                                                        title:
                                                            "Approval Request Created"
                                                    }
                                                );

                                            }
                                        );

                                    },


                                error:
                                    function (oError) {

                                        that.getView()
                                            .setBusy(false);


                                        console.error(
                                            "ApprovalSet CREATE failed:",
                                            oError
                                        );


                                        MessageBox.error(
                                            "Vendor review request could not be created in SAP.\n\n" +
                                            that.getODataErrorMessage(
                                                oError
                                            ),
                                            {
                                                title:
                                                    "Approval Creation Error"
                                            }
                                        );
                                    }

                            }
                        );

                    },


                    error: function (oError) {

                        that.getView()
                            .setBusy(false);


                        MessageBox.error(
                            "Could not check existing approval records in SAP.\n\n" +
                            that.getODataErrorMessage(
                                oError
                            ),
                            {
                                title:
                                    "Approval Check Error"
                            }
                        );
                    }

                }
            );
        },


        /* =================================================
         * APPROVE VENDOR
         * ================================================= */

        onApproveVendor: function () {

            this.processApprovalDecision(
                "APPROVED"
            );
        },


        /* =================================================
         * REJECT VENDOR
         * ================================================= */

        onRejectVendor: function () {

            this.processApprovalDecision(
                "REJECTED"
            );
        },


        /* =================================================
         * PROCESS APPROVAL DECISION
         * ================================================= */

        processApprovalDecision: function (
            sDecision
        ) {

            var oSelectedModel =
                this.getView()
                    .getModel("selectedVendor");


            var oVendor =
                oSelectedModel.getData();


            if (!oVendor.VendorId) {

                MessageBox.error(
                    "No vendor is currently selected."
                );

                return;
            }


            if (!oVendor.ApprovalId) {

                MessageBox.error(
                    "No Approval ID is available for this vendor."
                );

                return;
            }


            if (
                oVendor.ReviewStatus !== "PENDING"
            ) {

                MessageToast.show(
                    "This approval is not in PENDING status."
                );

                return;
            }


            var sActionText =
                sDecision === "APPROVED"
                    ? "approve"
                    : "reject";


            var that = this;


            MessageBox.confirm(
                "Are you sure you want to " +
                sActionText +
                " the vendor risk review?\n\n" +
                "Vendor: " +
                oVendor.VendorId +
                "\n" +
                "Approval ID: " +
                oVendor.ApprovalId,
                {

                    title:
                        sDecision === "APPROVED"
                            ? "Approve Vendor Review"
                            : "Reject Vendor Review",

                    actions: [
                        MessageBox.Action.OK,
                        MessageBox.Action.CANCEL
                    ],

                    emphasizedAction:
                        MessageBox.Action.OK,

                    onClose:
                        function (sAction) {

                            if (
                                sAction !==
                                MessageBox.Action.OK
                            ) {
                                return;
                            }


                            that.updateApprovalDecision(
                                oVendor,
                                sDecision
                            );
                        }

                }
            );
        },


        /* =================================================
         * UPDATE APPROVAL IN SAP
         * ================================================= */

        updateApprovalDecision: function (
            oVendor,
            sDecision
        ) {

            var oModel =
                this.getView().getModel();


            if (!oModel) {

                MessageBox.error(
                    "SAP OData model is not available."
                );

                return;
            }


            var sApprovalId =
                String(
                    oVendor.ApprovalId
                );


            /*
             * ApprovalId is OData key.
             */

            var sPath =
                "/ApprovalSet('" +
                encodeURIComponent(
                    sApprovalId
                ) +
                "')";


            /*
             * Backend UPDATE_ENTITY sets
             * DecisionDate = SY-DATUM.
             *
             * Therefore only send Decision.
             */

            var oPayload = {

                Decision:
                    sDecision

            };


            console.log(
                "Updating Approval:",
                sPath,
                oPayload
            );


            var that = this;


            this.getView().setBusy(true);


            oModel.update(
                sPath,
                oPayload,
                {

                    merge: true,

                    success:
                        function (oData) {

                            console.log(
                                "Approval UPDATE successful:",
                                oData
                            );


                            /*
                             * IMPORTANT:
                             *
                             * Do NOT directly set local UI to
                             * APPROVED / REJECTED.
                             *
                             * First reload from SAP.
                             */

                            that.loadApprovalData(
                                function (bLoaded) {

                                    that.getView()
                                        .setBusy(false);


                                    if (!bLoaded) {

                                        MessageBox.warning(
                                            "Approval was updated in SAP, but the latest ApprovalSet data could not be loaded."
                                        );

                                        return;
                                    }


                                    /*
                                     * Get ACTUAL state from SAP.
                                     */

                                    var sActualStatus =
                                        that.getReviewStatus(
                                            oVendor.VendorId
                                        );


                                    var sActualApprovalId =
                                        that.getApprovalId(
                                            oVendor.VendorId
                                        );


                                    var sActualDecision =
                                        that.getApprovalDecision(
                                            oVendor.VendorId
                                        );


                                    var oSelectedVendorModel =
                                        that.getView()
                                            .getModel(
                                                "selectedVendor"
                                            );


                                    oSelectedVendorModel.setProperty(
                                        "/ReviewStatus",
                                        sActualStatus
                                    );


                                    oSelectedVendorModel.setProperty(
                                        "/ApprovalId",
                                        sActualApprovalId
                                    );


                                    oSelectedVendorModel.setProperty(
                                        "/ApprovalDecision",
                                        sActualDecision
                                    );


                                    /*
                                     * Show success only after
                                     * SAP has confirmed the state.
                                     */

                                    var sTitle =
                                        sActualStatus === "APPROVED"
                                            ? "Vendor Review Approved"
                                            : "Vendor Review Rejected";


                                    var sMessage =
                                        sActualStatus === "APPROVED"
                                            ? (
                                                "Vendor review has been approved successfully.\n\n" +
                                                "Vendor: " +
                                                oVendor.VendorId +
                                                "\n" +
                                                "Approval ID: " +
                                                sActualApprovalId +
                                                "\n" +
                                                "Decision: APPROVED"
                                            )
                                            : (
                                                "Vendor review has been rejected successfully.\n\n" +
                                                "Vendor: " +
                                                oVendor.VendorId +
                                                "\n" +
                                                "Approval ID: " +
                                                sActualApprovalId +
                                                "\n" +
                                                "Decision: REJECTED"
                                            );


                                    MessageBox.success(
                                        sMessage,
                                        {
                                            title:
                                                sTitle
                                        }
                                    );

                                }
                            );

                        },


                    error:
                        function (oError) {

                            that.getView()
                                .setBusy(false);


                            console.error(
                                "Approval update failed:",
                                oError
                            );


                            MessageBox.error(
                                "Approval decision could not be updated in SAP.\n\n" +
                                that.getODataErrorMessage(
                                    oError
                                ),
                                {
                                    title:
                                        "Approval Update Error"
                                }
                            );
                        }

                }
            );
        },


        /* =================================================
         * LEGACY LOCAL UPDATE
         *
         * Kept only for compatibility.
         *
         * Normal approval flow now reloads from SAP.
         * ================================================= */

        applyApprovalDecisionToUI: function (
            sVendorId,
            sDecision
        ) {

            if (!this._oReviewStatus) {
                this._oReviewStatus = {};
            }

            if (!this._oApprovalDecisions) {
                this._oApprovalDecisions = {};
            }


            this._oReviewStatus[
                sVendorId
            ] = sDecision;


            this._oApprovalDecisions[
                sVendorId
            ] = sDecision;


            var oSelectedModel =
                this.getView()
                    .getModel("selectedVendor");


            if (oSelectedModel) {

                oSelectedModel.setProperty(
                    "/ReviewStatus",
                    sDecision
                );


                oSelectedModel.setProperty(
                    "/ApprovalDecision",
                    sDecision
                );
            }
        },


        /* =================================================
         * ODATA ERROR PARSER
         * ================================================= */

        getODataErrorMessage: function (
            oError
        ) {

            var sMessage =
                "Unknown SAP OData error.";


            if (
                oError &&
                oError.responseText
            ) {

                try {

                    var oResponse =
                        JSON.parse(
                            oError.responseText
                        );


                    if (
                        oResponse.error &&
                        oResponse.error.message
                    ) {

                        if (
                            typeof
                            oResponse.error.message
                            === "string"
                        ) {

                            sMessage =
                                oResponse.error.message;

                        } else if (
                            oResponse.error.message.value
                        ) {

                            sMessage =
                                oResponse.error.message.value;
                        }
                    }


                    if (
                        oResponse.error &&
                        oResponse.error.innererror &&
                        oResponse.error.innererror.errordetails
                    ) {

                        var aDetails =
                            oResponse.error
                                .innererror
                                .errordetails;


                        if (
                            aDetails.length > 0 &&
                            aDetails[0].message
                        ) {

                            sMessage =
                                aDetails[0].message;
                        }
                    }


                } catch (eJson) {

                    try {

                        var oParser =
                            new DOMParser();


                        var oXml =
                            oParser.parseFromString(
                                oError.responseText,
                                "text/xml"
                            );


                        var aMessages =
                            oXml.getElementsByTagName(
                                "message"
                            );


                        if (
                            aMessages.length > 0 &&
                            aMessages[0].textContent
                        ) {

                            sMessage =
                                aMessages[0].textContent;
                        }


                    } catch (eXml) {

                        console.error(
                            "Could not parse SAP XML error:",
                            eXml
                        );
                    }
                }
            }


            if (
                sMessage ===
                "Unknown SAP OData error." &&
                oError &&
                oError.message
            ) {

                sMessage =
                    oError.message;
            }


            if (
                sMessage ===
                "Unknown SAP OData error." &&
                oError &&
                oError.statusText
            ) {

                sMessage =
                    oError.statusText;
            }


            return sMessage;
        },


        /* =================================================
         * REVIEW STATE FORMATTER
         * ================================================= */

        formatReviewState: function (
            sReviewStatus
        ) {

            var sStatus =
                String(
                    sReviewStatus || ""
                ).toUpperCase();


            switch (sStatus) {

                case "PENDING":
                    return "Warning";

                case "APPROVED":
                    return "Success";

                case "REJECTED":
                    return "Error";

                case "MARKED FOR REVIEW":
                    return "Warning";

                default:
                    return "None";
            }
        },


        /* =================================================
         * RISK STATE FORMATTER
         * ================================================= */

        formatRiskState: function (
            sRiskLevel
        ) {

            switch (
                String(
                    sRiskLevel || ""
                ).toUpperCase()
            ) {

                case "LOW":
                    return "Success";

                case "MEDIUM":
                    return "Warning";

                case "HIGH":
                    return "Error";

                case "CRITICAL":
                    return "Error";

                default:
                    return "None";
            }
        },

        /* =================================================
 * PO STATUS FORMATTER
 * ================================================= */

formatPOStatusState: function (
    sPOStatus
) {

    switch (
        String(
            sPOStatus || ""
        ).toUpperCase()
    ) {

        case "DELIVERED":
            return "Success";

        case "OPEN":
            return "Warning";

        case "DELAYED":
            return "Error";

        case "CANCELLED":
            return "Error";

        default:
            return "None";
    }
},

formatPRStatusState: function (
    sPRStatus
) {

    switch (
        String(
            sPRStatus || ""
        ).toUpperCase()
    ) {

        case "APPROVED":
            return "Success";

        case "SUBMITTED":
            return "Warning";

        case "DRAFT":
            return "None";

        case "CONVERTED_TO_PO":
            return "Success";

        case "REJECTED":
            return "Error";

        case "CANCELLED":
            return "Error";

        default:
            return "None";
    }
},
formatChangedAt: function (oTime) {
    if (!oTime) {
        return "";
    }

    // OData V2 Edm.Time object
    if (typeof oTime === "object" && oTime.ms !== undefined) {
        var iTotalSeconds = Math.floor(oTime.ms / 1000);

        var iHours = Math.floor(iTotalSeconds / 3600);
        var iMinutes = Math.floor((iTotalSeconds % 3600) / 60);
        var iSeconds = iTotalSeconds % 60;

        return [
            String(iHours).padStart(2, "0"),
            String(iMinutes).padStart(2, "0"),
            String(iSeconds).padStart(2, "0")
        ].join(":");
    }

    // Fallback if backend returns string
    if (typeof oTime === "string") {
        return oTime;
    }

    return "";
},

/* =================================================
 * DELIVERY STATUS FORMATTER
 * ================================================= */

formatDeliveryStatusState: function (
    sDeliveryStatus
) {

    switch (
        String(
            sDeliveryStatus || ""
        ).toUpperCase()
    ) {

        case "DELIVERED":
            return "Success";

        case "PENDING":
            return "Warning";

        case "DELAYED":
            return "Error";

        default:
            return "None";
    }
},


        /* =================================================
         * CLOSE DIALOG
         * ================================================= */

        onCloseVendorDialog: function () {

            var oDialog =
                this.byId(
                    "vendorDetailsDialog"
                );


            if (oDialog) {

                oDialog.close();
            }
        },


        /* =================================================
         * SEARCH + FILTER
         * ================================================= */

        applyVendorFilters: function () {

            var aAllVendors =
                this._aAllVendors || [];


            var oSearchField =
                this.byId(
                    "vendorSearch"
                );


            var oRiskFilter =
                this.byId(
                    "riskFilter"
                );


            var sSearch =
                oSearchField
                    ? oSearchField
                        .getValue()
                        .trim()
                        .toLowerCase()
                    : "";


            var sRisk =
                oRiskFilter
                    ? oRiskFilter.getSelectedKey()
                    : "ALL";


            var aFilteredVendors =
                aAllVendors.filter(
                    function (oVendor) {

                        var bSearchMatch =
                            true;


                        if (sSearch) {

                            var sVendorId =
                                String(
                                    oVendor.VendorId || ""
                                ).toLowerCase();


                            var sVendorName =
                                String(
                                    oVendor.VendorName || ""
                                ).toLowerCase();


                            var sCategory =
                                String(
                                    oVendor.Category || ""
                                ).toLowerCase();


                            var sCountry =
                                String(
                                    oVendor.Country || ""
                                ).toLowerCase();


                            var sRiskLevel =
                                String(
                                    oVendor.RiskLevel || ""
                                ).toLowerCase();


                            var sStatus =
                                String(
                                    oVendor.Status || ""
                                ).toLowerCase();


                            bSearchMatch =
                                sVendorId.indexOf(sSearch) !== -1 ||
                                sVendorName.indexOf(sSearch) !== -1 ||
                                sCategory.indexOf(sSearch) !== -1 ||
                                sCountry.indexOf(sSearch) !== -1 ||
                                sRiskLevel.indexOf(sSearch) !== -1 ||
                                sStatus.indexOf(sSearch) !== -1;
                        }


                        var bRiskMatch =
                            sRisk === "ALL" ||
                            String(
                                oVendor.RiskLevel || ""
                            ).toUpperCase() === sRisk;


                        return (
                            bSearchMatch &&
                            bRiskMatch
                        );
                    }
                );


            this.getView()
                .getModel("vendor")
                .setProperty(
                    "/VendorRiskSet",
                    aFilteredVendors
                );
        },


        /* =================================================
         * SEARCH
         * ================================================= */

        onVendorSearch: function () {

            this.applyVendorFilters();
        },


        /* =================================================
         * RISK FILTER
         * ================================================= */

        onRiskFilterChange: function () {

            this.applyVendorFilters();
        },


        /* =================================================
         * CLEAR FILTERS
         * ================================================= */

        onClearFilters: function () {

            var oSearchField =
                this.byId(
                    "vendorSearch"
                );


            var oRiskFilter =
                this.byId(
                    "riskFilter"
                );


            if (oSearchField) {

                oSearchField.setValue("");
            }


            if (oRiskFilter) {

                oRiskFilter.setSelectedKey(
                    "ALL"
                );
            }


            this.getView()
                .getModel("vendor")
                .setProperty(
                    "/VendorRiskSet",
                    this._aAllVendors || []
                );


            MessageToast.show(
                "Vendor filters cleared."
            );
        },


        /* =================================================
         * REFRESH
         * ================================================= */

        onRefresh: function () {

            var oSearchField =
                this.byId(
                    "vendorSearch"
                );


            var oRiskFilter =
                this.byId(
                    "riskFilter"
                );


            if (oSearchField) {

                oSearchField.setValue("");
            }


            if (oRiskFilter) {

                oRiskFilter.setSelectedKey(
                    "ALL"
                );
            }


            MessageToast.show(
                "Refreshing vendor and approval data..."
            );


            /*
             * Reload BOTH:
             *
             * VendorRiskSet
             * ApprovalSet
             */

            this.loadVendorData();

            this.loadApprovalData();

            this.loadAlertData();

            this.loadAuditData();
            this.loadPOAnalytics();
            this.loadPRData();
            this.loadProcurementOverview();
            this.loadDeliveryAnalytics();
        }

    });

});