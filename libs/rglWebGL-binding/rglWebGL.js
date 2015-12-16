/* el is the div, holding the rgl object as el.rglinstance,
     which holds x as el.rglinstance.scene
   x is the JSON encoded rglwidget.
*/


HTMLWidgets.widget({

  name: 'rglWebGL',

  type: 'output',

  initialize: function(el, width, height) {
    el.width = width;
    el.height = height;
    return {};

  },

  renderValue: function(el, x) {
    var rgl = new rglwidgetClass(), i, pel, player,
      draw = true;
    rgl.initialize(el, x);

    /* We might have been called after (some of) the players were rendered.
       We need to make sure we respond to their initial values. */

    if (typeof x.players !== "undefined") {
      x.players = [].concat(x.players);
      for (i = 0; i < x.players.length; i++) {
        pel = window[x.players[i]];
        if (typeof pel !== "undefined") {
          player = pel.rglPlayer;
          if (typeof player !== "undefined" && !player.initialized) {
            rgl.Player(pel, player, false);
            player.initialized = true;
          } else
            draw = false;  // The player will do the drawing
        } else
          rgl.alertOnce("Controller '" + x.players[i] + "' not found.");
      }
    }
    rgl.drag = 0;
    if (draw)
      rgl.drawScene();
  },

  resize: function(el, width, height) {
    el.width = width;
    el.height = height;
    el.rglinstance.resize(el);
    el.rglinstance.drawScene();
  }

});
