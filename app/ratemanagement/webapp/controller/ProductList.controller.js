sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], (Controller,MessageToast,Fragment) => {
    "use strict";

    return Controller.extend("rwt.etp.ratemanagement.controller.ProductList", {
        onInit() {
            this._oView = this.getView();
            this._ServerModel = this.getOwnerComponent().getModel();
        },

        onAddNewPrs:function(){
            var oView = this.getView();
            if (!this.byId("newRowDialog")) {

                this.loadFragment({
                    name: "rwt.etp.ratemanagement.fragment.AddProduct"
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();  // Open the dialog for adding a new row
                
                }.bind(this));

            } else {
                // Open the existing dialog if it's already loaded
                this.byId("newRowDialog").open();
            }
        },

        // Triggered when the "Save" button in the dialog is pressed
        onSaveNewRow: function () {
            var oView = this.getView();

            // Get input values from the fragment
            var sProductCode = this.byId("productCodeInput").getValue();
            var sProductName = this.byId("productNameInput").getValue();
            var iPackagingQty = this.byId("packagingQtyInput").getValue();
            var sUnit = this.byId("unitInput").getValue();
            var fCostPrice = this.byId("costPriceInput").getValue();
            var fLandingPrice = this.byId("landingPriceInput").getValue();
            var fSellingPrice = this.byId("sellingPriceInput").getValue();

            // Data structure for new row (to be sent to OData service)
            var oNewRowData = {
                ProductCode: sProductCode,
                Product: sProductName,
                Packaging_Qty: iPackagingQty,
                Unit: sUnit,
                Cost_Price: fCostPrice,
                Landing_Price: fLandingPrice,
                Selling_Price: fSellingPrice
            };

            var oTable = this.byId("idTable");
            var oBinding = oTable.getBinding("items");

            // Create the new entry in the OData Model
            var oContext = oBinding.create(oNewRowData);
            oContext.created().then(function () {
               MessageToast.show("New Product Added");
               oView.byId("newRowDialog").close();
            }, function (oError) {
                // handle rejection of entity creation; if oError.canceled === true then the transient entity has been deleted
                    if (!oError.canceled) {
                        throw oError; // unexpected error
                    }
            });
        },

        // Triggered when the "Cancel" button in the dialog is pressed
        onCancelNewRow: function () {
            // Close the dialog without saving
            this.byId("newRowDialog").close();
        },
        onRowEdit:function(oEvent){
            var oRow = oEvent.getSource().getParent();
            
            // Access all cells in the row
            var aCells = oRow.getCells();

            // Iterate over the cells and enable the Input fields
            aCells.forEach(function (oCell) {
                if (oCell.isA("sap.m.Input")) {
                    oCell.setEditable(true);
                }
            });

            // Optionally, change the icon to "save" or "done" after editing
            oEvent.getSource().setIcon("sap-icon://save");
            oEvent.getSource().setTooltip("Save Changes");
            oEvent.getSource().detachPress(this.onRowEdit);
            oEvent.getSource().attachPress(this.onRowSave, this);
        },
        onRowSave: function (oEvent) {
            // Get the clicked button's parent (the ColumnListItem)
            var oRow = oEvent.getSource().getParent();

            // Access all cells in the row
            var aCells = oRow.getCells();

            // Iterate over the cells and disable the Input fields
            aCells.forEach(function (oCell) {
                if (oCell.isA("sap.m.Input")) {
                    oCell.setEditable(false);
                }
            });

            // Optionally, revert the icon to "edit"
            oEvent.getSource().setIcon("sap-icon://edit");
            oEvent.getSource().setTooltip("Edit Row");
            oEvent.getSource().detachPress(this.onRowSave);
            oEvent.getSource().attachPress(this.onRowEdit, this);

            var oContext = oRow.getBindingContext(); // Get row's binding context
            this._ServerModel.submitBatch("updateGroup").then(function () {
                MessageToast.show("Changes saved successfully!");
            }).catch(function (oError) {
                MessageToast.show("Failed to save changes.");
                console.error(oError);
            });
        },

        onSavePrs: function () {
            // This method saves all table data, if needed
            var oModel = this.getView().getModel();
            var aData = oModel.getProperty("/Products");

            // Perform save logic (e.g., backend call)
            MessageToast.show("All changes saved!");
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

    });
});