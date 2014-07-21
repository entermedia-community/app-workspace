Workspace.factory 'annotationSocket',
['socketFactory',
(socketFactory) ->
	mySocket = io.connect '/some/path', 'force new connection': true

	theSocket = socketFactory ioSocket: mySocket

	theSocket
]


# angular.module('myApp', [
#   'btford.socket-io'
# ]).
# factory('mySocket', function (socketFactory) {
#   var myIoSocket = io.connect('/some/path');

#   mySocket = socketFactory({
#     ioSocket: myIoSocket
#   });

#   return mySocket;
# });