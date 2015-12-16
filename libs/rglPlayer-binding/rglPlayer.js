/* el is the <span>, holding x as el.rglPlayer
   x is the JSON encoded playwidget.
   instance holds x as instance.rglPlayer
*/

HTMLWidgets.widget({

  name: 'rglPlayer',

  type: 'output',

  initialize: function(el, width, height) {
    return {
    };

  },

  renderValue: function(el, x, instance) {
    var ShowValue = function(value) {
        var scene = window[x.sceneId].rglinstance;
        x.value = value;
      /* We might be running before the scene exists.  If so, it
         will have to apply our initial value. */
        if (typeof scene !== "undefined") {
          scene.Player(el, x);
          instance.initialized = true;
        } else {
          instance.rglPlayer = x;
          instance.initialized = false;
        }
      };

    el.rglPlayer = x;
    instance.rglPlayer = x;

    if (x.respondTo !== null) {
      var control = window[x.respondTo];
      if (typeof control !== "undefined") {
        var self = this, i,
            state = "idle";

        /* Store the previous handler on the control,
           so multiple calls here don't pile up a chain of
           old handlers */

        if (typeof control.rglOldhandler === "undefined")
          control.rglOldhandler = control.onchange;

        control.onchange = function() {
          /* If we are called n>0 times while servicing a previous call, we want to finish
             the current call, then run again.  But the old handler might want to
             see every change. */
          if (state !== "idle") {
            state = "interrupted";
            if (control.rglOldhandler !== null)
              control.rglOldhandler.call(this);
          }
          do {
            state = "busy";
            if (control.rglOldhandler !== null)
              control.rglOldhandler.call(this);
            ShowValue(control.value);
            if (state === "busy")
              state = "idle";
          } while (state !== "idle");
        };
        ShowValue(control.value);
      }
    }
    ShowValue(x.value);
  },

  resize: function(el, width, height, instance) {
  }

});
