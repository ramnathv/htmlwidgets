HTMLWidgets.widget({

  name: 'rbokeh',

  type: 'output',

  initialize: function(el, width, height) {
    return {
      modelid: "",
      elementid: "",
      width: width,
      height: height
    };
  },

  renderValue: function(el, x, instance) {

    //clear el for Shiny/dynamic contexts
    el.innerHTML = "";

    if(x.isJSON === true) {
      x.docs_json = JSON.parse(x.docs_json);
    }

    var refkey = Object.keys(x.docs_json)[0];
    var refs = x.docs_json[refkey].roots.references;

    // set size from initialize if "figure" (doesn't work for gridplot now)
    if(x.padding.type === "figure") {
      if(instance.width) {
        refs[0].attributes.plot_width = instance.width - x.padding.y_pad;
      }
      if(instance.height) {
        refs[0].attributes.plot_height = instance.height - x.padding.x_pad;
      }
    }

    instance.modelid = x.modelid;
    instance.elementid = x.elementid;

    if(x.debug === true) {
      console.log(refs);
      console.log(JSON.stringify(refs));
    }

    // change "nulls" in data to NaN
    function traverseObject(obj) {
      for(var key in obj) {
        if(obj[key].constructor === Object) {
          traverseObject(obj[key]);
        } else if(obj[key].constructor === Array) {
          for (var i = 0; i < obj[key].length; i++) {
            if(obj[key][i] === null)
              obj[key][i] = NaN;
          }
        }
      }
    }
    for(var i = 0; i < refs.length; i++) {
      if(refs[i].type === "ColumnDataSource")
        traverseObject(refs[i].attributes.data);
    }

    var dv = document.createElement('div');
    dv.id = x.elementid;
    dv.setAttribute("class", "plotdiv");
    el.appendChild(dv);

    var render_items = [{
      "docid": x.docid,
      "elementid": x.elementid,
      "modelid": x.modelid
    }];

    if(x.debug !== true) {
      Bokeh.set_log_level('info');
    }

    Bokeh.embed.embed_items(x.docs_json, render_items);
  },

  resize: function(el, width, height, instance) {
    // var width = 800;
    // var height = 500;

    var box = el.getElementsByTagName("table")[0];

    if(Bokeh.index[instance.modelid].model.attributes.children) {
      // it is a gridplot (TODO)
      // need to get dimensions and set dimensions of all plots
      // Bokeh.index[instance.modelid].child_views["_id_"].canvas._set_dims([300,300])
    } else {
      // it's a regular plot
      var bk_canvas = el.getElementsByClassName("bk-canvas-wrapper")[0];
      var h_pad = box.clientHeight - bk_canvas.clientHeight;
      var w_pad = box.clientWidth - bk_canvas.clientWidth;

      // TODO: also shrink font sizes, etc., to a certain degree?
      Bokeh.index[instance.modelid].canvas._set_dims([width - w_pad,height - h_pad]);
    }
  }

});

