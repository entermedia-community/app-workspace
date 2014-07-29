
//Controller
var AnnotationEditor = function(scope) {
	
	var out = {
		currentAnnotatedAsset : null,
		fabricModel: null,
		scope : scope,
		annotatedAssets: [],
		loadSelectors : function()
		{
			//TODO: Search for all ng-click?
			//TODO this should be part of jAnQular and loaded by $.getScript ?
			$("div.annotations-carousel a img[ng-click], ul.annotations-toolbar li[ng-click], div.comment-meta button[ng-click]").livequery('click', function() 
			{
				var theimg = jQuery(this);
				var code = theimg.attr("ng-click");
				console.log('Doing ng-click replacement:', code);
				// fabric = scope.fabric;	
				eval(code);
			});
			//then what is really in here?
		},
		loadModels : function()
		{
			var scope = this.scope;

			// $.getScript(scope.apphome + "/components/annotations/ajax/FabricModel.js", function()
			// {setCurrentAnnotatedAsset
			// 	console.log("Loaded" + scope.fabric );
			// });

			loadFabricModel(scope);
			// this may not be working
			
			// fabric = scope.fabric;
			


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
					if( data.length > 0 )
					{
						$.each(data, function(index, annotation)
						{
							var annotationToAdd = scope.annotationEditor.createAnnotatedAsset(annotation);
							scope.annotationEditor.annotatedAssets.push(annotationToAdd);
						});
						scope.annotationEditor.setCurrentAnnotatedAsset(scope.annotationEditor.annotatedAssets[0]);
					}
					var colors = ["#723421","#523421","#323421","#123421", "#fff000"];
			
					var colorpicker = {hex:colors[4]};
					scope.colorpicker = colorpicker;
					
					scope.annotationEditor.fabricModel.selectTool("draw");
					
				},
				failure: function(errMsg) {
					alert(errMsg);
				}
			});
		}
		,
		getAnnotationById: function(inAnnotationId) {
			var outAnnotation = null;
			$.each(scope.annotations, function(index, annotation)
			{
				if (annotation.id === inAnnotationId)
				{
					outAnnotation = annotation;
				}
			});
			return outAnnotation;
		}
		,
		removeAnnotation: function(annotationid) {
			console.log("Calling removeAnnotation with id", annotationid);
			var annotationToRemove = this.getAnnotationById(annotationid);
			var editor = this;
			$.each(annotationToRemove.fabricObjects, function(index, item)
			{
				editor.fabricModel.canvas.remove(item);
			});
			scope.annotations = editor.currentAnnotatedAsset.annotations = _.without(scope.annotations, annotationToRemove);
			jAngular.render(this.scope, "#annotationlist");
			
		}
		,
		createAnnotatedAsset: function(assetData)
		{
			var aa = new AnnotatedAsset();
			aa.assetData = assetData;
			aa.scope = scope;
			aa.annotations = [];
			//TODO: Get Annotations
			
			return aa;
		},
		setCurrentAnnotatedAsset: function(annotatedAsset) {
			this.currentAnnotatedAsset = annotatedAsset;
			//  appname    prefixmedium   sourcepath appendix
			var url = this.scope.apphome + "/views/modules/asset/downloads/preview/large/" + annotatedAsset.assetData.sourcepath + "/image.jpg";
			
			this.fabricModel.clearCanvas();

			this.fabricModel.setBackgroundImage(url);

			var editor = this;

			this.scope.annotations = annotatedAsset.annotations;
			$.each(editor.scope.annotations, function(index, annotation)
			{
				$.each(annotation.fabricObjects, function(index, item)
				{
					editor.fabricModel.canvas.add(item);
				});
				// fabric.util.enlivenObjects(annotation.fabricObjects, function(group)
				// {
				// 	origRenderOnAddRemove = this.scope.fabricModel.canvas.renderOnAddRemove
				// 	this.scope.fabricModel.canvas.renderOnAddRemove = false
				// 	$.each(group, function(index, item) {
				// 		this.scope.fabricModel.canvas.add(item);
				// 	});
				// 	this.scope.fabricModel.canvas.renderOnAddRemove = origRenderOnAddRemove;
				// });
			});
			this.scope.fabricModel.canvas.renderAll();
			jAngular.render(this.scope, "#annotationlist");
			// this method also needs to clear the canvas and comments and update from the persisted data
			// TODO: Clear canvas state, refresh with AnnotatedAsset data
			// TODO: Clear comments, refresh with AnnotatedAsset data


		},
		createNewAnnotation: function(annotatedAsset)
		{
			var annot = new Annotation();
			annot.user = "admin";
			annot.id = Math.floor(Math.random() * 100000000).toString();
			annot.indexCount = annotatedAsset.nextIndex();
			annot.date = new Date();
			return annot;
		},
		fabricObjectAdded: function(fabricObject)
		{
			if( this.currentAnnotatedAsset.currentAnnotation == null )
			{
				this.currentAnnotatedAsset.currentAnnotation = this.createNewAnnotation(this.currentAnnotatedAsset); //TODO: Init this with username
				
				this.currentAnnotatedAsset.pushAnnotation( this.currentAnnotatedAsset.currentAnnotation );
			}
			this.currentAnnotatedAsset.currentAnnotation.pushFabricObject(fabricObject);
			
			this.scope.add("annotations",this.currentAnnotatedAsset.annotations);
			
			jAngular.render(this.scope, "#annotationlist");

			// need to reset currentAnnotation ? When would we not want to make a new annotation?
			// the object:added event gets called seemingly more than it should

			this.currentAnnotatedAsset.currentAnnotation = null;
			
			//Update network?
		}
		,
		findAssetData: function(inAssetId)
		{
			var outAsset = null;
			$.each(this.scope.assets,function(index,asset)
			{
				if( asset.id == inAssetId )
				{
					outAsset = asset;
				}
			});
			return outAsset;
		}
		,
		getAnnotatedAsset: function(inAssetId) 
		{
			var outAsset = null;
			$.each(this.scope.annotationEditor.annotatedAssets,function(index,asset)
			{
				if( asset.assetData.id == inAssetId )
				{
					outAsset = asset;
				}
			});
			return outAsset;
		}
		,
		switchToAsset: function(inAssetId) {
			// if we have an annotatedAsset object already, we should use that
			// otherwise we have to make a new one.
			// make a new one for now since no data persists currently
			var toAsset = this.getAnnotatedAsset(inAssetId);
			this.setCurrentAnnotatedAsset(toAsset);
		}
		,
		connect : function()
		{
			//socket initialization
			if (window.WebSocket) {
				socket = WebSocket;
			} else if (window.MozWebSocket) {
				socket = MozWebSocket;
			} else {
				console.log("We're screwed");
				socket = null;
			}
		
			if (socket)
			{
				var scope = this.scope;
				var editor = this;
				base_destination = "ws://localhost:8080/entermedia/services/websocket/echoProgrammatic";
				final_destination = "" + base_destination + "?catalogid=" + scope.catalogid + "&collectionid=" + scope.collectionid;
				connection = new socket(final_destination);
				connection.onopen = function(e) {
					console.log('Opened a connection!');
					console.log(e);
					
					var command = SocketCommand("list");
					command.assetid = editor.currentAnnotatedAsset.assetData.id;
					connection.sendCommand(command);	
				};
				connection.onclose = function(e) {
					console.log('Closed a connection!');
					console.log(e);
				};
				connection.onerror = function(e) {
					console.log('Connection error!');
					console.log(e);
				};
			connection.sendCommand = function(command)
				{
					this.send( JSON.stringify(command));
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
		}
	}
	return out;
}	

var SocketCommand = function(inCommand) {
	var out = {
		command : inCommand,
		assetid: null,
		data: null
	};
	return out;	
}

var AnnotatedAsset = function() {	
	var out = {
		assetData: null,
		annotations : [],
		currentAnnotation: null,
		annotationIndex: 1,
		pushAnnotation: function( inAnnotation)
		{
			this.annotations.push( inAnnotation );
		},
		nextIndex: function() {
			return this.annotationIndex++;
		}
	};
	return out;	
}

var Annotation = function() {	
	var out = {
		id: null,
		indexCount: null,
		user: null,
		comment: "",
		date : [],
		fabricObjects: [],	
		getUserName: function()
		{
			return "demouser";
		},
		pushFabricObject: function( inObject )
		{
			this.fabricObjects.push( inObject );
		}
	};
	return out;	
}



var loadFabricModel = function(scope)
{
	var fabricModel = new FabricModel(scope);
	scope.annotationEditor.fabricModel = fabricModel;
	scope.add("fabricModel",fabricModel);

}