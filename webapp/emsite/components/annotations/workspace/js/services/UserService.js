// Generated by CoffeeScript 1.4.0

Workspace.factory('UserService', function() {
  return {
    startSession: function() {
      var userData;
      userData = {};
      $.getJSON('/entermedia/services/json/users/status.json', function(data) {
        userData = data;
        console.log('from user auth:', data);
        return em.unit;
      });
      return userData;
    }
  };
});