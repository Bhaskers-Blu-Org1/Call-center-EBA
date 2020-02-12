scDefine(["scbase/loader!dojo/_base/declare",
"scbase/loader!extn/home/HomeExtnUI",
"scbase/loader!dojo/_base/lang",
"scbase/loader!dojo/on",
"scbase/loader!sc/plat/dojo/utils/BaseUtils",
"scbase/loader!isccs/utils/UIUtils",
"scbase/loader!sc/plat/dojo/utils/ModelUtils",
"scbase/loader!sc/plat/dojo/utils/ScreenUtils",
"scbase/loader!isccs/utils/OrderUtils"
]
,
function(			 
			    _dojodeclare
			 ,
			    _extnHomeExtnUI,
				dLang,
							_on,
							_scBaseUtils,
							_isccsUIUtils,
							_scModelUtils,
							_scScreenUtils,
							_isccsOrderUtils 
){ 
	return _dojodeclare("extn.home.HomeExtn", [_extnHomeExtnUI],{
		getOrderModel: function(screen, orderNo, EnterpriseCode) {
			var OrderList = _scModelUtils.createNewModelObjectWithRootKey("Order");
			_scModelUtils.setStringValueAtModelPath("Order.EnterpriseCode",EnterpriseCode, OrderList);
			_scModelUtils.setStringValueAtModelPath("Order.OrderNo", orderNo ,OrderList);
			_isccsUIUtils.callApi(screen, OrderList, "extn_eba_getOrderDetails", null);
		},	
		handleMashupOutput: function (
		mashupRefId, modelOutput, mashupInput, mashupContext, applySetModel) {
		if (_scBaseUtils.equals(mashupRefId, "extn_eba_getOrderDetails")) {

			if (ebaUseCase == "Orderpopup")
				currentPopupScreen.openOrderDetailsPopup(this,modelOutput);
		}	
	},
	openOrderDetailsPopup: function (screen,targetModel) {
			_scBaseUtils.removeBlankAttributes(targetModel);
			currentPopupScreen.openOrderSummaryPopup(event, targetModel,screen);
		},
	openOrderSummaryPopup: function(event, orderArgs,screen) {
		var isPopup = true;
		var item = orderArgs;
		isPopup = _scScreenUtils.isPopup(screen);
		if (!(_scBaseUtils.equals(true, isPopup))) {
			var detailsScreen = "isccs.order.wizards.orderSummary.OrderSummaryWizard";
			if (!(_scBaseUtils.isVoid(detailsScreen))) {
				var order = null;
				order = _scModelUtils.createNewModelObjectWithRootKey("Order");
				_scModelUtils.addModelObjectAsChildToModelObject("Order", item, order);
				order = _isccsOrderUtils.getEditorInputForOrder(order);
				_isccsOrderUtils.openOrder(screen, orderArgs);
			}
		}
	},
	handleMashupCompletionData: function(mashupContext,
		mashupRefObj, mashupRefList, inputData, hasError, data,
		screen) {
		var modelInput = null;
		var modelOutput = null;
		var mashupRefId = null;
		var mashupRefBean = null;
		if (!_scBaseUtils.isEmptyArray(mashupRefList)) {
			for (var counter = 0; counter < _scBaseUtils.getAttributeCount(mashupRefList); counter++) {
				 mashupRefBean = mashupRefList[counter];
				var mashupInputBean = inputData[counter];
				 mashupRefId = _scBaseUtils.getStringValueFromBean(
						"mashupRefId", mashupRefBean);
				 modelOutput = _scBaseUtils.getModelValueFromBean(
						"mashupRefOutput", mashupRefBean);
				 modelInput = _scBaseUtils.getModelValueFromBean(
						"mashupInputObject", mashupInputBean);
				if (dLang.isFunction(screen["handleMashupOutput"])) {
					screen["handleMashupOutput"](mashupRefId,
							modelOutput, modelInput, mashupContext);
				}
				if (dLang.isFunction(screen["handleScreenSpecificAction"])) {
					screen["handleScreenSpecificAction"](mashupRefId,
							modelOutput, modelInput, mashupContext);
				}
			}
			if (dLang.isFunction(screen["handleSpecificActionForMashups"])) {
				screen["handleSpecificActionForMashups"](mashupContext,
						mashupRefObj, mashupRefList, inputData, hasError, data, screen);
			}
		} else if (!_scBaseUtils.isEmptyArray(inputData)) {

			for (var i = 0; i < _scBaseUtils.getAttributeCount(mashupRefList); i++) {
				 mashupRefBean = inputData[i];
				 mashupRefId = _scBaseUtils.getStringValueFromBean(
						"mashupRefId", mashupRefBean);
				 modelInput = _scBaseUtils.getModelValueFromBean(
						"mashupInputObject", mashupRefBean);
				if (dLang.isFunction(screen["handleMashupOutput"])) {
					screen["handleMashupOutput"](mashupRefId, null,
							modelInput, mashupContext);
				}
				if (dLang.isFunction(screen["handleScreenSpecificAction"])) {
					screen["handleScreenSpecificAction"](mashupRefId,
							null, modelInput, mashupContext);
				}
			}
		} else {
			  mashupRefId = _scBaseUtils.getStringValueFromBean(
					"mashupRefId", mashupRefObj);
			 modelOutput = _scBaseUtils.getModelValueFromBean(
					"mashupRefOutput", mashupRefObj);
			if (dLang.isFunction(screen["handleMashupOutput"])) {
				screen["handleMashupOutput"](mashupRefId, modelOutput,
						null, mashupContext);
			}
			if (dLang.isFunction(screen["handleScreenSpecificAction"])) {
				screen["handleScreenSpecificAction"](mashupRefId,
						modelOutput, null, mashupContext);
			}
		}
	},
        LoadEBA: function() {
			currentPopupScreen = this;
            IBM_EBA.setup({
					access_token:'',
					agent_name: '',
					disable_button: false,
					disable_shadow: true,
					loading_delay: 1000,
					user_first_name: '',
					user_last_name: '',
					user_full_name: ''})
			_on(window,'message',function(event){
			var ms = event.data;
			if (ms.usecase == "ViewOrder") {
				ebaUseCase = "Orderpopup";
				var order = ms.OrderNo;
				var enterprise = ms.EnterpriseCode;
				if (order && enterprise)
					currentPopupScreen.getOrderModel(currentPopupScreen,order, enterprise);
			}else  if (ms.usecase == "ResolveHolds") {
				ebaUseCase = "ResolveHolds";
				var order = ms.OrderNo;
				var enterprise = ms.EnterpriseCode;
				if (order && enterprise)
					currentPopupScreen.getOrderModel(currentPopupScreen, order, enterprise);
			}

			});
			escListener = dLang.hitch(this, this.manageKeyUp);
			window.document.addEventListener("keyup", escListener, true);
			
      
}
});
});
