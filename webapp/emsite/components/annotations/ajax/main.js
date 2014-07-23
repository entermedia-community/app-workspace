var $scope, app, apphome, base_destination, catalogid, collectionid, componentroot, connection, em, final_destination, home;

app = jQuery("#application");

home = app.data("home");

em = {
	unit: {}
};

apphome = home + app.data("apphome");

componentroot = apphome + '/components/annotations/workspace';

collectionid = $("#collectiontoplevel").data("collectionid");

catalogid = 'emsite/catalog';

$scope.add = function(name, model) {
	$scope[name] = model;
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
	base_destination = "ws://localhost:8080/entermedia/services/websocket/echoProgrammatic";
	final_destination = "" + base_destination + "?catalogid=" + catalogid + "&collectionid=" + collectionid;
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

//load user data
$.getJSON '/entermedia/services/json/users/status.json', function(data) {
	console.log('from user auth:', data);
	$scope.add('currentUser', data);
	return em.unit;
}

// load asset data
$.ajax({
	type: "GET",
	url: "" + apphome + "/components/annotations/json/viewassets.json?id=" + collectionid,
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

