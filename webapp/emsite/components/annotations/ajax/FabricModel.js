var $fabric = {
	init: function(path) {
		var returnCanvas;
		returnCanvas = {};
		(function() {
			var canvas, docGet;
			docGet = function(id) {
				return document.getElementById(id);
			};
			canvas = this.__canvas = new fabric.Canvas('annotation_canvas');
			canvas.on("after:render", function() {
			});
			this.setBackgroundImage(path);
			returnCanvas = canvas;
		})();
		(function() {
			return fabric.util.addListener(fabric.window, 'load', function() {
				var canvas, canvases, _i, _ref;
				canvas = this.__canvas || this.canvas;
				canvases = this.__canvases || this.canvases;
				canvas && canvas.calcOffset && canvas.calcOffset();
				if (canvases && canvases.length) {
					for (_i = 0, _ref = canvases.length; 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--) {
						canvases[i].calcOffset();
					}
				}
			});
		})();
		return {
			canvas: returnCanvas
		};
	},
	sendMessage: function(message) {
		scope.connection.send(message);
		return em.unit;
	},
	setBackgroundImage: function(path) {
		fabric.util.loadImage(path, function(src) {
			var center, realImage;
			realImage = new fabric.Image(src);
			canvas.setWidth(realImage.width);
			canvas.setHeight(realImage.height);
			// center = canvas.getCenter();
			canvas.setBackgroundImage(realImage, canvas.renderAll.bind(canvas));
		});
		return em.unit;
	},
	selectTool: function(toolname) {
      var prop;
      if (scope.readyToComment != null) {
        $scope.currentTool = _.findWhere($scope.fabric.toolkit, {
          name: toolname
        });
        for (prop in $scope.currentTool.properties) {
          $scope.fabric.canvas[prop] = $scope.currentTool.properties[prop];
        }
        if ($scope.currentTool.name === 'draw') {
          $scope.fabric.canvas.freeDrawingBrush.color = $scope.colorpicker.hex;
          $scope.fabric.canvas.freeDrawingBrush.width = $scope.brushWidth;
        }
      }
      return em.unit;
    }
};
scope.add('fabric', $fabric.init());

scope.fabric.canvas.on('mouse:down', function(e) {
	var pointer, _ref;
	pointer = scope.fabric.canvas.getPointer(e.e);
	scope.mouseDown = true;
	scope.left = pointer.x;
	scope.top = pointer.y;
	if (!scope.readyToComment) {
		if (scope.annotationAction !== null) {
			console.log('canceling annotationAction');
			$timeout.cancel(scope.annotationAction);
		}
		console.log('DOING SOMETHING!!! Something is wrong with disabled tool/ offset calculations');
		if ((_ref = scope.currentTool.events) != null) {
			if (typeof _ref.mousedown === "function") {
				_ref.mousedown(e, scope.fabric.canvas);
			}
		}
	}
	return em.unit;
});
scope.fabric.canvas.on('mouse:up', function(e) {
	var _ref;
	scope.mouseDown = false;
	if (scope.currentTool.annotating && !scope.readyToComment) {
		if (scope.currentTool.name === 'comment') {
			console.log('Calling readyToComment() now');
			readyToComment();
		} else {
			console.log('Calling delayed readyToComment()');
			scope.annotationAction = $timeout(readyToComment, 1000);
		}
	}
	if ((_ref = scope.currentTool.events) != null) {
		if (typeof _ref.mouseup === "function") {
			_ref.mouseup(e, scope.fabric.canvas);
		}
	}
	return em.unit;
});
scope.fabric.canvas.on('mouse:move', function(e) {
	var _ref;
	if (e.e.which) {
		console.log('MOUSEMOVE EVENT: ', e);
	}
	scope.fabric.canvas.calcOffset();
	if ((_ref = scope.currentTool.events) != null) {
		if (typeof _ref.mousemove === "function") {
			_ref.mousemove(e, scope.fabric.canvas);
		}
	}
	return em.unit;
});
scope.fabric.canvas.on('object:added', function(obj) {
	var _ref;
	if (scope.currentTool.annotating) {
		obj.target.selectable = scope.canSelect();
		scope.currentAnnotationGroup.push(obj.target);
	}
	if ((_ref = scope.currentTool.events) != null) {
		if (typeof _ref.objectadded === "function") {
			_ref.objectadded(obj, scope.fabric.canvas);
		}
	}
	scope.fabric.canvas.calcOffset();
	scope.fabric.canvas.renderAll();
	if (!scope.left) {
		scope.left = obj.target.left;
	}
	if (!scope.top) {
		scope.top = obj.target.top;
	}
	return em.unit;
});

scope.fabric.toolkit = {
		init: function(scopevar) {
			var getSelf, toolkit;
			getSelf = function(name) {
				return _.find(toolkit, {
					name: name
				});
			};
			return toolkit = [
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
								return {
									radius: Math.abs(scopevar.left - pointer.x)
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
								return {
									width: -scopevar.left + pointer.x,
									height: -scopevar.top + pointer.y
								};
							}
						}
					],
					events: {
						mouseup: function(e, canvas) {
							return scopevar.mouseDown = false;
						},
						mousedown: function(e, canvas) {
							var pointer, shape, spec, type, we;
							scopevar.mouseDown = true;
							pointer = canvas.getPointer(e.e);
							we = getSelf('shape');
							type = _.findWhere(scopevar.currentTool.types, {
								name: scopevar.currentTool.type
							});
							spec = type.blank;
							spec.stroke = scopevar.colorpicker.hex;
							spec.left = pointer.x;
							spec.top = pointer.y;
							shape = new type.type(spec);
							canvas.add(shape);
							return em.unit;
						},
						objectadded: null,
						mousemove: function(e, canvas) {
							var pointer, shape, type, we;
							if (scopevar.mouseDown) {
								we = getSelf('shape');
								pointer = canvas.getPointer(e.e);
								shape = canvas.getObjects()[canvas.getObjects().length - 1];
								type = _.findWhere(scopevar.currentTool.types, {
									name: scopevar.currentTool.type
								});
								shape.set(type.drawparams(pointer));
								canvas.renderAll();
							}
							return em.unit;
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
						mousemove: function(o, canvas) {
							var SCALE_FACTOR, delta, klass, objects, pointer, transform, _i, _len;
							if (scopevar.mouseDown) {
								SCALE_FACTOR = 0.01;
								pointer = canvas.getPointer(o.e);
								delta = scopevar.left - pointer.x;
								objects = canvas.getObjects();
								delta = delta * SCALE_FACTOR;
								transform = [1 + delta, 0, 0, 1 + delta, 0, 0];
								console.log(transform);
								for (_i = 0, _len = objects.length; _i < _len; _i++) {
									klass = objects[_i];
									klass.transformMatrix = transform;
									klass.setCoords();
								}
								canvas.backgroundImage.transformMatrix = transform;
								canvas.setWidth(canvas.backgroundImage.width * canvas.backgroundImage.transformMatrix[0]);
								return canvas.setHeight(canvas.backgroundImage.height * canvas.backgroundImage.transformMatrix[3]);
							}
						},
						mousedown: function(o, canvas) {
							return scopevar.left = canvas.getPointer(o.e).x;
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
			];
		}
	};
}