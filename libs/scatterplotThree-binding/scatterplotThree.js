/* scatterplotThree.js
 * A set of example Javascript functions that support a threejs-based 3d
 * scatterplot in R, geared for use with the htmlwidgets and shiny packages.
 */
HTMLWidgets.widget(
{

  name: "scatterplotThree",
  type: "output",

  initialize: function(el, width, height)
  {
    var r = render_init(el, width, height, false);
    var c = new THREE.PerspectiveCamera(39, r.domElement.width/r.domElement.height, 1E-5, 10);
    var s = new THREE.Scene();
    return {renderer: r, camera: c, scene: s, width: parseInt(width), height: parseInt(height)};
  },

  resize: function(el, width, height, stuff)
  {
    stuff.renderer.clear();
    stuff.width = width;
    stuff.height = height;
    stuff.renderer.setSize(parseInt(width), parseInt(height));
    stuff.camera.projectionMatrix = new THREE.Matrix4().makePerspective(stuff.camera.fov,  stuff.renderer.domElement.width/stuff.renderer.domElement.height, stuff.camera.near, stuff.camera.far);
    stuff.camera.lookAt(stuff.scene.position);
    stuff.renderer.render(stuff.scene, stuff.camera);
  },

  renderValue: function(el, x, stuff)
  {
    stuff.renderer = render_init(el, stuff.width, stuff.height, x.options.renderer, x.options.labelmargin);
    if(x.bg) stuff.renderer.setClearColor(new THREE.Color(x.bg));
    scatter(el, x, stuff);
  }
})


function render_init(el, width, height, choice, labelmargin)
{
  var r;
  if(choice=="webgl-buffered") choice = "webgl";  // deprecated. All WebGL is buffered now
  if(Detector.webgl && (choice=="auto" || choice=="webgl"))
  {
    r = new THREE.WebGLRenderer({antialias: true});
    GL=true;
  } else
  {
    r = new THREE.CanvasRenderer();
    GL=false;
  }
  r.setSize(parseInt(width), parseInt(height));
  r.setClearColor("white");
    el.innerHTML = "";
  var coordLabel = document.createElement("div");
  coordLabel.setAttribute("name","coordinate_label");
  coordLabel.style.zIndex = "100";
  coordLabel.style.position = "absolute";
  coordLabel.style.margin = labelmargin;
  el.appendChild(coordLabel);
  el.appendChild(r.domElement);

  return r;
}

// x.options list of options including:
// x.options.axisLabels  3 element list of axis labels
// x.options.grid true/false draw xz grid (requires xtick.length==ztick.length)
// x.options.stroke (optional) stroke color (canvas renderer only)
// x.options.color (optional) either a single color or a vector of colors
// x.options.size (optional) either a single size or a vector of sizes
// x.options.renderer, one of "auto" "canvas" "webgl" or "webgl-buffered"
// x.options.labels (optional) vector of point labels
// x.options 
//   xtick:[0,0.5,1]
//   xticklab:["1","2","3"]
//   ytick:[0,0.5,1]
//   yticklab:["10","20","30"]
//   ztick:[0,0.5,1]
//   zticklab:["-1","0","1"]
//   NOTE: ticks must be in [0,1].
// x.data JSON 3-column data matrix. Data are assumed to be already
//   scaled in a unit box (that is, all coordinates are assumed to lie in the
//   interval [0,1]).

