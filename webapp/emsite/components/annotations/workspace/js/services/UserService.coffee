Workspace.factory 'UserService', () ->
	startSession: () ->
		userData = {}
		$.getJSON '/entermedia/services/json/users/status.json', (data) ->
			userData = data
			console.log 'from user auth:', data
			em.unit
		userData