Workspace.factory('fabricJsService', function() {
  return {
    init: function(path) {
        var returnCanvas;
        var globscale = 1; // set global scaling, probably not needed but referenced in canvas.on("mouse:down")

        returnCanvas = {};

        (function () {
            var $ = function (id) {
                return document.getElementById(id)
            };

            var mouseDown, origX, origY, shape;
            var canvas = this.__canvas = new fabric.Canvas('annotation_canvas', {
                isDrawingMode: true,
                isShapeMode: false
            });

            canvas.on("after:render", function(){
                // this fixes the weird offset brush problem
                canvas.calcOffset();
            });

            // set background to asset image
            canvas.setBackgroundImage(path, canvas.renderAll.bind(canvas));
            //set current shape class to null
            canvas.currentShape = null;

            var drawingModeEl = $('drawing-mode'),
                drawingOptionsEl = $('drawing-mode-options'),
                drawingColorEl = $('drawing-color'),
                drawingShadowColorEl = $('drawing-shadow-color'),
                drawingLineWidthEl = $('drawing-line-width'),
                drawingShadowWidth = $('drawing-shadow-width'),
                drawingShadowOffset = $('drawing-shadow-offset'),
                clearEl = $('clear-canvas'),
                zoomEl = $('zoom-tool'),
                imageJSONEl = $('image-to-json');

            clearEl.onclick = function () {
                canvas.clear()
            };

            canvas.isZoomingMode = false;
            zoomEl.onclick = function() {
                canvas.isZoomingMode = !canvas.isZoomingMode;
                canvas.isDrawingMode = false;
                canvas.isShapeMode = false;
            };

            // let's see if we can make a toolbar selector to pick circles and rectangles
            
            $('shape-mode-selector').onchange = function() {

                // for now, sloppily make instructions for what the drawing handlers should do

                canvas.isDrawingMode = false;
                canvas.isShapeMode = true;

                if (this.value == "Circle") {
                    canvas.currentShape = fabric.Circle;
                    canvas.shapeSpec = {
                        radius: 1,
                        strokeWidth: 5,
                        stroke: 'red',
                        selectable: false,
                        fill: "",
                        originX: 'center',
                        originY: 'center'
                    }
                    canvas.drawParams = function(pointer) {
                        return {

                            radius: Math.abs(origX - pointer.x)
                        };
                    };
                }
                else if (this.value == "Rectangle") {
                    canvas.currentShape = fabric.Rect;
                    canvas.shapeSpec = {                 // set up properties for the current shape outside of the function
                        height: 1,
                        width: 1,
                        strokeWidth: 5,
                        stroke: 'red',
                        selectable: false,
                        fill: "",
                        originX: 'left',
                        originY: 'top'
                    };
                    canvas.drawParams = function(pointer) {
                        return {

                            width: -(origX - pointer.x),
                            height: -(origY - pointer.y)
                        };
                    };
                }
                else {
                    // do nothing, not possible yet
                    console.log("How did I get here?");
                }
            }
            /* 

            don't need this right now, this functionality should be handled by the toolbar current selection

            drawingModeEl.onclick = function () {
                canvas.isDrawingMode = !canvas.isDrawingMode;
                if (canvas.isDrawingMode) {
                    drawingModeEl.innerHTML = 'Cancel drawing mode';
                    drawingOptionsEl.style.display = '';
                }
                else {
                    drawingModeEl.innerHTML = 'Enter drawing mode';
                    drawingOptionsEl.style.display = 'none';
                }
            };
            */
            imageJSONEl.onclick = function () {

                // convert canvas to a json string

                var json = JSON.stringify(canvas.toJSON());

                console.log(json);

            };

            if (fabric.PatternBrush) {
                var vLinePatternBrush = new fabric.PatternBrush(canvas);
                vLinePatternBrush.getPatternSrc = function () {

                    var patternCanvas = fabric.document.createElement('canvas');
                    patternCanvas.width = patternCanvas.height = 10;
                    var ctx = patternCanvas.getContext('2d');

                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.moveTo(0, 5);
                    ctx.lineTo(10, 5);
                    ctx.closePath();
                    ctx.stroke();

                    return patternCanvas;
                };

                var hLinePatternBrush = new fabric.PatternBrush(canvas);
                hLinePatternBrush.getPatternSrc = function () {

                    var patternCanvas = fabric.document.createElement('canvas');
                    patternCanvas.width = patternCanvas.height = 10;
                    var ctx = patternCanvas.getContext('2d');

                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.moveTo(5, 0);
                    ctx.lineTo(5, 10);
                    ctx.closePath();
                    ctx.stroke();

                    return patternCanvas;
                };

                var squarePatternBrush = new fabric.PatternBrush(canvas);
                squarePatternBrush.getPatternSrc = function () {

                    var squareWidth = 10,
                        squareDistance = 2;

                    var patternCanvas = fabric.document.createElement('canvas');
                    patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
                    var ctx = patternCanvas.getContext('2d');

                    ctx.fillStyle = this.color;
                    ctx.fillRect(0, 0, squareWidth, squareWidth);

                    return patternCanvas;
                };

                var diamondPatternBrush = new fabric.PatternBrush(canvas);
                diamondPatternBrush.getPatternSrc = function () {

                    var squareWidth = 10,
                        squareDistance = 5;
                    var patternCanvas = fabric.document.createElement('canvas');
                    var rect = new fabric.Rect({
                        width: squareWidth,
                        height: squareWidth,
                        angle: 45,
                        fill: this.color
                    });

                    var canvasWidth = rect.getBoundingRectWidth();

                    patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
                    rect.set({
                        left: canvasWidth / 2,
                        top: canvasWidth / 2
                    });

                    var ctx = patternCanvas.getContext('2d');
                    rect.render(ctx);

                    return patternCanvas;
                };

                var img = new Image();
                img.src = 'http://www.entropiaplanets.com/w/images/c/cd/Warning_sign.png';
                // was ../assets/honey_im_subtle.png
                var texturePatternBrush = new fabric.PatternBrush(canvas);
                texturePatternBrush.source = img;
            }

            $('drawing-mode-selector').onchange = function () {

                // drawing mode selection for this example is only expecting one tool
                // 'freeDrawingBrush', however we will need to switch back and forth between arbitrary
                // tools and cannot use this as the top-level indicator of which tool is selected
                // perhaps new methods that get/set current tool will be useful for later even handlers

                canvas.isShapeMode = false;
                canvas.isDrawingMode = true;

                if (this.value === 'hline') {
                    canvas.freeDrawingBrush = vLinePatternBrush;
                }
                else if (this.value === 'vline') {
                    canvas.freeDrawingBrush = hLinePatternBrush;
                }
                else if (this.value === 'square') {
                    canvas.freeDrawingBrush = squarePatternBrush;
                }
                else if (this.value === 'diamond') {
                    canvas.freeDrawingBrush = diamondPatternBrush;
                }
                else if (this.value === 'texture') {
                    canvas.freeDrawingBrush = texturePatternBrush;
                }
                else {
                    canvas.freeDrawingBrush = new fabric[this.value + 'Brush'](canvas);
                }

                if (canvas.freeDrawingBrush) {
                    canvas.freeDrawingBrush.color = drawingColorEl.value;
                    canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
                    canvas.freeDrawingBrush.shadowBlur = parseInt(drawingShadowWidth.value, 10) || 0;
                }
            };

            drawingColorEl.onchange = function () {
                canvas.freeDrawingBrush.color = this.value;
            };
            drawingShadowColorEl.onchange = function () {
                canvas.freeDrawingBrush.shadowColor = this.value;
            };
            drawingLineWidthEl.onchange = function () {
                canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
                this.previousSibling.innerHTML = this.value;
            };
            drawingShadowWidth.onchange = function () {
                canvas.freeDrawingBrush.shadowBlur = parseInt(this.value, 10) || 0;
                this.previousSibling.innerHTML = this.value;
            };
            drawingShadowOffset.onchange = function () {
                canvas.freeDrawingBrush.shadowOffsetX =
                    canvas.freeDrawingBrush.shadowOffsetY = parseInt(this.value, 10) || 0;
                this.previousSibling.innerHTML = this.value;
            };

            if (canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush.color = drawingColorEl.value;
                canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
                canvas.freeDrawingBrush.shadowBlur = 0;
            }

            /*
                Here's where we try to draw a circle. This is cheating somewhat since we never selected it with
                the toolbar, but it's a start.  Later the toolbar needs to enable the events, or we have an event handler
                that selects a function based on the currently selected tool
            */

            var shapeStart = function(o){
                var pointer;
                pointer = canvas.getPointer(o.e);
                origX = pointer.x;
                origY = pointer.y;

                /*
                    here is where general code needs to select the shape type and
                    parameters from the toolbar state
                    this will run only when a new shape is starting
                */

                canvas.shapeSpec.left = pointer.x;
                canvas.shapeSpec.top = pointer.y;
                shape = new canvas.currentShape(canvas.shapeSpec);

                canvas.add(shape);
            }
            var shapeDraw = function(o) {
                if (!mouseDown) return;
                var pointer = canvas.getPointer(o.e);
                shape.set(canvas.drawParams(pointer));

                canvas.renderAll();
            }

            /* 
                These above functions do very specific circle-drawing stuff, but
                general functionality will be preferred.  Currently they exist
                separately from the event handlers because the events need to have
                different behavior for different tasks
            */

            canvas.on('mouse:down', function(o){
                // select appropriate function based on selected tool
                // we need some var in the scope to keep track of 'active tool selection'
                // the value of this var will point to the function that should be passed to the event handlers
                // should the function be passed in directly or define another function that handles the
                // specialized event handling... if the latter, then the mouse event should control the
                // mouseDown variable exclusively to ensure no weird condition overlap
                mouseDown = true;
                if (canvas.isShapeMode) {
                    shapeStart(o);
                } else if (canvas.isZoomingMode) {
                    // Do zooming init
                    origX = canvas.getPointer(o.e).x;
                }
            });

            canvas.on('mouse:move', function(o){
                if (canvas.isShapeMode) {
                    // do the circle drawing action for now
                    shapeDraw(o);
                } else if (canvas.isZoomingMode) {
                    // handle zoom by drag
                    var SCALE_FACTOR = 1.1;
                    var pointer = canvas.getPointer(o.e)
                    var delta = origX - pointer.x;
                    var objects = canvas.getObjects();
                    var dd = 1;
                    if (delta == 5) dd=SCALE_FACTOR;
                    if (delta == -5) dd=1/SCALE_FACTOR;
                    globscale = globscale * dd;
                    for (var i in objects) {
                        objects[i].setCoords;
                        objects[i].scaleX = globscale;
                        objects[i].scaleY = globscale;
                        objects[i].left = objects[i].left * dd;
                        objects[i].top = objects[i].top * dd;
                        objects[i].setCoords;
                    }
                canvas.renderAll();
                canvas.calcOffset();
                }
            });

            canvas.on('mouse:up', function(o){
                // this is all that is needed here right now, eventually
                // the timeout function can handle comment posting
                mouseDown = false;
                console.log(canvas.isZoomingMode);
            });

            /* broken attempt at zooming with mousewheel */
            
            returnCanvas = canvas
        })();


        (function () {
            fabric.util.addListener(fabric.window, 'load', function () {
                var canvas = this.__canvas || this.canvas,
                    canvases = this.__canvases || this.canvases;

                canvas && canvas.calcOffset && canvas.calcOffset();

                if (canvases && canvases.length) {
                    for (var i = 0, len = canvases.length; i < len; i++) {
                        canvases[i].calcOffset();
                    }
                }
            });
        })();
      return {
        canvas: returnCanvas
      };
    }
  };
});
