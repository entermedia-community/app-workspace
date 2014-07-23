Workspace.controller 'AnnotationDetailsCtrl',
['$rootScope', '$scope', '$stateParams', '$timeout', 'toolkitService', 'fabricJsService', 'annotationSocket', 'collectionAssetData'
($rootScope, $scope, $stateParams, $timeout, toolkitService, fabricJsService, annotationSocket, collectionAssetData) ->

	$rootScope.$broadcast 'navigatedTo', 'Annotations'
	# annotationSocket.forward 'updateAnnotationResponse', $scope
	# annotationSocket.forward 'removeAnnotationResponse', $scope
	###
	USER AUTHENTICATION LOGIC
	###

	# check validity of user object and do whatever necessary if not authenticated

	# if not metaUser.authenticated

	metaUser =
		userid: 1
		name: 'Rob'
		email: md5 'jrchipman1@gmail.com'

	$scope.currentUser = metaUser

	$.getJSON '/entermedia/services/json/users/status.json', (data) ->
			$scope.currentUser = data
			console.log 'from user auth:', data
			em.unit

	###
	/ USER AUTHENTICATION LOGIC
	###


	###
	INITIALIZE CANVAS
	###

	fromExistingState = true  # debug var for EM integration testing TODO: remove

	$scope.pushAnnotation = (annotation) ->
		fabric.util.enlivenObjects annotation.group, (group) ->
			origRenderOnAddRemove = $scope.fabric.canvas.renderOnAddRemove
			# looks like we have to change this canvas setting so the errors don't kill us
			$scope.fabric.canvas.renderOnAddRemove = false
			_.forEach group, (item) ->
				$scope.fabric.canvas.add item
			$scope.fabric.canvas.renderOnAddRemove = origRenderOnAddRemove
			$scope.fabric.canvas.renderAll()
			em.unit
		$scope.annotations.unshift annotation
		$scope.$apply()
		em.unit


	# $scope.currentAnnotation = _.find annotationService.mockData,
	# (item) ->
	# 	item.annotation.id is parseInt $stateParams.annotationID
	$scope.currentAnnotation = _.find collectionAssetData.assetData, (item) ->
		item.annotation.id is $stateParams.annotationID
	# uses init function to create the fabric environment
	$scope.fabric = fabricJsService.init "#{apphome}/views/modules/asset/downloads/preview/large/#{$scope.currentAnnotation.annotation.sourcepath}/image.jpg"

	if fromExistingState # TODO: remove
		$.getJSON "#{apphome}/components/annotations/json/dummyAnnotationData.json", (data) ->
			for annotation in data
				$scope.pushAnnotation annotation
	
	###
	instead of dummy state we must actually check the database
	for annotations on this asset before proceeding, and update the
	application state if necessary
	TODO: turn annotationService into a real anotation service instead of dummy object service
	TODO: wire up websocket connection code into factory and make connection available to angular
	TODO: remove/rewrite sloppy JSON stuff to act more like a sensible API

	###


	###
	/ INITIALIZE CANVAS
	###

	$scope.selectable = false
	$scope.canSelect = () -> $scope.selectable
	$scope.colorpicker =
		hex: '#000fff'
	$scope.brushWidth = 5
	$scope.mouseDown = null
	$scope.left = 0 # !!!
	$scope.top = 0 # !!!
	$scope.currentAnnotationIndex = 1 # should probably be deprecated to have annotation index tied to comment index
	$scope.newCommentText = null
	$scope.annotations = []	# holds all annotation groups (should be one per unique annotation w/ comment)
	$scope.eventIndex = 0
	$scope.annotationAction = null
	$scope.currentAnnotationGroup = []
	$scope.currentAnnotationGroupId = 0
	$scope.currentAssetId = 0
	$scope.images = collectionAssetData.images


	###
	FABRIC TOOLS SETUP
	###

	# getSelf = (name) ->
	# 	_.find(toolkit, name: name)

	# toolkit = [
	# 	{
	# 		name: 'disabled'
	# 		properties: {
	# 			isDrawingMode: false
	# 		}
	# 		annotating: false,
	# 	},
	# 	{
	# 		name: 'draw'
	# 		properties: {
	# 			isDrawingMode: true # this may be the only thing necessary
	# 		}
	# 		annotating: true
	# 	},
	# 	{
	# 		name: 'move'
	# 		properties: {
	# 			isDrawingMode: false
	# 		}
	# 		annotating: false
	# 	},
	# 	{
	# 		name: 'shape'
	# 		properties: {
	# 			isDrawingMode: false
	# 		}
	# 		annotating: true
	# 		type: 'circle'
	# 		# index of types is same as blanks, useful or dumb
	# 		types: [
	# 			{} =
	# 				name: 'circle'
	# 				type: fabric.Circle
	# 				blank:
	# 					radius: 1
	# 					strokeWidth: 5
	# 					selectable: false
	# 					fill: ""
	# 					originX: 'left'
	# 					originY: 'top'
	# 				drawparams: (pointer) ->
	# 					radius: Math.abs $scope.left - pointer.x
	# 			{} =
	# 				name: 'rectangle'
	# 				type: fabric.Rect
	# 				blank:
	# 					height: 1
	# 					width: 1
	# 					strokeWidth: 5
	# 					selectable: false
	# 					fill: ""
	# 					originX: 'left'
	# 					originY: 'top'
	# 				drawparams: (pointer) ->
	# 					width: -$scope.left + pointer.x
	# 					height: -$scope.top + pointer.y
	# 		]
	# 		events: {
	# 			mouseup: (e, canvas) ->
	# 				# not sure if this is best way to do this
	# 				# do I even need to pass 'canvas' if it will be valid within executing scope?
	# 				# definitely don't want to put a lot of junk on $scope if I don't have to
	# 				$scope.mouseDown = false # theses $scope properties are probably a really bad convention, but it works
	# 			mousedown: (e, canvas) ->
	# 				$scope.mouseDown = true # gotta be a better way !!!
	# 				pointer = canvas.getPointer e.e
	# 				we = getSelf 'shape'
	# 				type = _.findWhere $scope.currentTool.types, name: $scope.currentTool.type
	# 				spec = type.blank
	# 				spec.stroke = $scope.colorpicker.hex	# this is how we avoid the stupid broken color problem
	# 				spec.left = pointer.x
	# 				spec.top = pointer.y
	# 				shape = new type.type spec
	# 				canvas.add shape
	# 				em.unit
	# 			objectadded: null
	# 			mousemove: (e, canvas) ->
	# 				if $scope.mouseDown # just awful !!!
	# 					we = getSelf('shape')
	# 					pointer = canvas.getPointer e.e
	# 					# need to find some way to get the shape now
	# 					shape = canvas.getObjects()[canvas.getObjects().length-1]
	# 					type = _.findWhere $scope.currentTool.types, name: $scope.currentTool.type
	# 					shape.set type.drawparams pointer
	# 					canvas.renderAll()
	# 				em.unit
	# 			}
	# 		},
	# 			{
	# 				name: 'comment'
	# 				properties: {
	# 					isDrawingMode: false
	# 				}
	# 				annotating: true # this is possibly broken because currently the pin is placed at last object
	# 				events: {
	# 					mouseup: null # will want to put something here !!!
	# 					mousedown: null
	# 					objectadded: null # then we should fully integrate the
	# 				}
	# 			},
	# 			{
	# 				name: 'arrow' # see below $$$
	# 				properties: {
	# 					isDrawingMode: false
	# 				}
	# 				annotating: true
	# 			},
	# 			{
	# 				name: 'text' # fabric has an existing text tool, need to find out how to use $$$
	# 				properties: {
	# 					isDrawingMode: false
	# 				}
	# 				annotating: true
	# 			},
	# 			{
	# 				name: 'zoom' # this implementation sucks !!! $$$
	# 				properties: {
	# 					isDrawingMode :false
	# 				}
	# 				annotating: false
	# 				events: {
	# 					mouseup: null
	# 					mousemove: (o, canvas) ->
	# 						if $scope.mouseDown
	# 							# this just doesn't work very well !!!
	# 							SCALE_FACTOR = 0.01
	# 							pointer = canvas.getPointer o.e
	# 							delta = $scope.left - pointer.x
	# 							objects = canvas.getObjects()
	# 							# needs changes !!!
	# 							delta = delta * SCALE_FACTOR
	# 							transform = [1+delta,0,0,1+delta,0,0]
	# 							console.log transform
	# 							for klass in objects
	# 								klass.transformMatrix = transform
	# 								klass.setCoords()
	# 							# can we also transform the canvas background?
	# 							canvas.backgroundImage.transformMatrix = transform  # works
	# 							canvas.setWidth canvas.backgroundImage.width * canvas.backgroundImage.transformMatrix[0]
	# 							canvas.setHeight canvas.backgroundImage.height * canvas.backgroundImage.transformMatrix[3]
	# 							# apparently, yes!
	# 							# works great but doesn't affect pins yet
	# 					mousedown: (o, canvas) ->
	# 						$scope.left = canvas.getPointer(o.e).x
	# 				}
	# 			},
	# 			{
	# 				name: 'colorpicker' # no implementation $$$
	# 				properties: {}
	# 				annotating: false
	# 			},
	# 			{
	# 				name: 'load' # temporary?
	# 				properties: {}
	# 				annotating: false
	# 			},
	# 			{
	# 				name: 'export'
	# 				properties: {}
	# 				annotating: false
	# 			}
	# ]

	# $scope.fabric.toolkit = toolkit # in case it needs to be accessible from other controllers
	$scope.fabric.toolkit = toolkitService.init $scope

	###
	/ FABRIC TOOLS SETUP
	###

	###
	JSON IMPORT/EXPORT LOGIC
	###

	# Moved stuff to collectionAssetData service

	# $scope.loadImages = () ->
	# 	# markers = {
	# 	# 	"query": [
	# 	# 		{
	# 	# 			"field": ""
	# 	# 			"operator": "matches"
	# 	# 			"values": ["*"]
	# 	# 		}
	# 	# 	]
	# 	# }
	# 	imageArray = []

	# 	# applicationid = /emsite/workspace -- this is already added by the ajax request
	# 	# #{applicationid}/views/modules/asset/downloads/preview/thumbsmall/#{obj.sourcepath}/thumb.jpg
	# 	# the above should be the actual location of the thumbnail image
	# 	# this worked once:
	# 	# "/entermedia/services/json/search/data/asset?catalogid=media/catalogs/public"

	# 	# this is what emshare's asset thumb is:
	# 	# localhost:8080/emshare/views/modules/asset/downloads/preview/thumbsmall/#{obj.sourcepath}/thumb.jpg
	# 	# this all temporarily works, but it isn't the way it should be in the end

	# 	debugVar = $.ajax {
	# 		type: "GET"
	# 		url: "#{apphome}/components/annotations/json/viewassets.json?id=#{collectionid}"
	# 		# contentType: "application/json; charset=utf-8"
	# 		# dataType: "json"
	# 		async: false
	# 		error: (data, status, err) ->
	# 			console.log 'from error:', data
	# 			em.unit
	# 		,	
	# 		success: (data) ->
	# 			console.log 'from success:', data
	# 			imageArray = data
	# 			em.unit
	# 		,
	# 		failure: (errMsg) ->
	# 			alert errMsg
	# 			em.unit
	# 		}
	# 	console.log 'from finish:', imageArray	
	# 	imageArray


	$scope.exportCanvas = () ->
		data = JSON.stringify $scope.fabric.canvas.toJSON()
		$.ajax {
			type: "POST"
			url: "services/json/search/data/annotation?save=true?field=annotationid&field.value=#{$scope.currentAnnotation.id}&field=json&field.value=#{data}"
			success: (data) ->
				alert "Success!"
				em.unit
			,
			failure: (errMsg) ->
				alert errMsg
				em.unit
			}
		em.unit

	# $scope.thumbs = collectionAssetData.thumbs

	###
	/ JSON IMPORT/EXPORT LOGIC
	###

	###
	WEBSOCKET FUNCTIONS
	###

	# so to get/send information about the whole session, we'll need
	# to wrap the current list of annotations ($scope.annotations)
	# in an object that is aware of the collectionid and the catalogid

	# perhaps this is in a structure of:
	###
	{
	collectionid: n
	catalogid: n
	sessions: [
			{
			assetid: 1
			annotations: [obj, obj, ...]
			}
		]
	}

	###

	$scope.switchToAsset = (id) ->
		# we need to save current state and load new state
		console.log "Trying to switch to asset #{id}"
		# out = {
		# 	assetid: $scope.currentAssetId
		# 	command: 'saveall'
		# 	annotations: $scope.annotations
		# }
		# let's send a baby object instead... to deal with chunking
		out = {assetid: $scope.currentAssetId, command: 'debug'}
		console.log $scope.currentAnnotation
		payload = JSON.stringify out
		# console.log 'Trying to send saveall payload: ', payload		
		annotationSocket.send payload


	$scope.getAnnotationById = (id) ->
		_.findWhere $scope.annotations, id: id

	###
	TOOLBAR SELECTOR METHODS
	###

	$scope.shapeToolType = 'circle' # initialize shape selector to a valid state

	($scope.selectTool = (toolname) ->
		if not $scope.readyToComment
			$scope.currentTool = _.findWhere $scope.fabric.toolkit, name: toolname
			# do whatever else needs to happen !!!
			for prop of $scope.currentTool.properties
				$scope.fabric.canvas[prop] = $scope.currentTool.properties[prop]
			# this shit is broke !!!
			if $scope.currentTool.name is 'draw'
				$scope.fabric.canvas.freeDrawingBrush.color = $scope.colorpicker.hex
				$scope.fabric.canvas.freeDrawingBrush.width = $scope.brushWidth
		em.unit)('disabled')

	$scope.setShapeTypeFromUi = (type) ->
		$scope.currentTool = _.findWhere $scope.fabric.toolkit, name: 'shape'
		$scope.currentTool.type = type
		$scope.shapeToolType = $scope.currentTool.type
		for prop of $scope.currentTool.properties
			$scope.fabric.canvas[prop] = $scope.currentTool.properties[prop]
		em.unit


	# $scope.setApproval = (user, approvalState) ->
	# 	$scope.approvalHash[user] = approvalState # totally unsafe

	# $scope.getApprovals = () ->
	# 	(user for user of $scope.approvalHash when $scope.approvalHash[user] is true)

	# $scope.getRejections =
	# () ->
	# 	(user for user of $scope.approvalHash when $scope.approvalHash[user] is false)
	# _.contains(array, entry) -> bool is entry in array
	###
	This whole process is muddled, what should happen is simple:
	user clicks to draw a shape, that shape is added to the current group upon object:added
	a timeout function begins to check if they are done annotating
	if the user clicks again within a time window, the timeout function is cancelled
	repeat process until...
	user finishes annotation, they should be prompted for a comment
	a pin should be created and added into the annotationGroup data
	the pin should be rendered on screen somewhere appropriate and...
	the comment should be added to scope with annotationGroup data to be attached to comment
	###

	$scope.setShapeType = (type) ->
		if type is 'circle'
			$scope.currentTool.type = fabric.Circle
		else if type is 'rectangle'
			$scope.currentTool.type = fabric.Rect
		em.unit


	###
	/ TOOLBAR SELECTOR METHODS
	###

	commentPin = () ->
		# this needs to be fixed to use a properly bordered circle instead of two circles
		new fabric.Group [
			new fabric.Circle({
				radius: 18.5
				fill: "#fff"
			})

			new fabric.Circle({
				radius: 14
				fill: "#4fabe5"
				top: 5
				left: 5
			})
			,
			new fabric.Text $scope.currentAnnotationIndex.toString(),
				{
					fontSize: 20
					fill: "#fff"
					left: 13
					top: 4
				}
		],
			{
				evented: true
				top: $scope.top - 15
				left: $scope.left - 15
				lockScalingX: false
				lockScalingY: false
				selectable: true
			}

	readyToComment = () ->
		$scope.selectTool 'disabled'
		$scope.readyToComment = true
		$scope.fabric.canvas.isDrawingMode = false
		
		$timeout (() ->
			$('#user-comment-input').focus()
			em.unit
		), 100
		$('.upper-canvas').css({'background':'rgba(255,255,255,0.7)'})
		em.unit

	$scope.addComment = () ->
		pin = commentPin()
		$scope.fabric.canvas.add pin
		$scope.currentAnnotationGroup.push pin
		annotationSpec =
			id: $scope.currentAnnotationIndex++
			group: $scope.currentAnnotationGroup
			user: $scope.currentUser
			comment:
				type: 'normal'
				text: $scope.newCommentText
				timestamp: moment().fromNow()

		# now push annotation info to scope for longer-term tracking
		console.log 'Attempting to send annotation data.'
		$scope.annotations.unshift annotationSpec
		$scope.currentAnnotationGroup = []
		$scope.newCommentText = null
		$scope.readyToComment = false
		$('.upper-canvas').css({'background':'none'})
		$scope.left = null
		$scope.top = null
		# annotationSpec object describing individual annotation group is pushed to socket
		# annotationSocket.emit 'updateAnnotation', JSON.stringify annotationSpec
		payload = JSON.stringify {
				assetid: $scope.currentAssetId
				command: 'save'
				annotation: annotationSpec
			}
		console.log 'Trying to send add payload: ', payload
		annotationSocket.send payload
		em.unit

	$scope.removeComment = (annotationid) ->
		annotationToRemove = $scope.getAnnotationById annotationid

		# send request to server to remove annotation by id
		payload = JSON.stringify {
				assetid: $scope.currentAssetId
				command: 'delete'
				annotationid: annotationid
			}
		console.log 'Trying to send remove payload: ', payload
		annotationSocket.send payload

		# remove all local objects from canvas
		_.forEach annotationToRemove.group, (item) ->
			$scope.fabric.canvas.remove item

		# reset annotations model to remove comments from comment panel
		$scope.annotations = _.without $scope.annotations, annotationToRemove
		em.unit

	$scope.cancelComment = () ->
		_.forEach $scope.currentAnnotationGroup, (item) ->
			$scope.fabric.canvas.remove item
		$scope.readyToComment = false
		$scope.newCommentText = null
		$scope.currentAnnotationGroup = []
		$('.upper-canvas').css({'background':'none'})
		em.unit

	###
	FABRIC CANVAS EVENT HANDLERS
	###

	# This code uses the old socket.io socket after being redirected to Angular
	# Therefore its behavior will have to be adjusted to use the 
	# Websocket interface instead

	# Server raised events
	$scope.$on 'save', (e, data) ->
		# the data object is now the JSONified annotationSpec, let's rebuild
		# if this works, at least we know we can update the canvas, though this probably screws up anyone
		# who is currently annotating

		incomingAnnotation = JSON.parse data

		# reset annotation index to make sure no dupes
		incomingAnnotation.id = $scope.currentAnnotationIndex++

		$scope.pushAnnotation incomingAnnotation
		em.unit

	$scope.$on 'delete', (e, id) ->
		# id here is just the annotation id to remove
		# check annotations model to find all of the moving parts
		clientCopy = _.findWhere $scope.annotations, id: id
		console.log 'trying to remove this: ', id, ': ', clientCopy
		_.forEach clientCopy.group, (item) ->
			$scope.fabric.canvas.remove item
		$scope.annotations = _.without $scope.annotations, clientCopy
		em.unit

	# $scope.$on 'saveall', (e, data) ->
	# 	console.log '$scope got some data'
	# 	console.log e, data
	# 	em.unit

	$scope.$on 'debug', (e, data) ->
		console.log 'Scope debug listener: ', e, data
		em.unit

	$scope.fabric.canvas.on 'mouse:down', (e) ->
		pointer = $scope.fabric.canvas.getPointer e.e
		$scope.mouseDown = true
		$scope.left = pointer.x
		$scope.top = pointer.y
		if not $scope.readyToComment
			if $scope.annotationAction isnt null
				console.log 'canceling annotationAction'
				$timeout.cancel $scope.annotationAction
				# $scope.annotationAction = null
			# if $scope.currentTool.name is 'comment'
			# 	$scope.left = pointer.x
			# 	$scope.top = pointer.y
			console.log 'DOING SOMETHING!!! Something is wrong with disabled tool/ offset calculations'
			$scope.currentTool.events?.mousedown? e, $scope.fabric.canvas
		em.unit

	$scope.fabric.canvas.on 'mouse:up', (e) ->
		$scope.mouseDown = false
		if $scope.currentTool.annotating and not $scope.readyToComment
			if $scope.currentTool.name is 'comment'
				console.log 'Calling readyToComment() now'
				readyToComment()
			else
				console.log 'Calling delayed readyToComment()'
				$scope.annotationAction = $timeout readyToComment, 1000
		$scope.currentTool.events?.mouseup? e, $scope.fabric.canvas
		em.unit

	$scope.fabric.canvas.on 'mouse:move', (e) ->
		$scope.fabric.canvas.calcOffset()
		$scope.currentTool.events?.mousemove? e, $scope.fabric.canvas
		em.unit

	$scope.fabric.canvas.on 'object:added', (obj) ->
		if $scope.currentTool.annotating
			obj.target.selectable = $scope.canSelect() # this likely does not work anymore
			$scope.currentAnnotationGroup.push obj.target
		$scope.currentTool.events?.objectadded? obj, $scope.fabric.canvas
		# this may not be the best place for these, but it needs to happen somewhat regularly
		$scope.fabric.canvas.calcOffset()
		$scope.fabric.canvas.renderAll()
		$scope.left = obj.target.left if !$scope.left
		$scope.top = obj.target.top if !$scope.top
		em.unit
	em.unit

	###
	/ FABRIC CANVAS EVENT HANDLERS
	###
]
