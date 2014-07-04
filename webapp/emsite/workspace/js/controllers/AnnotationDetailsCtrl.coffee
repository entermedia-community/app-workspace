# Workspace.controller 'AnnotationDetailsCtrl',
# ['$scope', '$stateParams', 'annotationService',
# ($scope, $stateParams, annotationService) ->
#     $scope.currentAnnotation = _.find annotationService.mockData,
#     (item) ->
#     	item.annotation.id is parseInt $stateParams.annotationID
#     em.unit
# ]


# working js file is located at AnnotationDetailsCtrl_orig.js
# this is a buggy CoffeeScript
Workspace.controller 'AnnotationDetailsCtrl',
['$rootScope', '$scope', '$stateParams', '$timeout', 'annotationService', 'fabricJsService',
($rootScope, $scope, $stateParams, $timeout, annotationService, fabricJsService) ->

	$rootScope.$broadcast 'navigatedTo', 'Annotations'
	$scope.selectable = false
	$scope.canSelect = () -> $scope.selectable
	$scope.color = '#000fff'
	$scope.brushWidth = 5
	self.mouseDown = null # look I defined this here in the controller, this is probably bad !!!
	self.origX = 0 # !!!
	self.origY = 0 # !!!
	$scope.currentCommentIndex = 1 # should probably be deprecated to have annotation index tied to comment index
	$scope.newCommentText = null
	$scope.annotations = []		# holds all annotation groups (should be one per unique annotation w/ comment)
	metaUser =
		type: 'normal'
		name: 'Rob'
		email: md5 'jrchipman1@gmail.com'
		id: 1

	$scope.currentUser = metaUser
	$scope.events = []			# events attribute holds information about the unique event
	$scope.comments = [] # probably deprecated
	# $scope.thumbs = []
	# $scope.approvalHash = {} # empty obj for user: approval kv pairs

	$scope.thumbs = [
		{ name: 'Maybe Art', src: 'img/BlueBus.jpg', id: 104 }
		{ name: 'Stupid Art', src: 'img/ForMom.jpg', id: 101 }
		{ name: 'Nice Art', src: 'img/FenceDog.jpg', id: 102 }
		{ name: 'Great Art', src: 'img/TigerTug.jpg', id: 103 }
	]



	# comment =
	# {
	# 	type: 'normal'
	# 	name: 'Rob'
	# 	email: md5 'jrchipman1@gmail.com'
	# 	text: 'This is a comment that some dude left on here. cool.'
	# 	annotationId: 3
	# 	timestamp: moment().fromNow()
	# }

	# comment2 =
	# {
	# 	type: 'normal'
	# 	name: 'Chris'
	# 	email: md5 'test@gmail.com'
	# 	text: 'Hey, what about the thing on the right here, don\'t forget to do the stuff.'
	# 	annotationId: 2
	# 	timestamp: moment().subtract('minutes', 30).fromNow()
	# }

	# comment3 =
	# {
	# 	type: 'normal'
	# 	name: 'Adam'
	# 	email: md5 'test@gmail.com'
	# 	text: 'I dont feel like the sky is as blue as it could be, perhaps we should revisit?'
	# 	annotationId: 1
	# 	timestamp: moment().subtract('days', 1).fromNow()
	# }

	# Highlights UI stuff, to be deleted
	# $scope.comments = [comment,comment2,comment3]
	# $scope.approved = [1..4]	# deprecated? unless property approach more favored in angular vs methods?
	# $scope.rejected = [1]		# deprecated? maybe not since method method doesn't work?
	# $scope.images = [1..6]		# deprecated but so is below line since thumb generation is free from EM
	applicationid = 'emsite/workspace'
	$scope.loadImages = () ->
		markers = {
			"query": [
				{
					"field": "id"
					"operator": "matches"
					"values": ["*"]
				}
			]
		}

		# applicationid = /emsite/workspace -- this is already added by the ajax request
		# #{applicationid}/views/modules/asset/downloads/preview/thumbsmall/#{obj.sourcepath}/thumb.jpg
		# the above should be the actual location of the thumbnail image
		# this worked once:
		# "/entermedia/services/json/search/data/asset?catalogid=media/catalogs/public"

		# this is what emshare's asset thumb is:
		# localhost:8080/emshare/views/modules/asset/downloads/preview/mediumplus/#{obj.sourcepath}/thumb.jpg
		# this all temporarily works, but it isn't the way it should be in the end

		# since JSON automatically adds the applicationid to the path, it doesn't get thumbs correctly
		# when my assets are on emshare and my app is on emsite, so I hacked it to work for now

		# catalogid = model
		# applicationid = frontend
		$.ajax {
			type: "POST"
			url: "/entermedia/services/json/search/data/asset?catalogid=media/catalogs/public"
			data: JSON.stringify markers
			contentType: "application/json; charset=utf-8"
			dataType: "json"
			async: false
			success: (data) ->
				tempArray = []
				$.each data.results, (index, obj) ->
					# this path should be changed according to the specifications above
					path = "/#{applicationid}/views/modules/asset/downloads/preview/thumbsmall/#{obj.sourcepath}/thumb.jpg"
					console.log path
					# $scope.thumbs.push path
					fabric.util.loadImage path, (src) ->
						console.log new fabric.Image(src)
						em.unit
					em.unit
				em.unit
			,
			failure: (errMsg) ->
				alert errMsg
				em.unit
			}
		em.unit

	$scope.exportCanvas = () ->
		jsonObject = $scope.fabric.canvas.toJSON()
		$.ajax {
			type: "POST"
			url: "/#{applicationid}/actions/saveannotation.html?save=true&field=userid&userid.value=#{$scope.currentUser.id}&field=json&json.value=#{JSON.stringify(jsonObject)}"
			async: false
			success: (data) ->
				alert "Not an error"
				em.unit
			,
			failure: (errMsg) ->
				alert errMsg
				em.unit
			}
		# annotation table in database

	$scope.removeComment = (annotationid) ->
		which = _.findWhere $scope.annotations, id: annotationid
		$scope.fabric.canvas.remove which.group
		$scope.annotations = _.without $scope.annotations, which
		em.unit
	$scope.addComment = () ->
		pin = commentPin()
		$scope.currentAnnotationGroup.push pin
		pinnedGroup = new fabric.Group $scope.currentAnnotationGroup
		console.log "pingroup: #{pinnedGroup.getObjects()}"
		console.log "annotationgroup: #{$scope.currentAnnotationGroup}"
		for obj in $scope.currentAnnotationGroup
			$scope.fabric.canvas.remove obj
		# pinnedGroup._restoreObjectsState()
		$scope.fabric.canvas.add pinnedGroup
		console.log "canvas: #{$scope.fabric.canvas.getObjects()}"
		# self.origX = null
		# self.origY = null
		annotationSpec =
			id: $scope.currentCommentIndex++
			group: pinnedGroup
			user: $scope.currentUser
			comment:
				type: 'normal'
				text: $scope.newCommentText
				timestamp: moment().fromNow()

		# now push annotation info to scope for longer-term tracking
		# console.log annotationSpec
		$scope.annotations.unshift annotationSpec
		$scope.currentAnnotationGroup = []
		$scope.newCommentText = null
		$scope.readyToComment = false
		em.unit

	$scope.selectTool = (toolname) ->
		$scope.currentTool = _.findWhere $scope.fabric.toolkit, name: toolname
		# do whatever else needs to happen !!!
		for prop of $scope.currentTool.properties
			$scope.fabric.canvas[prop] = $scope.currentTool.properties[prop]
		# this shit is broke !!!
		if $scope.currentTool.name is 'draw'
			$scope.fabric.canvas.freeDrawingBrush.color = $scope.color
			$scope.fabric.canvas.freeDrawingBrush.width = $scope.brushWidth
		em.unit

	# $scope.setApproval = (user, approvalState) ->
	# 	$scope.approvalHash[user] = approvalState # totally unsafe

	# $scope.getApprovals = () ->
	# 	(user for user of $scope.approvalHash when $scope.approvalHash[user] is true)

	# $scope.getRejections =
	# () ->
	# 	(user for user of $scope.approvalHash when $scope.approvalHash[user] is false)
	usefulKeys = ['']			# i dunno
	$scope.currentAnnotation = _.find annotationService.mockData,
	(item) ->
		item.annotation.id is parseInt $stateParams.annotationID
	# uses init function to create the fabric environment
	$scope.fabric = fabricJsService.init $scope.currentAnnotation.annotation.path
	$scope.selectTool 'draw'
	$scope.eventIndex = 0
	$scope.annotationAction = null
	$scope.currentAnnotationGroup = []
	$scope.currentAnnotationGroupId = 0
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
	$scope.cancelComment = () ->
		console.log $scope.currentAnnotationGroup
		console.log $scope.currentAnnotationGroupId
		console.log $scope.currentCommentIndex
		console.log $scope.annotations



	commentPin = () ->
		# should handle this drop point some better way
		# currently this method does not support the use of the comment tool (irony)

		# also this needs to be fixed to use a properly bordered circle instead of two circles
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
			new fabric.Text $scope.currentCommentIndex.toString(),
				{
					fontSize: 20
					fill: "#fff"
					left: 13
					top: 4
				}
		],
			{
				evented: false
				top: self.origX
				left: self.origY
				lockScalingX: false
				lockScalingY: false
				selectable: (() -> $scope.selectable)()
				# originX: 'center'
				# originY: 'center'
			}

	timeoutFunc = () ->
		$scope.events.push {id: $scope.eventIndex += 1,  text: 'Object added!'}
		# lazy prompting and comment addition
		$scope.readyToComment = true
		$timeout (() -> $('#user-comment-input').focus()), 100
		$scope.selectTool 'disabled'
		$scope.$apply()  # is this even necessary here?
		em.unit

	$scope.fabric.canvas.on 'mouse:down', (e) ->
		self.mouseDown = true
		if $scope.annotationAction isnt null
			$timeout.cancel $scope.annotationAction
		pointer = $scope.fabric.canvas.getPointer e.e
		self.origX = pointer.x
		self.origY = pointer.y
		$scope.currentTool.events?.mousedown? e, $scope.fabric.canvas
		em.unit

	$scope.fabric.canvas.on 'mouse:up', (e) ->
		self.mouseDown = false
		if $scope.currentTool.annotating
			$scope.annotationAction = $timeout timeoutFunc, 2000
		$scope.currentTool.events?.mouseup? e, $scope.fabric.canvas
		em.unit

	$scope.fabric.canvas.on 'mouse:move', (e) ->
		$scope.currentTool.events?.mousemove? e, $scope.fabric.canvas
		em.unit

	$scope.fabric.canvas.on 'object:added', (obj) ->
		if $scope.currentTool.annotating
			obj.target.selectable = (()-> $scope.selectable)()
			$scope.currentAnnotationGroup.push obj.target
		$scope.currentTool.events?.objectadded? obj, $scope.fabric.canvas
		# this may not be the best place for these, but it needs to happen somewhat regularly
		$scope.fabric.canvas.renderAll()
		$scope.fabric.canvas.calcOffset()
		self.origX = obj.target.top - 15 if !self.origX
		self.origY = obj.target.left - 15 if !self.origY
		em.unit
	em.unit
]