function scatter(el, x, obj)
{
  obj.camera = new THREE.PerspectiveCamera(39, obj.renderer.domElement.width/obj.renderer.domElement.height, 1E-5, 10);
  obj.camera.position.z = 2;
  obj.camera.position.x = 2.55;
  obj.camera.position.y = 1.25;

  obj.scene = new THREE.Scene();
  var group = new THREE.Object3D();      // contains non-point plot elements
  var pointgroup = new THREE.Object3D(); // contains point elements
  group.name = "group";
  pointgroup.name = "pointgroup";
  obj.scene.add( group );
  obj.scene.add( pointgroup );
  obj.raycaster = new THREE.Raycaster();
  obj.raycaster.params.PointCloud.threshold = 0.05; // XXX Investigate these units...
HOMER=obj;


// program for drawing a Canvas point
  var program = function ( context )
  {
    context.beginPath();
    context.arc( 0, 0, 0.5, 0, Math.PI*2, true );
    if(x.options.stroke)
    {
      context.strokeStyle = x.options.stroke;
      context.lineWidth = 0.15;
      context.stroke();
    }
    context.fill();
  };
// add the points
  var j;
  if(GL)
  {
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array( x.data.length );
    var colors = new Float32Array( x.data.length );
    var col = new THREE.Color("steelblue");
    var scale = 0.07;
    if(x.options.size && !Array.isArray(x.options.size)) scale = 0.07 * x.options.size;
    for ( var i = 0; i < x.data.length; i++ )
    {
      positions[i] = x.data[i];
    }
    for(var i=0;i<x.data.length/3;i++)
    {
      j = i*3;
      if(x.options.color)
      {
        if(Array.isArray(x.options.color)) col = new THREE.Color(x.options.color[i]);
        else col = new THREE.Color(x.options.color);
      }
      colors[j] = col.r;
      colors[j+1] = col.g;
      colors[j+2] = col.b;
    }
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
    geometry.computeBoundingSphere();
    var pcmaterial = new THREE.PointCloudMaterial( { size: scale, vertexColors: THREE.VertexColors } );
    var particleSystem = new THREE.PointCloud( geometry, pcmaterial );
    pointgroup.add( particleSystem );
  }
  else {
    var col = new THREE.Color("steelblue");
    var scale = 0.03;
    for ( var i = 0; i < x.data.length/3; i++ )
    {
      j = i*3;
      if(x.options.color)
      {
        if(Array.isArray(x.options.color)) col = new THREE.Color(x.options.color[i]);
        else col = new THREE.Color(x.options.color);
      }
      if(x.options.size)
      {
        if(Array.isArray(x.options.size)) scale = 0.03*x.options.size[i];
        else scale = 0.03*x.options.size;
      }
      var material = new THREE.SpriteCanvasMaterial( {
          color: col, program: program , opacity:0.9} );
      var particle = new THREE.Sprite( material );
      particle.position.x = x.data[j];
      particle.position.y = x.data[j+1];
      particle.position.z = x.data[j+2];
      particle.scale.x = particle.scale.y = scale;
// Label points.
      if(x.options.labels)
      {
        if(Array.isArray(x.options.labels)) particle.name = x.options.labels[i];
        else particle.name = x.options.labels;
      }
      pointgroup.add( particle );
    }
  }

// helper function to add text to object
  function addText(object, string, scale, x, y, z, color)
  {
    var canvas = document.createElement('canvas');
    var size = 256;
    canvas.width = size;
    canvas.height = size;
    var context = canvas.getContext('2d');
    context.fillStyle = "#" + color.getHexString();
    context.textAlign = 'center';
    context.font = '24px Arial';
    context.fillText(string, size / 2, size / 2);
    var amap = new THREE.Texture(canvas);
    amap.needsUpdate = true;
    var mat = new THREE.SpriteMaterial({
      map: amap,
      transparent: true,
      useScreenCoordinates: false,
      color: 0xffffff });
    sp = new THREE.Sprite(mat);
    sp.scale.set( scale, scale, scale );
    sp.position.x = x;
    sp.position.y = y;
    sp.position.z = z;
    object.add(sp);
  }

// Set up the axes
  var axisColor = new THREE.Color("#000000");
  if(x.bg)
  {
    var bgcolor = new THREE.Color(x.bg);
    axisColor.r = 1 - bgcolor.r;
    axisColor.g = 1 - bgcolor.g;
    axisColor.b = 1 - bgcolor.b;
  }

  var fontSize = Math.max(Math.round(1/4), 8);
  var fontOffset = Math.min(Math.round(fontSize/4), 8);
  var xAxisGeo = new THREE.Geometry();
  var yAxisGeo = new THREE.Geometry();
  var zAxisGeo = new THREE.Geometry();
  function v(x,y,z){ return new THREE.Vector3(x,y,z); }
  xAxisGeo.vertices.push(v(0, 0, 0), v(1, 0, 0));
  yAxisGeo.vertices.push(v(0, 0, 0), v(0, 1, 0));
  zAxisGeo.vertices.push(v(0, 0, 0), v(0, 0, 1));
  var xAxis = new THREE.Line(xAxisGeo, new THREE.LineBasicMaterial({color: axisColor, linewidth: 1}));
  var yAxis = new THREE.Line(yAxisGeo, new THREE.LineBasicMaterial({color: axisColor, linewidth: 1}));
  var zAxis = new THREE.Line(zAxisGeo, new THREE.LineBasicMaterial({color: axisColor, linewidth: 1}));
  xAxis.type = THREE.Lines;
  yAxis.type = THREE.Lines;
  zAxis.type = THREE.Lines;
  group.add(xAxis);
  group.add(yAxis);
  group.add(zAxis);
  if(x.options.axisLabels)
  {
    addText(group, x.options.axisLabels[0], 0.8, 1.1, 0, 0, axisColor)
    addText(group, x.options.axisLabels[1], 0.8, 0, 1.1, 0, axisColor)
    addText(group, x.options.axisLabels[2], 0.8, 0, 0, 1.1, axisColor)
  }


// Ticks and tick labels
  var tickColor = axisColor;
  tickColor.r = Math.min(tickColor.r + 0.2, 1);
  tickColor.g = Math.min(tickColor.g + 0.2, 1);
  tickColor.b = Math.min(tickColor.b + 0.2, 1);
  function tick(length, thickness, axis, ticks, ticklabels)
  {
    for(var j=0; j<ticks.length; j++)
    {
      var tick = new THREE.Geometry();
      var a1 = ticks[j]; var a2 = ticks[j]; var a3=ticks[j];
      var b1 = length; var b2 = -length; var b3=-0.05;
      var c1 = 0; var c2 = 0; var c3=-0.08;
      if(axis==1){a1=length; b1=ticks[j]; c1=0; a2=-length; b2=ticks[j]; c2=0; a3=0.08; b3=ticks[j]; c3=-0.05;}
      else if(axis==2){a1=0; b1=length; c1=ticks[j];a2=0;b2=-length;c2=ticks[j]; a3=-0.08; b3=-0.05; c3=ticks[j];}
      tick.vertices.push(v(a1,b1,c1),v(a2,b2,c2));
      if(ticklabels)
        addText(group, ticklabels[j], 0.5, a3, b3, c3, tickColor);
      var tl = new THREE.Line(tick, new THREE.LineBasicMaterial({color: tickColor, linewidth: thickness}));
      tl.type=THREE.Lines;
      group.add(tl);
    }
  }
  if(x.options.xtick) tick(0.005,3,0,x.options.xtick,x.options.xticklab);
  if(x.options.ytick) tick(0.005,3,1,x.options.ytick,x.options.yticklab);
  if(x.options.ztick) tick(0.005,3,2,x.options.ztick,x.options.zticklab);

// Grid
  if(x.options.grid && x.options.xtick && x.options.ztick && x.options.xtick.length==x.options.ztick.length)
  {
    for(var j=1; j<x.options.xtick.length; j++)
    {
      var gridline = new THREE.Geometry();
      gridline.vertices.push(v(x.options.xtick[j],0,0),v(x.options.xtick[j],0,1));
      var gl = new THREE.Line(gridline, new THREE.LineBasicMaterial({color: tickColor, linewidth: 1}));
      gl.type=THREE.Lines;
      group.add(gl);
      gridline = new THREE.Geometry();
      gridline.vertices.push(v(0,0,x.options.ztick[j]),v(1,0,x.options.ztick[j]));
      gl = new THREE.Line(gridline, new THREE.LineBasicMaterial({color: tickColor, linewidth: 1}));
      gl.type=THREE.Lines;
      group.add(gl);
    }
  }


  var mouse = new THREE.Vector2();
  var down = false;
  var sx = 0, sy = 0;
  el.onmousedown = function (ev)
  {
    down = true; sx = ev.clientX; sy = ev.clientY;
  };
  el.onmouseup = function(){ down = false; };
  function mousewheel(event)
  {
    var fovMAX = 180;
    var fovMIN = 1;
    event.wheelDeltaY = event.wheelDeltaY || -10*event.detail || event.wheelDelta;
    if(GL) obj.camera.fov -= event.wheelDeltaY * 0.02;
    else obj.camera.fov -= event.wheelDeltaY * 0.0075;
    obj.camera.fov = Math.max( Math.min( obj.camera.fov, fovMAX ), fovMIN );
    obj.camera.projectionMatrix = new THREE.Matrix4().makePerspective(obj.camera.fov,  obj.renderer.domElement.width/obj.renderer.domElement.height, obj.camera.near, obj.camera.far);
    render();
  }
  el.onmousewheel = function(ev) {ev.preventDefault();};
  el.addEventListener('DOMMouseScroll', mousewheel, true);
  el.addEventListener('mousewheel', mousewheel, true);

  el.onmousemove = function(ev)
  { 
    ev.preventDefault();

    var canvasRect = this.getBoundingClientRect();
    mouse.x = 2 * ( ev.clientX - canvasRect.left ) / canvasRect.width - 1;
    mouse.y = -2 * ( ev.clientY - canvasRect.top ) / canvasRect.height + 1;

    if (down) {
      var dx = ev.clientX - sx;
      var dy = ev.clientY - sy;
      group.rotation.y += dx*0.01;
      pointgroup.rotation.y += dx*0.01;
      obj.camera.position.y += 0.05*dy;
      if(obj.camera.position.y < -8) obj.camera.position.y = -8;
      if(obj.camera.position.y > 8) obj.camera.position.y = 8;
      sx += dx;
      sy += dy;
      render();
    } else
    {
      onMouseHover();
    }
  };

  function onMouseHover()
  {
    var label = "";
    // update the picking ray with the camera and mouse position
    obj.raycaster.setFromCamera( mouse, obj.camera );
    // calculate objects intersecting the picking ray
    var particles = obj.scene.getObjectByName('pointgroup');
    if(GL)
    {
      var intersects = obj.raycaster.intersectObject( particles, true );
      if(intersects.length > 0) {
        if(x.options.labels)
        {
          if(Array.isArray(x.options.labels)) label = x.options.labels[intersects[0].index];
          else label = x.options.labels;
        }
      }
    } else
    {
      var intersects = obj.raycaster.intersectObjects( particles.children );
      // add new labels to the points that are being hovered over now
      if ( intersects.length > 0 ) {
        label = intersects[0].object.name;
      }
    }
    //This actually synchronises all scatter plot labels, but I don't know how to 
    //get a unique name 
    var labels = document.getElementsByName("coordinate_label");
    for(var i =0 ; i < labels.length ; i++){
      labels[i].innerHTML = label;
    }
  }

  function render()
  { 
    obj.renderer.clear();
    obj.camera.lookAt(obj.scene.position);
    obj.renderer.render(obj.scene, obj.camera);
  }

  render();
// See the note about rendering in the globe.js widget.
}
