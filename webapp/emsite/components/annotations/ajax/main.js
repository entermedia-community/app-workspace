//jAnqular controller
em = { //Old Junk
	unit: {}
};

var $scope = {};

	var parentScope;
	add = function(name, model) {
		$scope[name] = model;
	}
	get = function(name) 
	{
		var found = eval("this." + name);
		if( parentScope != null && found == null )
		{
			return parentScope.get(name);
		}
		return found;
		//return $scope[name];
	}
	createScope = function(parent)
	{
		parentScope = parent;
	}
	

jQuery(document).ready(function() 
{ 

	$scope.add("app", jQuery("#application") );
	$scope.add("home" ,$scope.app.data("home") );
	$scope.add("apphome" , $scope.app.data("apphome") );
	$scope.add("componentroot" ,$scope.app.data("home") );
	$scope.add("collectionid", $("#collectiontoplevel").data("collectionid") );
	$scope.add("catalogid" ,'emsite/catalog');
	
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
		final_destination = "" + base_destination + "?catalogid=" + $scope.catalogid + "&collectionid=" + $scope.collectionid;
		connection = new socket(final_destination);
		connection.onopen = function(e) {
			console.log('Opened a connection!');
			console.log(e);
			return em.unit;
		};
		connection.onclose = function(e) {
			console.log('Closed a connection!');
			console.log(e);
			return em.unit;
		};
		connection.onerror = function(e) {
			console.log('Connection error!');
			console.log(e);
			return em.unit;
		};
		$scope.add('connection', connection);
	}
	*/
	
	//load user data
	/*
	$.getJSON( '/entermedia/services/json/users/status.json', function(data) {
		console.log('from user auth:', data);
		$scope.add('currentUser', data);
		return em.unit;
	});
	*/
	
	// load asset data
	jQuery.ajax({
		type: "GET",
		url: "" + $scope.apphome + "/components/annotations/json/viewassets.json?id=" + $scope.collectionid,
		async: false,
		error: function(data, status, err) {
			console.log('from error:', data);
			return em.unit;
		},
		success: function(data) {
			console.log('from success:', data);
			$scope.add('assets', data);
			return em.unit;
		},
		failure: function(errMsg) {
			alert(errMsg);
			return em.unit;
		}
	});

	$.getScript($scope.apphome + "/components/annotations/ajax/FabricModel.js");
	$.getScript($scope.apphome + "/components/annotations/ajax/Replacer.js");
	
	var replacer = new Replacer();
	
	$( 'li[ng-repeat]' ).each(function( index ) 
	{
		var li = $(this);
		var vars = li.attr("ng-repeat");
		
		var rows = $scope.get("assets");  //TODO: Find the name
		
		//set a local scope of asset = rows[i];
		var content = li.html();
		li.html("");
		$.each(rows, function(index, value) {
			//TODO: replace scope variables
			var evalcontent = replacer.replace(content,$scope);
			
			li.append(content);
        });
		
	});
	
	
});	
