sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {

    "use strict";

    return UIComponent.extend("smartprocure360.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {

            UIComponent.prototype.init.apply(this, arguments);

            console.log(
                "SmartProcure360 Component initialized successfully."
            );

        }

    });

});