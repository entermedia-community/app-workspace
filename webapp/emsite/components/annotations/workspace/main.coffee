em = unit: {}
app = jQuery("#application");
home =  app.data("home");
apphome = home + app.data("apphome");
componentroot = apphome + '/components/annotations/workspace';
collectionid = $("#collectiontoplevel").data("collectionid");
catalogid = 'emsite/catalog'


if window.WebSocket
	base_destination = "ws://localhost:8080/entermedia/services/websocket/echoProgrammatic"
	final_destination = "#{base_destination}?catalogid=#{catalogid}&collectionid=#{collectionid}"
	connection = new WebSocket final_destination
	# if this works then we should be able to create our own endpoint
	connection.onopen = (e) ->
		console.log 'Opened a connection!'
		console.log e
		em.unit
	connection.onclose = (e) ->
		console.log 'Closed a connection!'
		console.log e
		em.unit
	connection.onerror = (e) ->
		console.log 'Connection error!'
		console.log e
		em.unit
	# Can we send something???

Workspace = angular.module('Workspace', ['ui.router', 'ngTable', 'colorpicker.module', 'btford.socket-io']);

Workspace.run [
	'$rootScope', '$state', '$stateParams', ($rootScope, $state, $stateParams) ->
		$rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams;
		em.unit
]
Workspace.config [
	'$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) ->
		$stateProvider.state 'app', 
			abstract: true
			views:
				'svgIncludes':
					templateUrl: componentroot + '/partials/svg/svg-definitions.tpl.html'
				'mainMenu':
					templateUrl: componentroot + '/partials/navigation/main-menu.tpl.html'
				'sidebar':
					templateUrl: componentroot + '/partials/navigation/sidebar.tpl.html'
					controller: 'SidebarCtrl'
		.state 'app.dashboard', 
			url: '/'
			views:
				'mainContentArea@':
					templateUrl: componentroot + '/partials/dashboard/dashboard.tpl.html'
					controller: 'DashboardCtrl'
		.state 'app.annotations', 
			url: '/annotations'
			views:
				'mainContentArea@':
					templateUrl: componentroot + '/partials/annotations/annotations.tpl.html'
					controller: 'AnnotationCtrl'
		.state 'app.annotations.details', 
			url: '/:annotationID'
			views:
				'mainContentArea@':
					templateUrl: componentroot + '/partials/annotations/annotation-details.tpl.html'
					controller: 'AnnotationDetailsCtrl'
		.state 'app.projects', 
			url: '/projects'
			views:
				'mainContentArea@':
					templateUrl: componentroot + '/partials/projects/projects.tpl.html'
					controller: 'ProjectCtrl'
		.state 'app.projects.details', 
			url: '/:projectID'
			views:
				'mainContentArea@':
					templateUrl: componentroot + '/partials/projects/project-details.tpl.html'
					controller: 'ProjectDetailsCtrl'
		.state 'app.programs', 
			url: '/#/'
			views:
				'mainContentArea@':
					templateUrl: componentroot + '/partials/projects/program-details.tpl.html'
					controller: 'ProgramDetailsCtrl'
		.state 'app.libraries', 
			url: '/#/'
			views:
				'mainContentArea@':
					templateUrl: componentroot + '/partials/projects/library-details.tpl.html'
					controller: 'LibraryDetailsCtrl'
		.state 'app.collections', 
			url: '/#/'
			views:
				'mainContentArea@':
					templateUrl: componentroot + '/partials/projects/collection-details.tpl.html'
					controller: 'CollectionDetailsCtrl'
		em.unit
]
