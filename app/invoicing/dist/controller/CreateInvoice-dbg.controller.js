sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet'
], (Controller, MessageToast, Filter, exportLibrary, Spreadsheet) => {
    "use strict";
    var EdmType = exportLibrary.EdmType;
    return Controller.extend("rwt.etp.invoicing.controller.CreateInvoice", {
        onInit: function () {
            this._oView = this.getView();
            this._ProductData = this.getOwnerComponent().getModel("ProductModel");
            this._ServerModel = this.getOwnerComponent().getModel();
            this._ProductData.setSizeLimit(1000);
            this._ServerModel.setSizeLimit(1000);

            this._ServerModel.bindList("/Products").requestContexts(0, 1000).then(function (aContexts) {
                // Set the data to the JSONModel
                let aData = aContexts.map(function (oContext) {
                    oContext.getObject().Selling_Price = parseInt(oContext.getObject().Selling_Price);
                    oContext.getObject().Cost_Price = parseInt(oContext.getObject().Cost_Price);
                    oContext.getObject().Available_Qty = parseInt(oContext.getObject().Available_Qty);
                    return oContext.getObject();
                });
                this._ProductData.setData(aData);

            }.bind(this)).catch(function (oError) {
                console.error("Error while fetching from server OData:", oError);
            });
        },

        onSuggestionItemSelected: function (oEvent) {
            // Get the selected item from the event
            let oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {

                let sSelectedKey = oSelectedItem.getKey().split("--");

                let aData = this._ProductData.getProperty("/");
                let oSelectedData = aData.find(item => item.ProductCode === sSelectedKey[0] &&
                    item.Packaging_Qty == sSelectedKey[1]);

                let InvoiceModel = this._oView.getModel("InvoiceModel");
                let aInvoiceData = InvoiceModel.getProperty("/");
                if (!Array.isArray(aInvoiceData)) {
                    // If not an array, initialize it as an empty array
                    aInvoiceData = [];
                }
                oSelectedData.Sell_Qty = 1;
                oSelectedData.TotalPrice = oSelectedData.Selling_Price;
                aInvoiceData.push(oSelectedData);
                InvoiceModel.setProperty("/", aInvoiceData);
                // Step 6: Refresh the bindings to update the UI
                InvoiceModel.updateBindings();
                oEvent.getSource().setValue();
            }
        },
        updateSP: function (oEvent) {
            let oSource = oEvent.getSource().getParent();
            let oParentBinding = oSource.getBindingContextPath();
            let oModel = this.getView().getModel("InvoiceModel");

            let changedSP = oSource.getAggregation("cells")[5].getValue();
            oModel.setProperty(`${oParentBinding}/Selling_Price`, parseInt(changedSP));

            let SellQty = oSource.getAggregation("cells")[3].getValue();
            oModel.setProperty(`${oParentBinding}/Sell_Qty`, SellQty);

            let SellingPrice = oModel.getProperty(`${oParentBinding}/Selling_Price`);
            let NewSP = oModel.setProperty(`${oParentBinding}/TotalPrice`, parseInt(SellingPrice) * SellQty);

            oModel.refresh(true);
        },

        onTblUpdateFinsh: function (oEvent) {
            const oTable = this.byId("idTable");
            const aItems = oTable.getItems();

            let fTotalSellingPrice = 0;
            let fTotalGST = 0;

            // Loop through each row to calculate totals
            aItems.forEach((oItem) => {
                const oContext = oItem.getBindingContext("InvoiceModel");
                if (oContext) {
                    const fSellingPrice = parseFloat(oContext.getProperty("TotalPrice")) || 0;

                    fTotalSellingPrice += fSellingPrice;

                }
            });

            this.byId("idTotlVal").setText((fTotalSellingPrice).toFixed(2));
        },
        onDelRow: function (oEvent) {
            // Get the source of the event (the button) and its binding context
            const oButton = oEvent.getSource();
            const oContext = oButton.getBindingContext("InvoiceModel");

            if (oContext) {
                const sPath = oContext.getPath();
                const oModel = this.getView().getModel("InvoiceModel");
                const aData = oModel.getProperty("/");
                const iIndex = parseInt(sPath.split("/").pop());
                // Remove the item from the array
                aData.splice(iIndex, 1);
                // Update the model with the modified data
                oModel.setProperty("/", aData);
                sap.m.MessageToast.show("Row deleted successfully");
            }
        },
        onResetPrs: function () {
            this.getView().getModel("InvoiceModel").setData().refresh(true);
        },
        createColumnConfig: function () {
            var aCols = [];

            aCols.push({
                label: 'Product',
                property: 'Product',
                type: EdmType.String,
                width: 50
            });

            aCols.push({
                label: 'Product Code',
                type: EdmType.String,
                property: 'ProductCode'
            });

            aCols.push({
                property: ['Packaging_Qty', 'Unit'],
                label: 'Packing',
                type: EdmType.String,
                width: 10,
                template: '{0} {1}'
            });

            aCols.push({
                label: 'Cost Price',
                property: 'Cost_Price',
                type: EdmType.Number,
                width: 15
            });
            aCols.push({
                label: 'Selling Price (incl. GST)',
                property: 'Selling_Price',
                type: EdmType.Number,
                scale: 2, // Ensures numbers are formatted with two decimal places
                width: 15
            });
            aCols.push({
                label: 'Quantity',
                property: 'Sell_Qty',
                type: EdmType.Number,
                scale: 2, // Ensures numbers are formatted with two decimal places
                width: 15
            });
            aCols.push({
                label: 'Total',
                property: 'TotalPrice',
                type: EdmType.Number,
                scale: 2, // Ensures numbers are formatted with two decimal places
                width: 15
            });
            return aCols;
        },
        onPrntPrs: function () {
            let FileName = this.byId("idCustmrNm").getValue();

            if (!FileName) {
                MessageToast.show("Enter Customer Name");
                return;
            }
            const currentDate = new Date();

            let oTable = this.byId("idTable");
            let oModel = oTable.getModel("InvoiceModel");
            let aData = oModel.getProperty("/");


            // Extract day, month, and year components
            const day = String(currentDate.getDate()).padStart(2, '0'); // Ensures 2 digits
            const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
            const year = String(currentDate.getFullYear()).slice(-2); // Extract last 2 digits of the year

            // Combine into DDMMYY format
            const formattedDate = `${day}${month}${year}`;
            FileName += "_" + formattedDate + "_" + this.byId("idTotlVal").getText();

            var aCols, oRowBinding, oSettings, oSheet;

            oRowBinding = oTable.getBinding('items');
            aCols = this.createColumnConfig();

            oSettings = {
                workbook: {
                    context: {
                        application: "Supplier Invoices List",
                        version: "6.1.0-SNAPSHOT",
                        title: "Supplier Invoices",
                        modifiedBy: "Rawat Enterprises",
                        sheetName: "Invoices"
                    },
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },

                dataSource: oRowBinding,
                fileName: FileName + '.xlsx',
                worker: false // We need to disable worker because we are using a MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },

    });
});