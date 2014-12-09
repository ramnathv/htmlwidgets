HTMLWidgets.widget(
{

  name: "scatterplotThree",
  type: "output",

  initialize: function(el, width, height)
  {
    var r = renderer(el, width, height);
    return r;
  },

  resize: function(el, width, height, renderer)
  {
  },

  renderValue: function(el, x, renderer)
  {
// parse the JSON string from R
    x.data = JSON.parse(x.data);
    scatter(el, x, renderer);
  }
})
