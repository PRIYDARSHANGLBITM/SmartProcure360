sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    JSONModel,
    ODataModel,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox
) {

    "use strict";

    return Controller.extend(
        "smartprocure360.controller.App",
        {

            /* =====================================================
               INITIALIZATION
            ===================================================== */

            onInit: function () {

                var sServiceUrl =
                    //"https://merida.cob.csuchico.edu:8038/sap/opu/odata/sap/ZSP360_ODATA_SRV/";
                    "/sap/opu/odata/sap/ZSP360_ODATA_SRV/";

                var oODataModel = new ODataModel(
                    sServiceUrl,
                    {
                        json: true,
                        useBatch: false,
                        withCredentials: true
                    }
                );

                this.getView().setModel(
                    oODataModel
                );

                var oDashboardModel = new JSONModel({

                    totalVendors: 0,
                    lowRisk: 0,
                    mediumRisk: 0,
                    highRisk: 0,
                    criticalRisk: 0

                });

                this.getView().setModel(
                    oDashboardModel,
                    "dashboard"
                );

                this.loadVendorData();

                console.log(
                    "SmartProcure360 OData model initialized successfully."
                );

            },


            /* =====================================================
               LOAD VENDOR DATA FROM SAP
            ===================================================== */

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

                            var iTotal =
                                aVendors.length;

                            var iLow = 0;
                            var iMedium = 0;
                            var iHigh = 0;
                            var iCritical = 0;

                            aVendors.forEach(
                                function (oVendor) {

                                    switch (
                                        oVendor.RiskLevel
                                    ) {

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

                                }
                            );

                            var oDashboard =
                                that.getView()
                                    .getModel("dashboard");

                            oDashboard.setData({

                                totalVendors: iTotal,
                                lowRisk: iLow,
                                mediumRisk: iMedium,
                                highRisk: iHigh,
                                criticalRisk: iCritical

                            });

                            console.log(
                                "SAP VendorRiskSet loaded successfully:",
                                aVendors
                            );

                            MessageToast.show(
                                iTotal +
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
                                "Check CORS or SAP authentication."
                            );

                        }

                    }
                );

            },


            /* =====================================================
               SEARCH
            ===================================================== */

            onSearch: function (oEvent) {

                var sQuery =
                    oEvent.getParameter(
                        "newValue"
                    ) || "";

                var oTable =
                    this.byId(
                        "vendorRiskTable"
                    );

                var oBinding =
                    oTable.getBinding(
                        "items"
                    );

                if (!oBinding) {
                    return;
                }

                if (!sQuery.trim()) {

                    oBinding.filter([]);

                    return;

                }

                sQuery =
                    sQuery.trim();

                var oVendorIdFilter =
                    new Filter(
                        "VendorId",
                        FilterOperator.Contains,
                        sQuery
                    );

                var oVendorNameFilter =
                    new Filter(
                        "VendorName",
                        FilterOperator.Contains,
                        sQuery
                    );

                var oCategoryFilter =
                    new Filter(
                        "Category",
                        FilterOperator.Contains,
                        sQuery
                    );

                var oRiskLevelFilter =
                    new Filter(
                        "RiskLevel",
                        FilterOperator.Contains,
                        sQuery
                    );

                var oSearchFilter =
                    new Filter({

                        filters: [
                            oVendorIdFilter,
                            oVendorNameFilter,
                            oCategoryFilter,
                            oRiskLevelFilter
                        ],

                        and: false

                    });

                oBinding.filter([
                    oSearchFilter
                ]);

                console.log(
                    "OData search:",
                    sQuery
                );

            },


            /* =====================================================
               RISK LEVEL FORMATTER
            ===================================================== */

            formatRiskState: function (
                sRiskLevel
            ) {

                switch (sRiskLevel) {

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


            /* =====================================================
               REFRESH
            ===================================================== */

            onRefresh: function () {

                var oModel =
                    this.getView().getModel();

                if (oModel) {

                    oModel.refresh(true);

                }

                this.loadVendorData();

                MessageToast.show(
                    "Vendor data refreshed from SAP."
                );

            }

        }
    );

});