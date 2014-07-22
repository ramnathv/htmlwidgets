(function() {
  // If window.HTMLWidgets is already defined, then use it; otherwise create a
  // new object. This allows preceding code to set options that affect the
  // initialization process (though none currently exist).
  window.HTMLWidgets = window.HTMLWidgets || {};
  
  // Default implementations for find and initialize
  var defaults = {
    find: function(scope) {
      return scope.querySelectorAll("." + this.name);
    },
    initialize: function(el) {
    }
  };
  
  // Equivalent of $.extend
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
    // TODO: Verify that .name is a valid CSS classname
    if (!definition.renderValue) {
      throw new Error("Widget must have a renderValue function");
    }
    
    // Merge defaults into the definition; don't mutate the original definition
    definition = extend({}, defaults, definition);
    
    if (typeof(window.Shiny) === "undefined") {
      // We're not in a Shiny context. Use a simple widget registration scheme.
      window.HTMLWidgets.widgets = window.HTMLWidgets.widgets || [];
      window.HTMLWidgets.widgets.push(definition);
    } else {
      // It's Shiny. Register the definition as an output binding. Right now
      // the definition is compatible with Shiny output bindings; if this is
      // ever not the case, an adaptor would be created here.
      var bindingName = "htmlwidgets.outputbindings." + definition.name;
      Shiny.outputBindings.register(definition, bindingName);
    }
  }

  // Statically render all elements that are of this widget's class
  function staticRender() {
    var widgets = window.HTMLWidgets.widgets || [];
    for (var i = 0; i < widgets.length; i++) {
      var widget = widgets[i];
      var matches = widget.find(document.documentElement);
      for (var j = 0; j < matches.length; j++) {
        var el = matches[j];
        // TODO: Check if el is already bound
        var initResult = widget.initialize(el);
        
        var scriptData = document.querySelector("script[data-for='" + el.id + "']");
        if (scriptData) {
          var data = JSON.parse(scriptData.textContent || scriptData.text);
          widget.renderValue(el, data, initResult);
        }
      }
    }
  }

  // If not Shiny, then render after the document finishes loading
  if (typeof(window.Shiny) === "undefined") {
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
})();
