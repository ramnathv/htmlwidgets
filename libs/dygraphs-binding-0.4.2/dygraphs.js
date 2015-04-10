
// polyfill indexOf for IE8
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(elt /*, from*/) {
    var len = this.length >>> 0;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++) {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}


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
    
    // set appropriated function in case of fixed tz
    if ((attrs.axes.x.axisLabelFormatter === undefined) && x.fixedtz)
      attrs.axes.x.axisLabelFormatter = this.xAxisLabelFormatterFixedTZ(x.tzone);
      
    if ((attrs.axes.x.valueFormatter === undefined) && x.fixedtz)
      attrs.axes.x.valueFormatter = this.xValueFormatterFixedTZ(x.scale, x.tzone);

    if ((attrs.axes.x.ticker === undefined) && x.fixedtz)
      attrs.axes.x.ticker = this.customDateTickerFixedTZ(x.tzone);
  
    // provide an automatic x value formatter if none is already specified
    if ((attrs.axes.x.valueFormatter === undefined) && (x.fixedtz != true))
      attrs.axes.x.valueFormatter = this.xValueFormatter(x.scale);
    
    // convert time to js time
    attrs.file[0] = attrs.file[0].map(function(value) {
      return thiz.normalizeDateValue(x.scale, value, x.fixedtz);
    });
    if (attrs.dateWindow != null) {
      attrs.dateWindow = attrs.dateWindow.map(function(value) {
        var date = thiz.normalizeDateValue(x.scale, value, x.fixedtz);
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
    this.addZoomCallback(x, instance);
      
    
    // if there is no existing instance perform one-time initialization
    if (!instance.dygraph) {
      
      // add default font for viewer mode
      if (this.queryVar("viewer_pane") === "1")
        document.body.style.fontFamily = "Arial, sans-serif";

      // add shiny input for date window
      if (HTMLWidgets.shinyMode)
        this.addDateWindowShinyInput(el.id, x);
  
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
      
    } else {
      
        // retain the userDateWindow
        if (instance.dygraph.userDateWindow != null)
          attrs.dateWindow = instance.dygraph.xAxisRange();
      
        // remove it from groups if it's there
        if (x.group !== null && this.groups[x.group] !== null) {
          var index = this.groups[x.group].indexOf(instance.dygraph);
          if (index != -1)
            this.groups[x.group].splice(index, 1);
        }
        
        // destroy the existing dygraph 
        instance.dygraph.destroy();
        instance.dygraph = null;
    }
    
    // create the instance and add it to it's group (if any)
    instance.dygraph = new Dygraph(el, attrs.file, attrs);
    instance.dygraph.userDateWindow = attrs.dateWindow;
    if (x.group !== null)
      this.groups[x.group].push(instance.dygraph);
    
    // set annotations
    if (x.annotations != null) {
      instance.dygraph.ready(function() {
        x.annotations.map(function(annotation) {
          var date = thiz.normalizeDateValue(x.scale, annotation.x, x.fixedtz);
          annotation.x = date.getTime();
        });
        instance.dygraph.setAnnotations(x.annotations);
      }); 
    }
      
  },
  
  // set of functions needed with fixed tz
  customDateTickerFixedTZ : function(tz){
    return function(a, b, pixels, opts, dygraph, vals) {   
      var chosen = Dygraph.pickDateTickGranularity(a, b, pixels, opts);
      if (chosen >= 0) {
        var formatter = (opts("axisLabelFormatter"));
        var ticks = [];
        var t; 

        if (chosen < Dygraph.MONTHLY) {
          // Generate one tick mark for every fixed interval of time.
          var spacing = Dygraph.SHORT_SPACINGS[chosen];

          // Find a time less than start_time which occurs on a "nice" time boundary
          // for this granularity.
          var g = spacing / 1000;
          var d = moment(a);
          d.tz(tz); 
          d.millisecond(0);

          var x;
          if (g <= 60) {  // seconds 
            x = d.second();         
            d.second(x - x % g);     
          } else {
            d.second(0);
            g /= 60; 
            if (g <= 60) {  // minutes
              x = d.minute();
              d.minute(x - x % g);
            } else {
              d.minute(0);
              g /= 60;

              if (g <= 24) {  // days
                x = d.hour();
                d.hour(x - x % g);
              } else {
                d.hour(0);
                g /= 24;

                if (g == 7) {  // one week
                  d.startOf('week');
                }
              }
            }
          }
          a = d.valueOf();

          // For spacings coarser than two-hourly, we want to ignore daylight
          // savings transitions to get consistent ticks. For finer-grained ticks,
          // it's essential to show the DST transition in all its messiness.
          var start_offset_min = moment(a).tz(tz).zone();
          var check_dst = (spacing >= Dygraph.SHORT_SPACINGS[Dygraph.TWO_HOURLY]);

          for (t = a; t <= b; t += spacing) {
            d = moment(t).tz(tz);

            // This ensures that we stay on the same hourly "rhythm" across
            // daylight savings transitions. Without this, the ticks could get off
            // by an hour. See tests/daylight-savings.html or issue 147.
            if (check_dst && d.zone() != start_offset_min) {
              var delta_min = d.zone() - start_offset_min;
              t += delta_min * 60 * 1000;
              d = moment(t).tz(tz);
              start_offset_min = d.zone();

              // Check whether we've backed into the previous timezone again.
              // This can happen during a "spring forward" transition. In this case,
              // it's best to skip this tick altogether (we may be shooting for a
              // non-existent time like the 2AM that's skipped) and go to the next
              // one.
              if (moment(t + spacing).tz(tz).zone() != start_offset_min) {
                t += spacing;
                d = moment(t).tz(tz);
                start_offset_min = d.zone();
              }
            }

            ticks.push({ v:t,
                      label: formatter(d, chosen, opts, dygraph)
                    });
          }
        } else {
          // Display a tick mark on the first of a set of months of each year.
          // Years get a tick mark iff y % year_mod == 0. This is useful for
          // displaying a tick mark once every 10 years, say, on long time scales.
          var months;
          var year_mod = 1;  // e.g. to only print one point every 10 years.
          if (chosen < Dygraph.NUM_GRANULARITIES) {
            months = Dygraph.LONG_TICK_PLACEMENTS[chosen].months;
            year_mod = Dygraph.LONG_TICK_PLACEMENTS[chosen].year_mod;
          } else {
            Dygraph.warn("Span of dates is too long");
          }

          var start_year = moment(a).tz(tz).year();
          var end_year   = moment(b).tz(tz).year();
          for (var i = start_year; i <= end_year; i++) {
            if (i % year_mod !== 0) continue;
            for (var j = 0; j < months.length; j++) {
              var dt = moment.tz(new Date(i, months[j], 1), tz); 
              dt.year(i);
              t = dt.valueOf();
              if (t < a || t > b) continue;
              ticks.push({ v:t,
                        label: formatter(moment(t).tz(tz), chosen, opts, dygraph)
                      });
            }
          }
        }
        return ticks;
      }else{
      // this can happen if self.width_ is zero.
        return [];
      }
    };
  },

  xAxisLabelFormatterFixedTZ : function(tz){
  
    return function dateAxisFormatter(date, granularity){
      var mmnt = moment(date).tz(tz);
      if (granularity >= Dygraph.DECADAL){
        return mmnt.format('YYYY');
      }else{
        if(granularity >= Dygraph.MONTHLY){
          return mmnt.format('MMM YYYY');
        }else{
          var frac = mmnt.hour() * 3600 + mmnt.minute() * 60 + mmnt.second() + mmnt.millisecond();
            if (frac === 0 || granularity >= Dygraph.DAILY) {
              return mmnt.format('DD MMM');
            } else {
             if (mmnt.second()) {
               return mmnt.format('HH:mm:ss');
             } else {
               return mmnt.format('HH:mm');
             }
            }
         } 
                        
       }         
   }
  },
         
  xValueFormatterFixedTZ: function(scale, tz) {
                   
    return function(millis) {
      var mmnt = moment(millis).tz(tz);
        if (scale == "yearly")
          return mmnt.format('YYYY') + ' (' + mmnt.zoneAbbr() + ')';
        else if (scale == "monthly" || scale == "quarterly")
          return mmnt.format('MMM, YYYY')+ ' (' + mmnt.zoneAbbr() + ')';
        else if (scale == "daily" || scale == "weekly")
          return mmnt.format('MMM, DD, YYYY')+ ' (' + mmnt.zoneAbbr() + ')';
        else
          return mmnt.format('dddd, MMMM, DD, YYYY HH:mm:ss')+ ' (' + mmnt.zoneAbbr() + ')';
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
          return monthNames[date.getMonth()] + ', ' + date.getFullYear(); 
        else if (scale == "daily" || scale == "weekly")
          return monthNames[date.getMonth()] + ', ' + 
                           date.getDate() + ', ' + 
                           date.getFullYear();
        else
          return date.toLocaleString();
    }
  },
  
  addZoomCallback: function(x, instance) {
    
    // alias this
    var thiz = this;
    
    // get attrs
    var attrs = x.attrs;
    
    // check for an existing zoomCallback
    var prevZoomCallback = attrs["zoomCallback"];
    
    attrs.zoomCallback = function(minDate, maxDate, yRanges) {
      
      // call existing
      if (prevZoomCallback)
        prevZoomCallback(minDate, maxDate, yRanges);
        
      // record user date window (or lack thereof)
      var me = instance.dygraph;
      if (me.xAxisExtremes()[0] != minDate ||
          me.xAxisExtremes()[1] != maxDate) {
         me.userDateWindow = [minDate, maxDate];
      } else {
         me.userDateWindow = null;
      }
      
      // record in group if necessary
      if (x.group !== null && thiz.groups[x.group] !== null) {
        var group = thiz.groups[x.group];
        for(var i = 0; i<group.length; i++)
          group[i].userDateWindow = me.userDateWindow;
      }
    };
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
        var x1 = thiz.normalizeDateValue(x.scale, shading.from, x.fixedtz).getTime();
        var x2 = thiz.normalizeDateValue(x.scale, shading.to, x.fixedtz).getTime();
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
        var xPos = thiz.normalizeDateValue(x.scale, event.date, x.fixedtz).getTime();
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
  
  addDateWindowShinyInput: function(id, x) {
      
    // check for an existing drawCallback
    var prevDrawCallback = x.attrs["drawCallback"];
    
    // install the callback
    x.attrs.drawCallback = function(me, initial) {
      
      // call existing
      if (prevDrawCallback)
        prevDrawCallback(me, initial);
        
      // fire input change
      var range = me.xAxisRange();
      var dateWindow = [new Date(range[0]), new Date(range[1])];
      Shiny.onInputChange(id + "_date_window", dateWindow); 
    };
  },
  
  // Add dashed line support to canvas rendering context
  // See: http://stackoverflow.com/questions/4576724/dotted-stroke-in-canvas
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
  
  // We deal exclusively in UTC dates within R, however dygraphs deals 
  // exclusively in the local time zone. Therefore, in order to plot date
  // labels that make sense to the user when we are dealing with days,
  // months or years we need to convert the UTC date value to a local time
  // value that "looks like" the equivilant UTC value. To do this we add the
  // timezone offset to the UTC date.
  // Don't use in case of fixedtz
  normalizeDateValue: function(scale, value, fixedtz) {
    var date = new Date(value); 
    if (scale != "minute" && scale != "hourly" && scale != "seconds" && !fixedtz) {
      var localAsUTC = date.getTime() + (date.getTimezoneOffset() * 60000);
      date = new Date(localAsUTC);
    }
    return date;
  }
  
});

