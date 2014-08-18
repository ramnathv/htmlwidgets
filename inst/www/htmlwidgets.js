(function() {
  // If window.HTMLWidgets is already defined, then use it; otherwise create a
  // new object. This allows preceding code to set options that affect the
  // initialization process (though none currently exist).
  window.HTMLWidgets = window.HTMLWidgets || {};
  
  // See if we're running in a viewer pane. If not, we're in a web browser.
  var viewerMode = window.HTMLWidgets.viewerMode =
      /\bviewer_pane=1\b/.test(window.location);
  // See if we're running in Shiny mode. If not, it's a static document.
  var shinyMode = window.HTMLWidgets.shinyMode =
      typeof(window.Shiny) !== "undefined" && !!window.Shiny.outputBindings;

  // We can't count on jQuery being available, so we implement our own
  // version if necessary.
  function querySelectorAll(scope, selector) {
    if (typeof(jQuery) !== "undefined" && scope instanceof jQuery) {
      return scope.find(selector);
    }
    if (scope.querySelectorAll) {
      return scope.querySelectorAll(selector);
    }
  }
  
  // Implement jQuery's extend
  function extend(target /*, ... */) {
    if (arguments.length == 1) {
      return target;
    }
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
          target[prop] = source[prop];
        }
      }
    }
    return target;
  }

  // Implement a vague facsimilie of jQuery's data method 
  function elementData(el, name, value) {
    if (arguments.length == 2) {
      return el["htmlwidget_data_" + name];
    } else if (arguments.length == 3) {
      el["htmlwidget_data_" + name] = value;
      return el;
    } else {
      throw new Error("Wrong number of arguments for elementData: " +
        arguments.length);
    }
  }
  
  function on(obj, eventName, func) {
    if (obj.addEventListener) {
      obj.addEventListener(eventName, func, false);
    } else if (obj.attachEvent) {
      obj.attachEvent(eventName, func);
    }
  }
  
  function off(obj, eventName, func) {
    if (obj.removeEventListener)
      obj.removeEventListener(eventName, func, false);
    else if (obj.detachEvent) {
      obj.detachEvent(eventName, func);
    }
  }
  
  // Translate array of values to top/right/bottom/left, as usual with
  // the "padding" CSS property
  // https://developer.mozilla.org/en-US/docs/Web/CSS/padding
  function unpackPadding(value) {
    if (typeof(value) === "number")
      value = [value];
    if (value.length === 1) {
      return {top: value[0], right: value[0], bottom: value[0], left: value[0]};
    }
    if (value.length === 2) {
      return {top: value[0], right: value[1], bottom: value[0], left: value[1]};
    }
    if (value.length === 3) {
      return {top: value[0], right: value[1], bottom: value[2], left: value[1]};
    }
    if (value.length === 4) {
      return {top: value[0], right: value[1], bottom: value[2], left: value[3]};
    }
  }
  
  // Convert an unpacked padding object to a CSS value
  function paddingToCss(paddingObj) {
    return paddingObj.top + "px " + paddingObj.right + "px " + paddingObj.bottom + "px " + paddingObj.left + "px";
  }
  
  // Makes a number suitable for CSS
  function px(x) {
    if (typeof(x) === "number")
      return x + "px";
    else
      return x;
  }
  
  // Retrieves runtime widget sizing information for an element.
  // The return value is either null, or an object with fill, padding,
  // defaultWidth, defaultHeight fields.
  function sizingPolicy(el) {
    var sizingEl = document.querySelector("script[data-for='" + el.id + "'][type='application/htmlwidget-sizing']");
    if (!sizingEl)
      return null;
    var sp = JSON.parse(sizingEl.textContent || sizingEl.text || "{}");
    if (viewerMode) {
      return sp.viewer;
    } else {
      return sp.browser;
    }
  }
  
  function initSizing(el) {
    var sizing = sizingPolicy(el);
    if (!sizing)
      return;
    
    var cel = document.getElementById("htmlwidget_container");
    if (!cel)
      return;
    
    if (typeof(sizing.padding) !== "undefined") {
      document.body.style.margin = "0";
      document.body.style.padding = paddingToCss(unpackPadding(sizing.padding));
    }
    
    if (sizing.fill) {
      document.body.style.overflow = "hidden";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
      document.documentElement.style.width = "100%";
      document.documentElement.style.height = "100%";
      if (cel) {
        cel.style.position = "absolute";
        var pad = unpackPadding(sizing.padding);
        cel.style.top = pad.top + "px";
        cel.style.right = pad.right + "px";
        cel.style.bottom = pad.bottom + "px";
        cel.style.left = pad.left + "px";
        el.style.width = "100%";
        el.style.height = "100%";
      }
    } else {
      el.style.width = px(sizing.width);
      el.style.height = px(sizing.height);
    }
    
    return {
      getWidth: function() {
        return cel.offsetWidth;
      },
      getHeight: function() {
        return cel.offsetHeight;
      }
    }
  }
  
  // Default implementations for methods
  var defaults = {
    find: function(scope) {
      return querySelectorAll(scope, "." + this.name);
    },
    sizing: {}
  };
  
  // Called by widget bindings to register a new type of widget. The definition
  // object can contain the following properties:
  // - name (required) - A string indicating the binding name, which will be
  //   used by default as the CSS classname to look for.
  // - initialize (optional) - A function(el) that will be called once per
  //   widget element; if a value is returned, it will be passed as the third
  //   value to renderValue.
  // - renderValue (required) - A function(el, data, initValue) that will be
  //   called with data. Static contexts will cause this to be called once per
  //   element; Shiny apps will cause this to be called multiple times per
  //   element, as the data changes.
  window.HTMLWidgets.widget = function(definition) {
    if (!definition.name) {
      throw new Error("Widget must have a name");
    }
    if (!definition.type) {
      throw new Error("Widget must have a type");
    }
    // Currently we only support output widgets
    if (definition.type !== "output") {
      throw new Error("Unrecognized widget type '" + definition.type + "'");
    }
    // TODO: Verify that .name is a valid CSS classname
    if (!definition.renderValue) {
      throw new Error("Widget must have a renderValue function");
    }
    
    // Merge defaults into the definition; don't mutate the original definition.
    // The base object is a Shiny output binding if we're running in Shiny mode,
    // or an empty object if we're not.
    definition = extend(shinyMode ? new Shiny.OutputBinding() : {},
      defaults, definition
    );
    
    if (!shinyMode) {
      // We're not in a Shiny context. Use a simple widget registration scheme.
      window.HTMLWidgets.widgets = window.HTMLWidgets.widgets || [];
      window.HTMLWidgets.widgets.push(definition);
    } else {
      // It's Shiny. Register the definition as an output binding.

      // Wrap renderValue to handle initialization, which unfortunately isn't
      // supported natively by Shiny at the time of this writing.

      // NB: definition.initialize may be undefined, as it's optional.

      // Rename initialize to make sure it isn't called by a future version
      // of Shiny that does support initialize directly.
      definition._htmlwidgets_initialize = definition.initialize;
      delete definition.initialize;

      definition._htmlwidgets_renderValue = definition.renderValue;
      definition.renderValue = function(el, data) {
        if (!elementData(el, "initialized")) {
          initSizing(el);

          elementData(el, "initialized", true);
          if (this._htmlwidgets_initialize) {
            var result = this._htmlwidgets_initialize(el, el.offsetWidth,
              el.offsetHeight);
            elementData(el, "init_result", result);
          }
        }
        Shiny.renderDependencies(data.deps);
        this._htmlwidgets_renderValue(el, data.x,
          elementData(el, "init_result")
        );
      };

      // Wrap resize to include the return value from initialize.
      definition._htmlwidgets_resize = definition.resize;
      definition.resize = function(el, width, height) {
        // Shiny can call resize before initialize/renderValue have been
        // called, which doesn't make sense for widgets.
        if (elementData(el, "initialized")) {
          this._htmlwidgets_resize(el, width, height,
            elementData(el, "init_result"));
        }
      };

      Shiny.outputBindings.register(definition, definition.name);
    }
  };

  // If not Shiny, then render after the document finishes loading
  if (!shinyMode) {
    // Statically render all elements that are of this widget's class
    function staticRender() {
      var bindings = window.HTMLWidgets.widgets || [];
      for (var i = 0; i < bindings.length; i++) {
        var binding = bindings[i];
        var matches = binding.find(document.documentElement);
        for (var j = 0; j < matches.length; j++) {
          var el = matches[j];
          var sizeObj = initSizing(el, binding);
          // TODO: Check if el is already bound
          var initResult;
          if (binding.initialize) {
            initResult = binding.initialize(el,
              sizeObj ? sizeObj.getWidth() : el.offsetWidth,
              sizeObj ? sizeObj.getHeight() : el.offsetHeight
            );
          }
          
          if (binding.resize) {
            var lastSize = {};
            on(window, "resize", function(e) {
              var size = {
                w: sizeObj ? sizeObj.getWidth() : el.offsetWidth,
                h: sizeObj ? sizeObj.getHeight() : el.offsetHeight
              };
              if (size.w === 0 && size.h === 0)
                return;
              if (size.w === lastSize.w && size.h === lastSize.h)
                return;
              lastSize = size;
              binding.resize(el, size.w, size.h, initResult);
            });
          }
          
          var scriptData = document.querySelector("script[data-for='" + el.id + "'][type='application/json']");
          if (scriptData) {
            var data = JSON.parse(scriptData.textContent || scriptData.text);
            binding.renderValue(el, data, initResult);
          }
        }
      }
    }

    // Wait until after the document has loaded to render the widgets.
    if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", function() {
        document.removeEventListener("DOMContentLoaded", arguments.callee, false);
        staticRender();
      }, false);
    } else if (document.attachEvent) {
      document.attachEvent("onreadystatechange", function() {
        if (document.readyState === "complete") {
          document.detachEvent("onreadystatechange", arguments.callee);
          staticRender();
        }
      });
    }
  }
  
  window.HTMLWidgets.getAttachmentUrl = function(depname, key) {
    // If no key, default to the first item
    if (typeof(key) === "undefined")
      key = 1;
    
    var link = document.getElementById(depname + "-" + key + "-attachment");
    if (!link) {
      throw new Error("Attachment " + depname + "/" + key + " not found in document");
    }
    return link.getAttribute("href");
  };

  window.HTMLWidgets.dataframeToD3 = function(df) {
    var names = [];
    var length;
    for (var name in df) {
        if (df.hasOwnProperty(name))
            names.push(name);
        if (typeof(df[name]) !== "object" || typeof(df[name].length) === "undefined") {
            throw new Error("All fields must be arrays");
        } else if (typeof(length) !== "undefined" && length !== df[name].length) {
            throw new Error("All fields must be arrays of the same length");
        }
        length = df[name].length;
    }
    var results = [];
    var item;
    for (var row = 0; row < length; row++) {
        item = {};
        for (var col = 0; col < names.length; col++) {
            item[names[col]] = df[names[col]][row];
        }
        results.push(item);
    }
    return results;
  };
  
  window.HTMLWidgets.transposeArray2D = function(array) {
      var newArray = array[0].map(function(col, i) { 
          return array.map(function(row) { 
              return row[i] 
          })
      });
      return newArray;
  };
})();
