var FabricModel = function (scope) {
	var _this = null;
	var out = {
		canvas: null,
		scope: scope,
		lastClick: {
			left:0,
			top:0
		},
		findType: function(name) {
			var retval = null;
			$.each(_this.toolkit, function(index, item) {
				if (item.name == name) {
					retval = item;
					return false;
				}
			});
			return retval;
		},
		toolkit: [
			{
				name: 'disabled',
				properties: {
					isDrawingMode: false
				},
				annotating: false
			}, {
				name: 'draw',
				properties: {
					isDrawingMode: true
				},
				annotating: true
			}, {
				name: 'move',
				properties: {
					isDrawingMode: false
				},
				annotating: false
			}, {
				name: 'shape',
				properties: {
					isDrawingMode: false
				},
				annotating: true,
				type: 'circle',
				types: [
					{
						name: 'circle',
						type: fabric.Circle,
						blank: {
							radius: 1,
							strokeWidth: 5,
							selectable: false,
							fill: "",
							originX: 'left',
							originY: 'top'
						},
						drawparams: function(pointer) {
							var lastClick = _this.lastClick;
							return {
								radius: Math.abs(_this.lastClick.left - pointer.x)
							};
						}
					}, {
						name: 'rectangle',
						type: fabric.Rect,
						blank: {
							height: 1,
							width: 1,
							strokeWidth: 5,
							selectable: false,
							fill: "",
							originX: 'left',
							originY: 'top'
						},
						drawparams: function(pointer) {
							var lastClick = _this.lastClick;
							return {
								width: -lastClick.left + pointer.x,
								height: -lastClick.top + pointer.y
							};
						}
					}
				],
				events: {
					mouseup: null,
					mousedown: function(e, canvas) {
						var pointer, shape, spec, type, we;
						pointer = canvas.getPointer(e.e);
						we = _this.findType('shape');
						type = _.findWhere(scope.currentTool.types, {
							name: scope.currentTool.type
						});
						spec = type.blank;
						spec.stroke = scope.colorpicker.hex;
						spec.left = pointer.x;
						spec.top = pointer.y;
						shape = new type.type(spec);
						canvas.add(shape);
						
					},
					objectadded: null,
					mousemove: function(e, canvas) {
						var pointer, shape, type, we;
						pointer = canvas.getPointer(e.e);
						var mouseDown = e.e.which === 1;
						if (mouseDown) {
							we = _this.findType('shape');
							shape = canvas.getObjects()[canvas.getObjects().length - 1];
							type = _.findWhere(scope.currentTool.types, {
								name: scope.currentTool.type
							});
							shape.set(type.drawparams(pointer));
							canvas.renderAll();
						}
						
					}
				}
			}, {
				name: 'comment',
				properties: {
					isDrawingMode: false
				},
				annotating: true,
				events: {
					mouseup: null,
					mousedown: null,
					objectadded: null
				}
			}, {
				name: 'arrow',
				properties: {
					isDrawingMode: false
				},
				annotating: true
			}, {
				name: 'text',
				properties: {
					isDrawingMode: false
				},
				annotating: true
			}, {
				name: 'zoom',
				properties: {
					isDrawingMode: false
				},
				annotating: false,
				events: {
					mouseup: null,
					mousemove: function(e, canvas) {
						var SCALE_FACTOR, delta, klass, objects, pointer, transform, _i, _len, mouseDown;
						mouseDown = e.e.which === 1;
						if (mouseDown) {
							SCALE_FACTOR = 0.01;
							pointer = canvas.getPointer(e.e);
							delta = scope.left - pointer.x;
							objects = canvas.getObjects();
							delta = delta * SCALE_FACTOR;
							transform = [1 + delta, 0, 0, 1 + delta, 0, 0];
							// console.log(transform);
							for (_i = 0, _len = objects.length; _i < _len; _i++) {
								klass = objects[_i];
								klass.transformMatrix = transform;
								klass.setCoords();
							}
							canvas.backgroundImage.transformMatrix = transform;
							canvas.setWidth(canvas.backgroundImage.width * canvas.backgroundImage.transformMatrix[0]);
							canvas.setHeight(canvas.backgroundImage.height * canvas.backgroundImage.transformMatrix[3]);
						}
					},
					mousedown: function(e, canvas) {
						_this.lastClick.left = e.e.x;
						_this.lastClick.top = e.e.y;
					}
				}
			}, {
				name: 'colorpicker',
				properties: {},
				annotating: false
			}, {
				name: 'load',
				properties: {},
				annotating: false
			}, {
				name: 'export',
				properties: {},
				annotating: false
			}
		],
		setBackgroundImage: function(inPath) {
			fabric.util.loadImage(inPath, function(src) {
				var center, realImage, canvas;
				canvas = _this.canvas;
				realImage = new fabric.Image(src);
				canvas.setWidth(realImage.width);
				canvas.setHeight(realImage.height);
				// center = canvas.getCenter();
				canvas.setBackgroundImage(realImage, canvas.renderAll.bind(canvas));
			});
			
		},
		selectTool: function(toolname) {
		  var prop;
		  // if (scope.readyToComment != null) {
		  if (true) {
		    scope.currentTool = _.findWhere(scope.fabricModel.toolkit, {
		      name: toolname
		    });
		    for (prop in scope.currentTool.properties) {
		      _this.canvas[prop] = scope.currentTool.properties[prop];
		    }
		    if (scope.currentTool.name === 'draw') {
		      _this.canvas.freeDrawingBrush.color = scope.colorpicker.hex;
		      _this.canvas.freeDrawingBrush.width = 5;
		    }
		  }
		  
		},
		setShapeTypeFromUi: function(shapename) {
			_this.selectTool('shape');
			_this.scope.currentTool.type = shapename;
		},
		clearCanvas: function() {
			_this.canvas.clear();
			// _this.scope
		}
	} // end of out definition

	_this = out; // worth a try

	(function() {
		var canvas = _this.__canvas = new fabric.Canvas('annotation_canvas');
		canvas.on("after:render", function() {
			canvas.calcOffset();
		});
		// _this.setBackgroundImage(inPath);
		out.canvas = canvas;
	})();
	(function() {
		fabric.util.addListener(fabric.window, 'load', function() {
			var canvas, canvases, _i, _ref;
			canvas = _this.__canvas || _this.canvas;
			canvases = _this.__canvases || _this.canvases;
			canvas && canvas.calcOffset && canvas.calcOffset();
			if (canvases && canvases.length) {
				for (_i = 0, _ref = canvases.length; 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--) {
					canvases[i].calcOffset();
				}
			}
		})
	})();

   readyToComment = function() {
      scope.fabricModel.selectTool('disabled');
      //scope.fabricModel.readyToComment = true;
      scope.fabricModel.canvas.isDrawingMode = false;
     /*
      $timeout((function() {
        $('#user-comment-input').focus();
        return em.unit;
      }), 100);
      $('.upper-canvas').css({
        'background': 'rgba(255,255,255,0.7)'
      });
      return em.unit;
    */  
    };
 

	out.canvas.on('mouse:down', function(e) {
		var pointer, _ref;
		pointer = _this.canvas.getPointer(e.e);
		// scope.mouseDown = true;
		_this.lastClick.left = pointer.x;
		_this.lastClick.top = pointer.y;
		if (!scope.readyToComment) {
			if (scope.annotationAction !== null) {
				// console.log('canceling annotationAction');
				clearTimeout(scope.annotationAction);
			}
			// console.log('DOING SOMETHING!!! Something is wrong with disabled tool/ offset calculations');
			if ((_ref = scope.currentTool.events) != null) {
				if (typeof _ref.mousedown === "function") {
					_ref.mousedown(e, _this.canvas);
				}
			}
		}
		
	});

	out.canvas.on('mouse:up', function(e) {
		var _ref;
		// mouse down: e.e.which == 1
		// mouse not down: e.e.which == 0
		if (scope.currentTool.annotating && !scope.readyToComment) {
			if (scope.currentTool.name === 'comment') {
				// console.log('Calling readyToComment() now');
				readyToComment();
			} else {
				// console.log('Calling delayed readyToComment()');
				scope.annotationAction = setTimeout(readyToComment, 1000);
			}
		}
		if ((_ref = scope.currentTool.events) != null) {
			if (typeof _ref.mouseup === "function") {
				_ref.mouseup(e, _this.canvas);
			}
		}
		
	});

	out.canvas.on('mouse:move', function(e) {
		var _ref;
		// _this.canvas.calcOffset();
		if ((_ref = scope.currentTool.events) != null) {
			if (typeof _ref.mousemove === "function") {
				_ref.mousemove(e, _this.canvas);
			}
		}
		
	});

	out.canvas.on('object:added', function(obj) {
		var _ref;
		if (scope.currentTool.annotating) {
			//obj.target.selectable = scope.canSelect();
			scope.annotationEditor.fabricObjectAdded(obj.target);
			console.log("We called object:added event");
		}
		if ((_ref = scope.currentTool.events) != null) {
			if (typeof _ref.objectadded === "function") {
				_ref.objectadded(obj, _this.canvas);
			}
		}
		// _this.canvas.calcOffset();
		_this.canvas.renderAll();
		if (!_this.lastClick.left) {
			_this.lastClick.left = obj.target.left;
		}
		if (!_this.lastClick.top) {
			_this.lastClick.top = obj.target.top;
		}
		
	});

	return out;

}
