Workspace.factory 'toolkitService',
() ->
	init: (scopevar) ->
		getSelf = (name) ->
			_.find(toolkit, name: name)

		toolkit = [
			{
				name: 'disabled'
				properties: {
					isDrawingMode: false
				}
				annotating: false,
			},
			{
				name: 'draw'
				properties: {
					isDrawingMode: true # this may be the only thing necessary
				}
				annotating: true
			},
			{
				name: 'move'
				properties: {
					isDrawingMode: false
				}
				annotating: false
			},
			{
				name: 'shape'
				properties: {
					isDrawingMode: false
				}
				annotating: true
				type: 'circle'
				# index of types is same as blanks, useful or dumb
				types: [
					{} =
						name: 'circle'
						type: fabric.Circle
						blank:
							radius: 1
							strokeWidth: 5
							selectable: false
							fill: ""
							originX: 'left'
							originY: 'top'
						drawparams: (pointer) ->
							radius: Math.abs scopevar.left - pointer.x
					{} =
						name: 'rectangle'
						type: fabric.Rect
						blank:
							height: 1
							width: 1
							strokeWidth: 5
							selectable: false
							fill: ""
							originX: 'left'
							originY: 'top'
						drawparams: (pointer) ->
							width: -scopevar.left + pointer.x
							height: -scopevar.top + pointer.y
				]
				events: {
					mouseup: (e, canvas) ->
						# not sure if this is best way to do this
						# do I even need to pass 'canvas' if it will be valid within executing scope?
						# definitely don't want to put a lot of junk on scopevar if I don't have to
						scopevar.mouseDown = false # theses scopevar properties are probably a really bad convention, but it works
					mousedown: (e, canvas) ->
						scopevar.mouseDown = true # gotta be a better way !!!
						pointer = canvas.getPointer e.e
						we = getSelf 'shape'
						type = _.findWhere scopevar.currentTool.types, name: scopevar.currentTool.type
						spec = type.blank
						spec.stroke = scopevar.colorpicker.hex    # this is how we avoid the stupid broken color problem
						spec.left = pointer.x
						spec.top = pointer.y
						shape = new type.type spec
						canvas.add shape
						em.unit
					objectadded: null
					mousemove: (e, canvas) ->
						if scopevar.mouseDown # just awful !!!
							we = getSelf('shape')
							pointer = canvas.getPointer e.e
							# need to find some way to get the shape now
							shape = canvas.getObjects()[canvas.getObjects().length-1]
							type = _.findWhere scopevar.currentTool.types, name: scopevar.currentTool.type
							shape.set type.drawparams pointer
							canvas.renderAll()
						em.unit
					}
				},
					{
						name: 'comment'
						properties: {
							isDrawingMode: false
						}
						annotating: true # this is possibly broken because currently the pin is placed at last object
						events: {
							mouseup: null # will want to put something here !!!
							mousedown: null
							objectadded: null # then we should fully integrate the
						}
					},
					{
						name: 'arrow' # see below $$$
						properties: {
							isDrawingMode: false
						}
						annotating: true
					},
					{
						name: 'text' # fabric has an existing text tool, need to find out how to use $$$
						properties: {
							isDrawingMode: false
						}
						annotating: true
					},
					{
						name: 'zoom' # this implementation sucks !!! $$$
						properties: {
							isDrawingMode :false
						}
						annotating: false
						events: {
							mouseup: null
							mousemove: (o, canvas) ->
								if scopevar.mouseDown
									# this just doesn't work very well !!!
									SCALE_FACTOR = 0.01
									pointer = canvas.getPointer o.e
									delta = scopevar.left - pointer.x
									objects = canvas.getObjects()
									# needs changes !!!
									delta = delta * SCALE_FACTOR
									transform = [1+delta,0,0,1+delta,0,0]
									console.log transform
									for klass in objects
										klass.transformMatrix = transform
										klass.setCoords()
									# can we also transform the canvas background?
									canvas.backgroundImage.transformMatrix = transform  # works
									canvas.setWidth canvas.backgroundImage.width * canvas.backgroundImage.transformMatrix[0]
									canvas.setHeight canvas.backgroundImage.height * canvas.backgroundImage.transformMatrix[3]
									# apparently, yes!
									# works great but doesn't affect pins yet
							mousedown: (o, canvas) ->
								scopevar.left = canvas.getPointer(o.e).x
						}
					},
					{
						name: 'colorpicker' # no implementation $$$
						properties: {}
						annotating: false
					},
					{
						name: 'load' # temporary?
						properties: {}
						annotating: false
					},
					{
						name: 'export'
						properties: {}
						annotating: false
					}
		]