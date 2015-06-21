HTMLWidgets.widget({

  name: "dygraphs",

  type: "output",

  initialize: function(el, width, height) { 
    return {};
  },

  resize: function(el, width, height, instance) {
    if (instance.dygraph)
      instance.dygraph.resize();
  },

  renderValue: function(el, x, instance) {
    
    // reference to this for closures
     var thiz = this;
    
    // get dygraph attrs and populate file field
    var attrs = x.attrs;
    attrs.file = x.data;
        
    // resolve "auto" legend behavior
    if (x.attrs.legend == "auto") {
      if (x.data.length <= 2)
        x.attrs.legend = "onmouseover";
      else
        x.attrs.legend = "always";
    }
    
    // provide an automatic x value formatter if none is already specified
    if (attrs.axes.x.valueFormatter === undefined)
      attrs.axes.x.valueFormatter = this.xValueFormatter(x.scale);
    
    // convert time to js time
    attrs.file[0] = attrs.file[0].map(function(value) {
      return thiz.normalizeDateValue(x.scale, value);
    });
    if (attrs.dateWindow != null) {
      attrs.dateWindow = attrs.dateWindow.map(function(value) {
        var date = thiz.normalizeDateValue(x.scale, value);
        return date.getTime();
      });
    }
    
    // transpose array
    attrs.file = HTMLWidgets.transposeArray2D(attrs.file);
    
    // add drawCallback for group
    if (x.group != null)
      this.addGroupDrawCallback(x);  
      
    // add shading and event callback if necessary
    this.addShadingCallback(x);
    this.addEventCallback(x);
      
    // add default font for viewer mode
    if (this.queryVar("viewer_pane") === "1")
      document.body.style.fontFamily = "Arial, sans-serif";
    
    if (instance.dygraph) { // update exisigng instance
       
      instance.dygraph.updateOptions(attrs);
    
    } else {  // create new instance
      
      // inject css if necessary
      if (x.css != null) {
        var style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) 
          style.styleSheet.cssText = x.css;
        else 
          style.appendChild(document.createTextNode(x.css));
        document.getElementsByTagName("head")[0].appendChild(style);
      }
      
      // create the instance and add it to it's group (if any)
      instance.dygraph = new Dygraph(el, attrs.file, attrs);
      if (x.group != null)
        this.groups[x.group].push(instance.dygraph);
    }
     
    // set annotations
    if (x.annotations != null) {
      instance.dygraph.ready(function() {
        x.annotations.map(function(annotation) {
          var date = thiz.normalizeDateValue(x.scale, annotation.x);
          annotation.x = date.getTime();
        });
        instance.dygraph.setAnnotations(x.annotations);
      }); 
    }
  },
  
  xValueFormatter: function(scale) {
    
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      
    return function(millis) {
      var date = new Date(millis);
        if (scale == "yearly")
          return date.getFullYear();
        else if (scale == "monthly" || scale == "quarterly")
          return monthNames[date.getMonth()] + ' ' + date.getFullYear(); 
        else if (scale == "daily" || scale == "weekly")
          return monthNames[date.getMonth()] + ' ' + 
                           date.getDate() + ' ' + 
                           date.getFullYear();
        else
          return date.toLocaleString();
    }
  },
  
  groups: {},
  
  addGroupDrawCallback: function(x) {
    
    // get attrs
    var attrs = x.attrs;
    
    // check for an existing drawCallback
    var prevDrawCallback = attrs["drawCallback"];
    
    this.groups[x.group] = this.groups[x.group] || [];
    var group = this.groups[x.group];
    var blockRedraw = false;
    attrs.drawCallback = function(me, initial) {
      
      // call existing
      if (prevDrawCallback)
        prevDrawCallback(me, initial);
      
      // sync peers in group
      if (blockRedraw || initial) return;
      blockRedraw = true;
      var range = me.xAxisRange();
      for (var j = 0; j < group.length; j++) {
        if (group[j] == me) continue;
        group[j].updateOptions({
          dateWindow: range
        });
      }
      blockRedraw = false;
    };
  },
  
  addShadingCallback: function(x) {
    
    // bail if no shadings
    if (x.shadings.length == 0)
      return;
    
    // alias this
    var thiz = this;
    
    // get attrs
    var attrs = x.attrs;
    
    // check for an existing underlayCallback
    var prevUnderlayCallback = attrs["underlayCallback"];
    
    // install callback
    attrs.underlayCallback = function(canvas, area, g) {
      
      // call existing
      if (prevUnderlayCallback)
        prevUnderlayCallback(canvas, area, g);
        
      for (var i = 0; i < x.shadings.length; i++) {
        var shading = x.shadings[i];
        var x1 = thiz.normalizeDateValue(x.scale, shading.from).getTime();
        var x2 = thiz.normalizeDateValue(x.scale, shading.to).getTime();
        var left = g.toDomXCoord(x1);
        var right = g.toDomXCoord(x2);
        canvas.save();
        canvas.fillStyle = shading.color;
        canvas.fillRect(left, area.y, right - left, area.h);
        canvas.restore();
      }
    };
  },
  
  addEventCallback: function(x) {
    
    // bail if no evets
    if (x.events.length == 0)
      return;
    
    // alias this
    var thiz = this;
    
    // get attrs
    var attrs = x.attrs;
    
    // check for an existing underlayCallback
    var prevUnderlayCallback = attrs["underlayCallback"];
    
    // install callback
    attrs.underlayCallback = function(canvas, area, g) {
      
      // call existing
      if (prevUnderlayCallback)
        prevUnderlayCallback(canvas, area, g);
        
      for (var i = 0; i < x.events.length; i++) {
        
        // get event and x-coordinate
        var event = x.events[i];
        var xPos = thiz.normalizeDateValue(x.scale, event.date).getTime();
        xPos = g.toDomXCoord(xPos);
        
        // draw line
        canvas.save();
        canvas.strokeStyle = event.color;
        thiz.dashedLine(canvas, 
                        xPos, 
                        area.y, 
                        xPos, 
                        area.y + area.h,
                        event.strokePattern);
        canvas.restore();
        
        // draw label
        if (event.label != null) {
          canvas.save();
          thiz.setFontSize(canvas, 12);
          var size = canvas.measureText(event.label);
          var tx = xPos - 4;
          var ty;
          if (event.labelLoc == "top")
            ty = area.y + size.width + 10;
          else
            ty = area.y + area.h - 10;
          canvas.translate(tx,ty);
          canvas.rotate(3 * Math.PI / 2);
          canvas.translate(-tx,-ty);
          canvas.fillText(event.label, tx, ty);
          canvas.restore();
        }
      }
    };
  },
  
  // add dashed line support to canvas rendering context
  // see: http://stackoverflow.com/questions/4576724/dotted-stroke-in-canvas
  dashedLine: function(canvas, x, y, x2, y2, dashArray) {
    canvas.beginPath();
    if (!dashArray) dashArray=[10,5];
    if (dashLength==0) dashLength = 0.001; // Hack for Safari
    var dashCount = dashArray.length;
    canvas.moveTo(x, y);
    var dx = (x2-x), dy = (y2-y);
    var slope = dx ? dy/dx : 1e15;
    var distRemaining = Math.sqrt( dx*dx + dy*dy );
    var dashIndex=0, draw=true;
    while (distRemaining>=0.1){
      var dashLength = dashArray[dashIndex++%dashCount];
      if (dashLength > distRemaining) dashLength = distRemaining;
      var xStep = Math.sqrt( dashLength*dashLength / (1 + slope*slope) );
      if (dx<0) xStep = -xStep;
      x += xStep
      y += slope*xStep;
      canvas[draw ? 'lineTo' : 'moveTo'](x,y);
      distRemaining -= dashLength;
      draw = !draw;
    }
    canvas.stroke();
  },
  
  setFontSize: function(canvas, size) {
    var cFont = canvas.font;
    var parts = cFont.split(' ');
    if (parts.length === 2)
      canvas.font = size + 'px ' + parts[1];
    else if (parts.length === 3)
      canvas.font = parts[0] + ' ' + size + 'px ' + parts[2];
  },
  
  // Returns the value of a GET variable
  queryVar: function(name) {
    return decodeURI(window.location.search.replace(
      new RegExp("^(?:.*[&\\?]" +
                 encodeURI(name).replace(/[\.\+\*]/g, "\\$&") +
                 "(?:\\=([^&]*))?)?.*$", "i"),
      "$1"));
  },
  
  // we deal exclusively in UTC dates within R, however dygraphs deals 
  // exclusively in the local time zone. therefore, in order to plot date
  // lables that make sense to the user when we are dealing with days,
  // months or years we need to convert the UTC date value to a local time
  // value that "looks like" the equivilant UTC value. to do this we add the
  // timezone offset to the UTC date.
  normalizeDateValue: function(scale, value) {
    var date = new Date(value); 
    if (scale != "minute" && scale != "hourly") {
      var localAsUTC = date.getTime() + (date.getTimezoneOffset() * 60000);
      date = new Date(localAsUTC);
    }
    return date;
  }
});

