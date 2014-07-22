Workspace.factory 'annotationSocket', ['$rootScope', 
($rootScope) ->
	connection = null
	if window.WebSocket
			base_destination = "ws://localhost:8080/entermedia/services/websocket/echoProgrammatic"
			final_destination = "#{base_destination}?catalogid=#{catalogid}&collectionid=#{collectionid}"
			connection = new WebSocket final_destination
			connection.onopen = (e) ->
				console.log 'Opened a connection!'
				em.unit
			connection.onclose = (e) ->
				console.log 'Closed a connection!'
				em.unit
			connection.onerror = (e) ->
				console.log 'Connection error!'
				console.log e
				em.unit
			connection.onmessage = (e) ->
				console.log 'Received message'
				data = JSON.parse e.data
				$rootScope.$broadcast data.command, data
	connection
]