(function (Highcharts) {

// Highcharts helper methods
var UNDEFINED,
        ALIGN_FACTOR,
        H = Highcharts,
        Chart = H.Chart,
        extend = H.extend,
        merge = H.merge,
        each = H.each,
        inArray = (window.HighchartsAdapter && window.HighchartsAdapter.inArray) || H.inArray, // #52, since Highcharts 4.1.10 HighchartsAdapter is only provided by the Highcharts Standalone Framework
        addEvent = H.addEvent,
        isOldIE = H.VMLRenderer ? true : false;

H.ALLOWED_SHAPES = ["path", "rect", "circle"];

ALIGN_FACTOR = {
        top: 0,
        left: 0,
        center: 0.5,
        middle: 0.5,
        bottom: 1,
        right: 1
};


H.SVGRenderer.prototype.symbols.line = function(x,y,w,h){
	var p = 2;
	return [
		'M', x + p, y + p, 'L', x + w - p, y + h - p
	];
};

H.SVGRenderer.prototype.symbols.text = function(x,y,w,h){
	var p = 1;
	return [
	  //'M', 0, 0, 'L', 10, 0, 'M', 5, 0, 'L', 5, 5
		'M', x, y + p, 'L', x + w, y + p,
		'M', x + w/2, y+p, 'L', x+w/2, y+p+h
	];
};
// VML fallback
if(H.VMLRenderer) {
	H.VMLRenderer.prototype.symbols.text = H.SVGRenderer.prototype.symbols.text;
	H.VMLRenderer.prototype.symbols.line = H.SVGRenderer.prototype.symbols.line;
}


// when drawing annotation, don't zoom/select place
H.wrap(H.Pointer.prototype, 'drag', function(c, e) {
	if(!this.chart.annotations || this.chart.annotations.allowZoom){
		c.call(this, e);
	}
});

// deselect active annotation
H.wrap(H.Pointer.prototype, 'onContainerMouseDown', function(c, e) {
		c.call(this,e);
		if(this.chart.selectedAnnotation) {
				this.chart.selectedAnnotation.events.deselect.call(this.chart.selectedAnnotation, e);
		}
});

// utils for buttons   
var utils = {
	getRadius: function(e) {
		var ann = this,
			chart = ann.chart, 
			bbox = chart.container.getBoundingClientRect(),
			x = e.clientX - bbox.left,
			y = e.clientY - bbox.top,
			xAxis = chart.xAxis[ann.options.xAxis],
			yAxis = chart.yAxis[ann.options.yAxis],
			dx = Math.abs(x - xAxis.toPixels(ann.options.xValue)),
			dy = Math.abs(y - yAxis.toPixels(ann.options.yValue));
			radius = parseInt(Math.sqrt(dx * dx + dy * dy), 10);
		ann.shape.attr({
			r: radius	
		});
		return radius;
	},
	getRadiusAndUpdate:	function(e) {
		var r = utils.getRadius.call(this, e);
		this.update({
			shape: {
				params: {
					r: r,
					x: -r,
					y: -r
				}
			}
		});
	},
	getPath: function(e) {
		var ann = this,
			chart = ann.chart, 
			bbox = chart.container.getBoundingClientRect(),
			x = e.clientX - bbox.left,
			y = e.clientY - bbox.top,
			xAxis = chart.xAxis[ann.options.xAxis],
			yAxis = chart.yAxis[ann.options.yAxis],
			dx = x - xAxis.toPixels(ann.options.xValue),
			dy = y - yAxis.toPixels(ann.options.yValue);
			
		var path = ["M", 0, 0, 'L', parseInt(dx, 10), parseInt(dy, 10)];	
		ann.shape.attr({
			d: path	
		});
			
		return path;
	},
	getPathAndUpdate: function(e) {
		var ann = this,
			chart = ann.chart, 
			path = utils.getPath.call(ann, e),
			xAxis = chart.xAxis[ann.options.xAxis],
			yAxis = chart.yAxis[ann.options.yAxis],
			x = xAxis.toValue(path[4] + xAxis.toPixels(ann.options.xValue)) ,
			y = yAxis.toValue(path[5] + yAxis.toPixels(ann.options.yValue)) ;
			
		this.update({
			xValueEnd: x,
			yValueEnd: y,
			shape: {
				params: {
					d: path	
				}
			}
		});
	},
	getRect: function(e) {
		var ann = this,
			chart = ann.chart, 
			bbox = chart.container.getBoundingClientRect(),
			x = e.clientX - bbox.left,
			y = e.clientY - bbox.top,
			xAxis = chart.xAxis[ann.options.xAxis],
			yAxis = chart.yAxis[ann.options.yAxis],
			sx = xAxis.toPixels(ann.options.xValue),
			sy = yAxis.toPixels(ann.options.yValue),
			dx = x - sx,
			dy = y - sy,
			w = Math.round(dx) + 1,
			h = Math.round(dy) + 1,
			ret = {};
			
		ret.x = w < 0 ? w : 0;
		ret.width = Math.abs(w);
		ret.y = h < 0 ? h : 0;
		ret.height = Math.abs(h);
					
		ann.shape.attr({
			x: ret.x,
			y: ret.y,
			width: ret.width,
			height: ret.height
		});
		return ret;
	},
	getRectAndUpdate: function(e) {
		var rect = utils.getRect.call(this, e);
		this.update({
			shape: {
				params: rect
			}
		});
	},
	getText: function(e) {
		// do nothing
	},
	showInput: function(e) {
		var ann = this,
				chart = ann.chart, 
				index = chart.annotationInputIndex = chart.annotationInputIndex ? chart.annotationInputIndex : 1,
				input =  document.createElement('span'),
				button;
				
		input.innerHTML = '<input type="text" class="annotation-' + index + '" placeholder="Add text"><button class=""> Done </button>';	
		input.style.position = 'absolute';		
		input.style.left = e.pageX + 'px';
		input.style.top = e.pageY + 'px';
		
		document.body.appendChild(input);
		input.querySelectorAll("input")[0].focus();
		button = input.querySelectorAll("button")[0];
		button.onclick = function() {
				var parent = this.parentNode;
				
				ann.update({
						title: {
								text: parent.querySelectorAll('input')[0].value
						}
				});
				parent.parentNode.removeChild(parent);
		};
		chart.annotationInputIndex++;
	}
}
        
function defaultOptions(shapeType) {
        var shapeOptions,
            options;

        options = {
			xAxis: 0,
			yAxis: 0,
			shape: {
				params: {
					stroke: "#000000",
					fill: "rgba(0,0,0,0)",
					'stroke-width': 2
				}
			}
        };

        shapeOptions = {
			circle: {
				params: {                 
					x: 0,
					y: 0
				}
			}
        };

        if (shapeOptions[shapeType]) {
			options.shape = merge(options.shape, shapeOptions[shapeType]);
        }

        return options;
}


function defatultMainOptions(){
	var buttons = [],
		shapes = ['circle', 'line', 'square', 'text'],
		types = ['circle', 'path', 'rect', null],
		params = [{
			r: 0,
			fill: 'rgba(255,0,0,0.4)',
			stroke: 'black'
		}, {
			d: ['M', 0, 0, 'L', 10, 10],
			fill: 'rgba(255,0,0,0.4)',
			stroke: 'black'
		}, {
			width: 10,
			height: 10,
			fill: 'rgba(255,0,0,0.4)',
			stroke: 'black'
		}],
		steps = [utils.getRadius, utils.getPath, utils.getRect, utils.getText],
		stops = [utils.getRadiusAndUpdate, utils.getPathAndUpdate, utils.getRectAndUpdate, utils.showInput];
		
	each(shapes, function(s, i) {
		buttons.push({
			annotationEvents: {
				step: steps[i],
				stop: stops[i]
			},
			annotation: {
				anchorX: 'left',
				anchorY: 'top',
				xAxis: 0,
				yAxis: 0,
				shape: {
					type: types[i],
					params: params[i]
				}
			},
			symbol: {
				shape: s,
				size: 12,
				style: {
					'stroke-width':  2,
					'stroke': 'black',
					fill: 'red',
					zIndex: 121
				}
			},
			style: {
				fill: 'black',
				stroke: 'blue',
				strokeWidth: 2
			},
			size: 12,
			states: {
				selected: {
					fill: '#9BD'
				},
				hover: {
					fill: '#9BD'
				}
			}
		});
	});
		
	return {
		enabledButtons: false,
		buttons: buttons,
		buttonsOffsets: [0, 0]
	};
}

function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
}

function isNumber(n) {
        return typeof n === 'number';
}

function defined(obj) {
        return obj !== UNDEFINED && obj !== null;
}

function translatePath(d, xAxis, yAxis, xOffset, yOffset) {
        var len = d.length,
                i = 0,
                path = [];

        while (i < len) {
                if (typeof d[i] === 'number' && typeof d[i + 1] === 'number') {
                        path[i] = xAxis.toPixels(d[i]) - xOffset;
                        path[i + 1] = yAxis.toPixels(d[i + 1]) - yOffset;
                        i += 2;
                } else {
                				path[i] = d[i];
                        i += 1;
                }
        }

        return path;
}

function createGroup(chart, i, clipPath){
		var group = chart.renderer.g("annotations-group-" + i);
		group.attr({
				zIndex: 7
		});
		group.add();
		group.clip(clipPath);
		return group;
}

function createClipPath(chart, y){
		var clipBox = {
				x: y.left,
				y: y.top,
				width: y.width,
				height: y.height
		};
				
		return chart.renderer.clipRect(clipBox);   
}

function attachEvents(chart) {
	function drag(e) {
		var bbox = chart.container.getBoundingClientRect(),
				clickX = e.clientX - bbox.left,
				clickY = e.clientY - bbox.top;
		
		if (!chart.isInsidePlot(clickX - chart.plotLeft, clickY - chart.plotTop) || chart.annotations.allowZoom) {
			return;
		}
		
		var xAxis = chart.xAxis[0],
			yAxis = chart.yAxis[0],
			selected = chart.annotations.selected;
		
		var options = merge(chart.annotations.options.buttons[selected].annotation, {
			xValue: xAxis.toValue(clickX),
			yValue: yAxis.toValue(clickY),
			allowDragX: true,
			allowDragY: true
		});
		
		chart.addAnnotation(options);
		
		chart.drawAnnotation = chart.annotations.allItems[chart.annotations.allItems.length - 1];
		Highcharts.addEvent(document, 'mousemove', step);
	}
	
	function step(e) {
			var selected = chart.annotations.selected;
			chart.annotations.options.buttons[selected].annotationEvents.step.call(chart.drawAnnotation, e);
	}
	
	function drop(e) {
			Highcharts.removeEvent(document, 'mousemove', step);
			
			// store annotation details
			if(chart.drawAnnotation){
				var selected = chart.annotations.selected;
				chart.annotations.options.buttons[selected].annotationEvents.stop.call(chart.drawAnnotation, e);
			}
			chart.drawAnnotation = null;
	}
	Highcharts.addEvent(chart.container, 'mousedown', drag);
	Highcharts.addEvent(document, 'mouseup', drop);	
}

function renderButtons(chart) {
	var buttons = chart.annotations.options.buttons;
	
	chart.annotations.buttons = chart.annotations.buttons || [];
	each(buttons, function(button, i) {
		chart.annotations.buttons.push(renderButton(chart, button, i));
	});
}

function renderButton(chart, button, i) {
	var userOffset = chart.annotations.options.buttonsOffsets,
		xOffset = chart.rangeSelector ? chart.rangeSelector.inputGroup.offset : 0,
		renderer = chart.renderer,
		symbol = button.symbol,
		offset = 30,
		symbolSize = symbol.size,
		buttonSize = button.size,
		x = chart.plotWidth + chart.plotLeft - ((i+1) * offset) - xOffset - userOffset[0],
		y = chart.plotTop - (chart.rangeSelector ? 23 + buttonSize : 0) + userOffset[1],
		callback = button.events && button.events.click ? button.events.click : getButtonCallback(i, chart),
		selected = button.states.selected,
		hovered = button.states.hover;
		
		var button = renderer.button('', x, y, callback, {}, hovered, selected).attr({ width: buttonSize, height: buttonSize, zIndex: 10 });
		
		var s = renderer.symbol(
			symbol.shape,
			buttonSize  - symbolSize /2,
			buttonSize  - symbolSize /2,
			symbolSize,
			symbolSize
		).attr(symbol.style).add(button);
	
	button.attr(button.style).add();
	
	return [button, s];
}

function getButtonCallback(index, chart) {
	return function() {
		self = chart.annotations.buttons[index][0];
		if(self.state == 2) {
			chart.annotations.selected = -1;
			chart.annotations.allowZoom = true;
			self.setState(0);
		} else {
			if(chart.annotations.selected >= 0) {
				chart.annotations.buttons[chart.annotations.selected][0].setState(0);
			}
			chart.annotations.allowZoom = false;
			chart.annotations.selected = index;
			self.setState(2);
		}
	};
}


// Define annotation prototype
var Annotation = function () {
        this.init.apply(this, arguments);
};
Annotation.prototype = {
        /* 
         * Initialize the annotation
         */
        init: function (chart, options) {
                var shapeType = options.shape && options.shape.type;

                this.chart = chart;
                this.options = merge({}, defaultOptions(shapeType), options);
        },

        /*
         * Render the annotation
         */
        render: function (redraw) {
                var annotation = this,
										chart = this.chart,
										renderer = annotation.chart.renderer,
										group = annotation.group,
										title = annotation.title,
										shape = annotation.shape,
										options = annotation.options,
										titleOptions = options.title,
										shapeOptions = options.shape,
										allowDragX = options.allowDragX,
										allowDragY = options.allowDragY,
										xAxis = chart.xAxis[options.xAxis],
										yAxis = chart.yAxis[options.yAxis],
										hasEvents = annotation.hasEvents;
										
                if (!group) {
										group = annotation.group = renderer.g();
										group.attr({ 'class': "highcharts-annotation" });
                }

                if (!shape && shapeOptions && inArray(shapeOptions.type, Highcharts.ALLOWED_SHAPES) !== -1) {
										shape = annotation.shape = renderer[options.shape.type](shapeOptions.params);
										shape.add(group);
                }

                if (!title && titleOptions) {
										title = annotation.title = renderer.label(titleOptions);
										title.add(group);
                }
                if((allowDragX || allowDragY) && !hasEvents) {
										$(group.element).on('mousedown', function(e){
												annotation.events.storeAnnotation(e, annotation, chart);
												annotation.events.select(e, annotation);
										});
										addEvent(document, 'mouseup', function(e){
												annotation.events.releaseAnnotation(e, chart);
										});
										
										attachCustomEvents(group, options.events);
                } else if(!hasEvents){
										$(group.element).on('mousedown', function(e){
												annotation.events.select(e, annotation);
										});
										attachCustomEvents(group, options.events);
								}                	

								this.hasEvents = true;
                
                group.add(chart.annotations.groups[options.yAxis]);
                
                // link annotations to point or series
                annotation.linkObjects();
                
                if (redraw !== false) {
                        annotation.redraw();
                }
                
								function attachCustomEvents(element, events) {
										if(defined(events)) {
												for(var name in events) {
														(function(name) {
																Highcharts.addEvent(element.element, name, function(e) {
																		events[name].call(annotation, e);
																});
														})(name);
												}
										}
								}
        },

        /*
         * Redraw the annotation title or shape after options update
         */
        redraw: function (redraw) {
                var options = this.options,
                        chart = this.chart,
                        group = this.group,
                        title = this.title,
                        shape = this.shape,
                        linkedTo = this.linkedObject,
                        xAxis = chart.xAxis[options.xAxis],
                        yAxis = chart.yAxis[options.yAxis],
                        width = options.width,
                        height = options.height,
                        anchorY = ALIGN_FACTOR[options.anchorY],
                        anchorX = ALIGN_FACTOR[options.anchorX],
                        resetBBox = false,
                        shapeParams,
                        linkType,
                        series,
                        param,
                        bbox,
                        x,
                        y;

                if (linkedTo) {
                        linkType = (linkedTo instanceof Highcharts.Point) ? 'point' :
                                                (linkedTo instanceof Highcharts.Series) ? 'series' : null;

                        if (linkType === 'point') {
                            options.x = linkedTo.plotX + chart.plotLeft;
                            options.y = linkedTo.plotY + chart.plotTop;
                            series = linkedTo.series;
                        } else if (linkType === 'series') {
                            series = linkedTo;
                        }

                        // #48 - series.grouping and series.stacking may reposition point.graphic
                        if (series.pointXOffset) {
                        	options.x += series.pointXOffset + (linkedTo.shapeArgs.width / 2 || 0);
                    	}
                        group.attr({
                            visibility: series.group.attr("visibility")
                        });
                }


                // Based on given options find annotation pixel position
                // what is minPointOffset? Doesn't work in 4.0+
                x = (defined(options.xValue) ? xAxis.toPixels(options.xValue /* + xAxis.minPointOffset */) : options.x);
                y = defined(options.yValue) ? yAxis.toPixels(options.yValue) : options.y;

                if (isNaN(x) || isNaN(y) || !isNumber(x) || !isNumber(y)) {
                        return;
                }


                if (title) {
					var attrs = options.title;
					if(isOldIE) {
							title.attr({
								text: attrs.text
							});
					} else {
							title.attr(attrs);
					}
					title.css(options.title.style);
					
					resetBBox = true;
                }

                if (shape) {
                        shapeParams = extend({}, options.shape.params);
                        if (options.shape.units === 'values') {
                        				// For ordinal axis, required are x&Y values - #22
                        				if(defined(shapeParams.x) && shapeParams.width) {
                        								shapeParams.width = xAxis.toPixels(shapeParams.width + shapeParams.x) - xAxis.toPixels(shapeParams.x);
                                        shapeParams.x = xAxis.toPixels(shapeParams.x);
                        				} else if(shapeParams.width) {
                                        shapeParams.width = xAxis.toPixels(shapeParams.width) - xAxis.toPixels(0);
                                } else if(defined(shapeParams.x)) {
                                				shapeParams.x = xAxis.toPixels(shapeParams.x);
                                }

                                if (defined(shapeParams.y) && shapeParams.height) {
                                        shapeParams.height = - yAxis.toPixels(shapeParams.height + shapeParams.y) + yAxis.toPixels(shapeParams.y);
                                        shapeParams.y = yAxis.toPixels(shapeParams.y); 
                                } else if (shapeParams.height) {
                                        shapeParams.height = - yAxis.toPixels(shapeParams.height) + yAxis.toPixels(0);
                                } else if (defined(shapeParams.y)) {
                                				shapeParams.y = yAxis.toPixels(shapeParams.y);
                                }

                                if (options.shape.type === 'path') {
                                        shapeParams.d = translatePath(shapeParams.d, xAxis, yAxis, x, y);
                                }
                        }
                        if(defined(options.yValueEnd) && defined(options.xValueEnd)){
                        	shapeParams.d = shapeParams.d || options.shape.d || ['M', 0, 0, 'L', 0, 0];
                        	shapeParams.d[4] = xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(options.xValue);
                        	shapeParams.d[5] = yAxis.toPixels(options.yValueEnd) - yAxis.toPixels(options.yValue);
                        }

                        // move the center of the circle to shape x/y
                        if (options.shape.type === 'circle') {
                                shapeParams.x += shapeParams.r;
                                shapeParams.y += shapeParams.r;
                        }
                        
                        resetBBox = true;
                        shape.attr(shapeParams);
                }

                group.bBox = null;

                // If annotation width or height is not defined in options use bounding box size
                if (!isNumber(width)) {
                        bbox = group.getBBox();
                        width = bbox.width;
                }

                if (!isNumber(height)) {
                        // get bbox only if it wasn't set before
                        if (!bbox) {
                                bbox = group.getBBox();
                        }

                        height = bbox.height;
                }
                // Calculate anchor point
                if (!isNumber(anchorX)) {
                        anchorX = ALIGN_FACTOR.center;
                }

                if (!isNumber(anchorY)) {
                        anchorY = ALIGN_FACTOR.center;
                }

                // Translate group according to its dimension and anchor point
                //console.log(width+'/'+height);
                x = x - width * anchorX;
                y = y - height * anchorY;
                
                if(this.selectionMarker ) {
										this.events.select({}, this);
        				}
                
                if (redraw && chart.animation && defined(group.translateX) && defined(group.translateY)) {
                        group.animate({
                                translateX: x,
                                translateY: y
                        });
                } else {
                        group.translate(x, y);
                }
        },

        /*
         * Destroy the annotation
         */
        destroy: function () {
                var annotation = this,
                        chart = this.chart,
                        allItems = chart.annotations.allItems,
                        index = allItems.indexOf(annotation);

                chart.activeAnnotation = null; 
                
                if (index > -1) {
                        allItems.splice(index, 1);
                        chart.options.annotations.splice(index, 1); // #33
                }

                each(['title', 'shape', 'group'], function (element) {
                        if (annotation[element] && annotation[element].destroy) {
                                annotation[element].destroy();
                                annotation[element] = null;
                        } else if(annotation[element]) {
                                annotation[element].remove();
                                annotation[element] = null;
                        }
                });

                annotation.group = annotation.title = annotation.shape = annotation.chart = annotation.options = annotation.hasEvents = null;
        },

        /*
         * Show annotation, only for non-linked annotations
         */
        show: function () {
			if (!this.linkedObject) {
				this.visible = true;
				this.group.attr({
					visibility: "visible"
				});
			}
        },

        /*
         * Hide annotation, only for non-linked annotations
         */
        hide: function () {
			if (!this.linkedObject) {
				this.visible = false;
				this.group.attr({
					visibility: "hidden"
				});
			}
        },

        /*
         * Update the annotation with a given options
         */
        update: function (options, redraw) {
                var annotation = this,
										chart = this.chart,
										allItems = chart.annotations.allItems,
										index = allItems.indexOf(annotation),
										o = merge(this.options, options);
                        
								if(index >= 0) {
										chart.options.annotations[index] = o; // #33
								}
										
                this.options = o;

                // update link to point or series
                this.linkObjects();

                this.render(redraw);
        },

        linkObjects: function () {
                var annotation = this,
                        chart = annotation.chart,
                        linkedTo = annotation.linkedObject,
                        linkedId = linkedTo && (linkedTo.id || linkedTo.options.id),
                        options = annotation.options,
                        id = options.linkedTo;

                if (!defined(id)) {
                        annotation.linkedObject = null;
                } else if (!defined(linkedTo) || id !== linkedId) {
                        annotation.linkedObject = chart.get(id);
                }
        },
        events: {
        			select: function(e, ann, isClick) {
        					var chart = ann.chart,
        							prevAnn = chart.selectedAnnotation,
        							box,
        							padding = 10;
        					
        					if(prevAnn && prevAnn.selectionMarker && prevAnn !== ann) {
        							prevAnn.selectionMarker.destroy();
        							prevAnn.selectionMarker = false;
        					}
        				
        					if(ann.selectionMarker) {
											//ann.selectionMarker.destroy(); <-- if we destroy marker, then event won't be propagated
											//ann.group.bBox = null;
        					} else { 
											box = ann.group.getBBox();
											
											ann.selectionMarker = chart.renderer.rect(box.x - padding / 2, box.y - padding / 2, box.width + padding, box.height + padding).attr({
													'stroke-width': 1,
													stroke: 'black',
													fill: 'transparent',
													dashstyle: 'ShortDash',
													'shape-rendering': 'crispEdges'
											});
											ann.selectionMarker.add(ann.group);
									}
        					chart.selectedAnnotation = ann;
							},
							deselect: function(e) {
									if(this.selectionMarker && this.group) {
											this.selectionMarker.destroy();
											this.selectionMarker = false;
											this.group.bBox = null;
									}
							},
        	    destroyAnnotation: function(event, annotation) {
                	annotation.destroy();	
                },
                translateAnnotation: function(event, chart){
                	event.stopPropagation();
                	event.preventDefault();
                	var container = chart.container;
					if(chart.activeAnnotation) {
						var bbox = chart.container.getBoundingClientRect(),
								clickX = event.clientX - bbox.left,
								clickY = event.clientY - bbox.top;
								
						if (!chart.isInsidePlot(clickX - chart.plotLeft, clickY - chart.plotTop)) {
							return;
						}		
						var note = chart.activeAnnotation;
								
						var x = note.options.allowDragX ? event.clientX - note.startX + note.group.translateX : note.group.translateX,
							y = note.options.allowDragY ? event.clientY - note.startY + note.group.translateY : note.group.translateY;
					
						note.transX = x;
						note.transY = y;
						note.group.attr({
							transform: 'translate(' + x + ',' + y + ')'
						}); 
						note.hadMove = true;
					}
				},
                storeAnnotation: function(event, annotation, chart) {
					if(!chart.annotationDraging) {
						event.stopPropagation();
						event.preventDefault();
					}
					if((!isOldIE && event.button === 0) || (isOldIE && event.button === 1)) {
						var posX = event.clientX,
								posY = event.clientY;
						chart.activeAnnotation = annotation;
						chart.activeAnnotation.startX = posX;
						chart.activeAnnotation.startY = posY;
						chart.activeAnnotation.transX = 0; 
						chart.activeAnnotation.transY = 0; 
						//translateAnnotation(event);
						addEvent(document, 'mousemove', function(e){
								annotation.events.translateAnnotation(e, chart);
						});
						//addEvent(chart.container, 'mouseleave', releaseAnnotation); TO BE OR NOT TO BE?
					}
                },
                releaseAnnotation: function(event, chart){
					event.stopPropagation();
					event.preventDefault();
					if(chart.activeAnnotation && (chart.activeAnnotation.transX !== 0 || chart.activeAnnotation.transY !== 0)) {
						var note = chart.activeAnnotation,
							x = note.transX,
							y = note.transY,
							options = note.options, 
							xVal = options.xValue,
							yVal = options.yValue,
							xValEnd = options.xValueEnd,
							yValEnd = options.yValueEnd,
							allowDragX = options.allowDragX,
							allowDragY = options.allowDragY,
							xAxis = note.chart.xAxis[note.options.xAxis],
							yAxis = note.chart.yAxis[note.options.yAxis],
							newX = xAxis.toValue(x),
							newY = yAxis.toValue(y);
						
						if(x !== 0 || y !==0){
							if(allowDragX && allowDragY){
								note.update({
									xValue: defined(xVal) ? newX : null,
									yValue: defined(yVal) ? newY : null,
									xValueEnd: defined(xValEnd) ? xValEnd - xVal + newX : null,
									yValueEnd: defined(yValEnd) ? yValEnd - yVal + newY : null,
									x: defined(xVal) ? null : x,
									y: defined(yVal) ? null : y
								}, false);
							} else if(allowDragX){
								note.update({
									xValue: defined(xVal) ? newX : null,
									yValue: defined(yVal) ? yVal : null,
									xValueEnd: defined(xValEnd) ? xValEnd - xVal + newX : null,
									yValueEnd: defined(yValEnd) ? yValEnd : null,
									x: defined(xVal) ? null : x,
									y: defined(yVal) ? null : note.options.y
								}, false);
							} else if(allowDragY){
								note.update({
									xValue: defined(xVal) ? xVal : null,
									yValue: defined(yVal) ? newY : null,
									xValueEnd: defined(xValEnd) ? xValEnd : null,
									yValueEnd: defined(yValEnd) ? yValEnd - yVal + newY : null,
									x: defined(xVal) ? null : note.options.x,
									y: defined(yVal) ? null : y
								}, false);
							}
						}						
						chart.activeAnnotation = null;
						chart.redraw(false);
					} else {
						chart.activeAnnotation = null;
					}
				}
        }
};


// Add annotations methods to chart prototype
extend(Chart.prototype, {
				/*
				 * Unified method for adding annotations to the chart
				 */
				addAnnotation: function (options, redraw) {
								var chart = this,
												annotations = chart.annotations.allItems,
												item,
												i,
												iter,
												len;

								if (!isArray(options)) {
												options = [options];
								}

								len = options.length;

								for (iter = 0; iter < len; iter++) {
												item = new Annotation(chart, options[iter]);
												i = annotations.push(item);
												if(i > chart.options.annotations.length) {
														chart.options.annotations.push(options[iter]); // #33
												}
												item.render(redraw);
								}
				},

				/**
				 * Redraw all annotations, method used in chart events
				 */
				redrawAnnotations: function () {
								var chart = this,
									yAxes = chart.yAxis,
									yLen = yAxes.length,
									ann = chart.annotations,
									userOffset = ann.options.buttonsOffsets,
									i = 0;

									
								for(; i < yLen; i++){
									var y = yAxes[i],
										clip = ann.clipPaths[i];
									
									if(clip) {
										clip.attr({
											x: y.left,
											y: y.top,
											width: y.width,
											height: y.height
										}); 
									} else {
										var clipPath = createClipPath(chart, y);
										ann.clipPaths.push(clipPath);
										ann.groups.push(createGroup(chart, i, clipPath));
									}
										
								}		
										
								each(chart.annotations.allItems, function (annotation) {
										annotation.redraw();
								});
								each(chart.annotations.buttons, function(button, i) {
										var	xOffset = chart.rangeSelector ? chart.rangeSelector.inputGroup.offset : 0,
												x = chart.plotWidth + chart.plotLeft - ((i+1) * 30) - xOffset - userOffset[0];
										button[0].attr({
												x: x
										});
								});
				}
});


// Initialize on chart load
Chart.prototype.callbacks.push(function (chart) {
        var options = chart.options.annotations,
        	yAxes = chart.yAxis,
        	yLen = yAxes.length,
			clipPaths = [],
			clipPath,
            groups = [],
            group,
            i = 0,
			clipBox;

		for(; i < yLen; i++){
			var y = yAxes[i];
			var c = createClipPath(chart, y);
			clipPaths.push(c);
			groups.push(createGroup(chart, i, c));
		}
			

        if(!chart.annotations) chart.annotations = {};
        
        if(!chart.options.annotations) chart.options.annotations = [];
        
        // initialize empty array for annotations
        if(!chart.annotations.allItems) chart.annotations.allItems = [];

        // allow zoom or draw annotation
        chart.annotations.allowZoom = true;
        
        // link chart object to annotations
        chart.annotations.chart = chart;

        // link annotations group element to the chart
        chart.annotations.groups = groups;
        
        // add clip path to annotations
        chart.annotations.clipPaths = clipPaths;

        if (isArray(options) && options.length > 0) {
			chart.addAnnotation(chart.options.annotations);
        }
        chart.annotations.options = merge(defatultMainOptions(), chart.options.annotationsOptions ? chart.options.annotationsOptions : {});
        
        if(chart.annotations.options.enabledButtons) {
        	renderButtons(chart);
        	attachEvents(chart);
        } else {
					 chart.annotations.buttons = [];
        }

		// update annotations after chart redraw
		Highcharts.addEvent(chart, 'redraw', function () {
			chart.redrawAnnotations();
		});
				
});

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    };
}

}(Highcharts));
