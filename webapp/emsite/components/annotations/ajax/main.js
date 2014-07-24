//jAnqular controller

jQuery(document).ready(function() 
{ 
	var scope = new Scope();
	scope.add("app", jQuery("#application") );
	scope.add("home" ,scope.app.data("home") );
	scope.add("apphome" , scope.app.data("apphome") );
	scope.add("componentroot" ,scope.app.data("home") );
	scope.add("collectionid", $("#collectiontoplevel").data("collectionid") );
	scope.add("catalogid" ,'emsite/catalog');
	

loadSelectors = function(scope)
{
	//TODO: Search for all ng-click?
	$("div.annotations-carousel a img, ul.annotations-toolbar > li [ng-click]").livequery('click', function() 
	{
		var theimg = jQuery(this);
		var code = theimg.attr("ng-click");
		eval(code);
	});
}



loadModels = function(scope)
{

	var currentAnnotation = function(assetid) {
		return {
			annotation: some_function_to_get_annotation_by_assetid()
		}
	}

	// load asset data
	jQuery.ajax({
		type: "GET",
		url: "" + scope.apphome + "/components/annotations/json/viewassets.json?id=" + scope.collectionid,
		async: false,
		error: function(data, status, err) {
			console.log('from error:', data);
		},
		success: function(data) {
			console.log('from success:', data);
			scope.add('assets', data);
		},
		failure: function(errMsg) {
			alert(errMsg);
		}
	});


}

	//socket initialization
	if (window.WebSocket) {
		socket = WebSocket;
	} else if (window.MozWebSocket) {
		socket = MozWebSocket;
	} else {
		"We're screwed";
		socket = null;
	}

	if (socket)
	{
		base_destination = "ws://localhost:8080/entermedia/services/websocket/echoProgrammatic";
		final_destination = "" + base_destination + "?catalogid=" + scope.catalogid + "&collectionid=" + scope.collectionid;
		connection = new socket(final_destination);
		connection.onopen = function(e) {
			console.log('Opened a connection!');
			console.log(e);
		};
		connection.onclose = function(e) {
			console.log('Closed a connection!');
			console.log(e);
		};
		connection.onerror = function(e) {
			console.log('Connection error!');
			console.log(e);
		};
		scope.add('connection', connection);
	}

	
	//load user data
	/*
	$.getJSON( '/entermedia/services/json/users/status.json', function(data) {
		console.log('from user auth:', data);
		scope.add('currentUser', 	jAngular.init(scope);
		data);
	});
	*/

	$.getScript(scope.apphome + "/components/annotations/ajax/FabricModel.js");



	loadModels(scope);
	
	loadSelectors(scope);
	
	jAngular.init(scope);
	
	//we should have selected set from the model
	//scope.fabric.showImage(scope.apphome + "/views/modules/asset/downloads/preview/large/" + scope.selectedAsset.sourcepath + "/image.jpg");


});