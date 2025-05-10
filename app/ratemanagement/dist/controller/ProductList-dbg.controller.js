sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    'sap/m/MessageBox',
], (Controller,MessageToast,Fragment,exportLibrary, Spreadsheet,MessageBox) => {
    "use strict";
    var EdmType = exportLibrary.EdmType;
    return Controller.extend("rwt.etp.ratemanagement.controller.ProductList", {
        onInit() {
            this._oView = this.getView();
            this._ServerModel = this.getOwnerComponent().getModel();
            this._ServerModel.setSizeLimit(1000);
            
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
            var _this= this;

            // Get input values from the fragment
            var sProductCode = this.byId("productCodeInput").getValue();
            var sProductName = this.byId("productNameInput").getValue();
            var iPackagingQty = this.byId("packagingQtyInput").getValue();
            var sUnit = this.byId("unitInput").getValue();
            var fCostPrice = this.byId("costPriceInput").getValue();
            var fLandingPrice = this.byId("landingPriceInput").getValue();
            var fSellingPrice = this.byId("sellingPriceInput").getValue();
            var nStock  = this.byId("stockInput").getValue();

            // Data structure for new row (to be sent to OData service)
            var oNewRowData = {
                ProductCode: sProductCode,
                Product: sProductName,
                Packaging_Qty: iPackagingQty,
                Unit: sUnit,
                Cost_Price: fCostPrice,
                Landing_Price: fLandingPrice,
                Selling_Price: fSellingPrice,
                Available_Qty: nStock
            };

            var oTable = this.byId("idTable");
            var oBinding = oTable.getBinding("items");

            // Create the new entry in the OData Model
            var oContext = oBinding.create(oNewRowData);
            oContext.created().then(function () {
               MessageToast.show("New Product Added");
               oView.byId("newRowDialog").close();
               _this._ServerModel.refresh();
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
            var oRow = oEvent.getSource().getParent().getParent();
            
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
            var oRow = oEvent.getSource().getParent().getParent();
            var _this =this;
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
                _this._ServerModel.refresh();
            }).catch(function (oError) {
                MessageToast.show("Failed to save changes.");
                console.error(oError);
            });
        },

        onRowDel:function(oEvt){
            var oRow = oEvt.getSource().getParent();
            var oContext = oRow.getBindingContext(); 
        
            var _this = this;
            MessageBox.confirm("Are you sure you want to delete this item?", {
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        
                        _this._ServerModel.delete(oContext.getPath())
                            .then(function () {
                                sap.m.MessageToast.show("Item deleted successfully.");
                            })
                            .catch(function (oError) {
                                MessageBox.error("Failed to delete item: " + oError.message);
                            });
                    }
                }
            });
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
                property: 'Packaging_Qty',
                label: 'Packaging Quantity',
                type: EdmType.Number
            });
            aCols.push({
                label: 'Unit',
                property: 'Unit',
                type: EdmType.Number
            });

            aCols.push({
                label: 'Cost Price',
                property: 'Cost_Price',
                type: EdmType.Number,
                width: 15
            });
            
            aCols.push({
                label: 'Landing Price',
                property: 'Landing_Price',
                type: EdmType.Number,
                scale: 2, 
                width: 15
            });
            aCols.push({
                label: 'Selling Price',
                property: 'Selling_Price',
                type: EdmType.Number,
                scale: 2,
                width: 15
            });
            aCols.push({
                label: 'Available Stock',
                property: 'Available_Qty',
                type: EdmType.Number,
                scale: 2, 
                width: 15
            });
        
            return aCols;
        },
        onDwnldPrs: function () {
            let FileName = "RateList";
            const currentDate = new Date();

            let oTable = this.byId("idTable");
            
            // Extract day, month, and year components
            const day = String(currentDate.getDate()).padStart(2, '0'); // Ensures 2 digits
            const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
            const year = String(currentDate.getFullYear()).slice(-2); // Extract last 2 digits of the year

            // Combine into DDMMYY format
            const formattedDate = `${day}${month}${year}`;
            FileName += "_" + formattedDate;

            var aCols, oRowBinding, oSettings, oSheet;

            oRowBinding = oTable.getBinding('items');
            aCols = this.createColumnConfig();

            oSettings = {
                workbook: {
                    context: {
                        application: "Rate List",
                        version: "6.1.0-SNAPSHOT",
                        title: "Rate List",
                        modifiedBy: "Rawat, Enterprises",
                        sheetName: "RateList"
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
        }
    });
});