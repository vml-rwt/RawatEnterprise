//@ui5-bundle rwt/etp/stockmanagement/Component-preload.js
sap.ui.require.preload({
	"rwt/etp/stockmanagement/Component.js":function(){
sap.ui.define(["sap/ui/core/UIComponent","rwt/etp/stockmanagement/model/models"],(e,t)=>{"use strict";return e.extend("rwt.etp.stockmanagement.Component",{metadata:{manifest:"json",interfaces:["sap.ui.core.IAsyncContentCreation"]},init(){e.prototype.init.apply(this,arguments);this.setModel(t.createDeviceModel(),"device");this.getRouter().initialize()}})});
},
	"rwt/etp/stockmanagement/controller/App.controller.js":function(){
sap.ui.define(["sap/ui/core/mvc/Controller"],e=>{"use strict";return e.extend("rwt.etp.stockmanagement.controller.App",{onInit(){}})});
},
	"rwt/etp/stockmanagement/controller/StockList.controller.js":function(){
sap.ui.define(["sap/ui/core/mvc/Controller"],t=>{"use strict";return t.extend("rwt.etp.stockmanagement.controller.StockList",{onInit(){}})});
},
	"rwt/etp/stockmanagement/i18n/i18n.properties":'# This is the resource bundle for rwt.etp.stockmanagement\n\n#Texts for manifest.json\n\n#XTIT: Application name\nappTitle=App for stock management\n\n#YDES: Application description\nappDescription=An SAP Fiori application.\n#XTIT: Main view title\ntitle=App for stock management',
	"rwt/etp/stockmanagement/manifest.json":'{"_version":"1.65.0","sap.app":{"id":"rwt.etp.stockmanagement","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"0.0.1"},"title":"{{appTitle}}","description":"{{appDescription}}","resources":"resources.json","sourceTemplate":{"id":"@sap/generator-fiori:basic","version":"1.15.7","toolsId":"87c0a9dd-8646-4c8b-b24d-03f039aa4ccb"},"dataSources":{"mainService":{"uri":"/odata/v4/catalog/","type":"OData","settings":{"annotations":[],"odataVersion":"4.0"}}},"crossNavigation":{"inbounds":{"stockmanagement-display":{"semanticObject":"stockmanagement","action":"display","signature":{"parameters":{},"additionalParameters":"allowed"}}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"flexEnabled":true,"dependencies":{"minUI5Version":"1.131.1","libs":{"sap.m":{},"sap.ui.core":{}}},"contentDensities":{"compact":true,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"rwt.etp.stockmanagement.i18n.i18n"}},"":{"dataSource":"mainService","preload":true,"settings":{"operationMode":"Server","autoExpandSelect":true,"earlyRequests":true}}},"resources":{"css":[{"uri":"css/style.css"}]},"routing":{"config":{"routerClass":"sap.m.routing.Router","controlAggregation":"pages","controlId":"app","transition":"slide","type":"View","viewType":"XML","path":"rwt.etp.stockmanagement.view"},"routes":[{"name":"RouteStockList","pattern":":?query:","target":["TargetStockList"]}],"targets":{"TargetStockList":{"id":"StockList","name":"StockList"}}},"rootView":{"viewName":"rwt.etp.stockmanagement.view.App","type":"XML","id":"App"}},"sap.cloud":{"public":true,"service":"RawatEnterprises.service"}}',
	"rwt/etp/stockmanagement/model/models.js":function(){
sap.ui.define(["sap/ui/model/json/JSONModel","sap/ui/Device"],function(e,n){"use strict";return{createDeviceModel:function(){var i=new e(n);i.setDefaultBindingMode("OneWay");return i}}});
},
	"rwt/etp/stockmanagement/view/App.view.xml":'<mvc:View controllerName="rwt.etp.stockmanagement.controller.App"\n    displayBlock="true"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns="sap.m"><App id="app"></App></mvc:View>',
	"rwt/etp/stockmanagement/view/StockList.view.xml":'<mvc:View controllerName="rwt.etp.stockmanagement.controller.StockList"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns="sap.m"><Page id="page" title="{i18n>title}"></Page></mvc:View>'
});
//# sourceMappingURL=Component-preload.js.map
