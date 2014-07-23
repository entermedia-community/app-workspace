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
	
	//$.getScript(scope.apphome + "/components/annotations/ajax/AnnotationModels.js");	
	loadModels(scope);
	
	loadSelectors(scope);
	
	jAngular.init(scope);
	
	//we should have selected set from the model
	//scope.fabric.showImage(scope.apphome + "/views/modules/asset/downloads/preview/large/" + scope.selectedAsset.sourcepath + "/image.jpg");
});	

loadSelectors = function(scope)
{
	//TODO: Search for all ng-click?
	$("div.annotations-carousel a img").livequery('click', function() 
	{
		var theimg = jQuery(this);
		var code = theimg.attr("ng-click");
		eval(code);
	});

}

loadModels = function(scope)
{

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


	//socket initialization
	if (window.WebSocket) {
		socket = WebSocket;
	} else if (window.MozWebSocket) {
		socket = MozWebSocket;
	} else {
		"We're screwed";
		socket = null;
	}
	/*
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
	*/
	
	//load user data
	/*
	$.getJSON( '/entermedia/services/json/users/status.json', function(data) {
		console.log('from user auth:', data);
		scope.add('currentUser', 	jAngular.init(scope);
		data);
	});
	*/
	
var $fabric = {
	init: function(path) {
		var returnCanvas;
		returnCanvas = {};
		(function() {
			var canvas, docGet;
			docGet = function(id) {
				return document.getElementById(id);
			};
			canvas = this.__canvas = new fabric.Canvas('annotation_canvas');
			canvas.on("after:render", function() {
			});
			fabric.util.loadImage(path, function(src) {
				var center, realImage;
				realImage = new fabric.Image(src);
				canvas.setWidth(realImage.width);
				canvas.setHeight(realImage.height);
				center = canvas.getCenter();
				canvas.setBackgroundImage(realImage, canvas.renderAll.bind(canvas));
			});
			returnCanvas = canvas;
		})();
		(function() {
			return fabric.util.addListener(fabric.window, 'load', function() {
				var canvas, canvases, _i, _ref;
				canvas = this.__canvas || this.canvas;
				canvases = this.__canvases || this.canvases;
				canvas && canvas.calcOffset && canvas.calcOffset();
				if (canvases && canvases.length) {
					for (_i = 0, _ref = canvases.length; 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--) {
						canvases[i].calcOffset();
					}
				}
			});
		})();
		return {
			canvas: returnCanvas
		};
	}
};
scope.add('fabric', $fabric);

}