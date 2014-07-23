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

if (window.WebSocket) {
  base_destination = "ws://localhost:8080/entermedia/services/websocket/echoProgrammatic";
  final_destination = "" + base_destination + "?catalogid=" + catalogid + "&collectionid=" + collectionid;
  connection = new WebSocket(final_destination);
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
  $scope.connection = connection;
}


