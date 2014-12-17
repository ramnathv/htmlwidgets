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
    var r = {width:width, height:height};
    return r;
  },

  resize: function(el, width, height, obj)
  {
// We rely on three global variables here:
// renderer, scene, and camera.
    renderer.clear();
    renderer.setSize(parseInt(width), parseInt(height));
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  },

  renderValue: function(el, x, obj)
  {
// Note that renderer is a global variable. It's accessed by resize above.
// We need to defer creating the renderer because our choice of rendering
// method is defined in x.
    renderer = render_init(el, obj.width, obj.height, x.options.renderer);
// parse the JSON string from R
    x.data = JSON.parse(x.data);
    scatter(el, x, renderer);
  }
})


function render_init(el, width, height, choice)
{
  var r;
  if(choice=="webgl-buffered") choice = "webgl";
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
  d3.select(el).node().innerHTML="";
  d3.select(el).node().appendChild(r.domElement);
  return r;
}

// x.options list of options including:
// x.options.labels  3 element list of axis labels
// x.options.grid true/false draw xz grid (requires xtick.length==ztick.length)
// x.options.stroke (optional) stroke color (canvas renderer only)
// x.options.color (optional) either a single color or a vector of colors
// x.options.size (optional) either a single size or a vector of sizes
// x.options.renderer, one of "auto" "canvas" "webgl" or "webgl-buffered"
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
// x.pch.img is an encoded image dataURI used by the WebGL PointCloud renderer only

function scatter(el, x, object)
{
  camera = new THREE.PerspectiveCamera(39, object.domElement.width/object.domElement.height, 1, 10000);
  camera.position.z = 2;
  camera.position.x = 2.55;
  camera.position.y = 1.25;

  scene = new THREE.Scene();
  var group = new THREE.Object3D();
  scene.add( group );


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
    if(x.options.renderer=="webgl-buffered")
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
      group.add( particleSystem );
    } else
    {
      var img = document.createElement("img");
      img.src = x.pch.img;
      tex = new THREE.Texture();
      tex.image = img;
      tex.needsUpdate = true;
      var geometry = new THREE.Geometry();
      var colors = [];
      var col = new THREE.Color("steelblue");
      var scale = 0.1;
      if(x.options.size && !Array.isArray(x.options.size)) scale = 0.1 * x.options.size;
      for ( var i = 0; i < x.data.length/3; i++ )
      {
        j = i*3;
        if(x.options.color)
        {
          if(Array.isArray(x.options.color)) col = new THREE.Color(x.options.color[i]);
          else col = new THREE.Color(x.options.color);
        }
        colors[i] = col;
        var vertex = new THREE.Vector3();
        vertex.x = x.data[j];
        vertex.y = x.data[j+1];
        vertex.z = x.data[j+2];
        geometry.vertices.push( vertex );
      }
      geometry.colors = colors;
      var pcmaterial = new THREE.PointCloudMaterial( {map:tex, size: scale, vertexColors: THREE.VertexColors, transparent: true,  opacity: 0.9} );
      var particles = new THREE.PointCloud( geometry, pcmaterial );
      particles.sortParticles = true;
      group.add(particles);
    }
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
      group.add( particle );
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
    context.fillStyle = color;
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
  var fontSize = Math.max(Math.round(1/4), 8);
  var fontOffset = Math.min(Math.round(fontSize/4), 8);
  var xAxisGeo = new THREE.Geometry();
  var yAxisGeo = new THREE.Geometry();
  var zAxisGeo = new THREE.Geometry();
  function v(x,y,z){ return new THREE.Vector3(x,y,z); }
  xAxisGeo.vertices.push(v(0, 0, 0), v(1, 0, 0));
  yAxisGeo.vertices.push(v(0, 0, 0), v(0, 1, 0));
  zAxisGeo.vertices.push(v(0, 0, 0), v(0, 0, 1));
  var xAxis = new THREE.Line(xAxisGeo, new THREE.LineBasicMaterial({color: 0x000000, linewidth: 1}));
  var yAxis = new THREE.Line(yAxisGeo, new THREE.LineBasicMaterial({color: 0x000000, linewidth: 1}));
  var zAxis = new THREE.Line(zAxisGeo, new THREE.LineBasicMaterial({color: 0x000000, linewidth: 1}));
  xAxis.type = THREE.Lines;
  yAxis.type = THREE.Lines;
  zAxis.type = THREE.Lines;
  group.add(xAxis);
  group.add(yAxis);
  group.add(zAxis);
  if(x.options.labels)
  {
    addText(group, x.options.labels[0], 0.8, 1.1, 0, 0, "black")
    addText(group, x.options.labels[1], 0.8, 0, 1.1, 0, "black")
    addText(group, x.options.labels[2], 0.8, 0, 0, 1.1, "black")
  }


// Ticks and tick labels
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
        addText(group, parseFloat(ticklabels[j]).toFixed(1), 0.5, a3, b3, c3, "#555");
      var tl = new THREE.Line(tick, new THREE.LineBasicMaterial({color: 0x000000, linewidth: thickness}));
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
      var gl = new THREE.Line(gridline, new THREE.LineBasicMaterial({color: 0x555555, linewidth: 1}));
      gl.type=THREE.Lines;
      group.add(gl);
      gridline = new THREE.Geometry();
      gridline.vertices.push(v(0,0,x.options.ztick[j]),v(1,0,x.options.ztick[j]));
      gl = new THREE.Line(gridline, new THREE.LineBasicMaterial({color: 0x555555, linewidth: 1}));
      gl.type=THREE.Lines;
      group.add(gl);
    }
  }


  var down = false;
  var sx = 0, sy = 0;
  el.onmousedown = function (ev)
  {
    down = true; sx = ev.clientX; sy = ev.clientY;
  };
  el.onmouseup = function(){ down = false; };
  function mousewheel(event)
  {
    var fovMAX = 100;
    var fovMIN = 10;
    if(GL) camera.fov -= event.wheelDeltaY * 0.02;
    else camera.fov -= event.wheelDeltaY * 0.0075;
    camera.fov = Math.max( Math.min( camera.fov, fovMAX ), fovMIN );
    camera.projectionMatrix = new THREE.Matrix4().makePerspective(camera.fov,  object.domElement.width/object.domElement.height, camera.near, camera.far);
    render();
  }
  el.onmousewheel = function(ev) {ev.preventDefault();};
  el.addEventListener('DOMMouseScroll', mousewheel, true);
  el.addEventListener('mousewheel', mousewheel, true);

  el.onmousemove = function(ev)
  { 
    ev.preventDefault();
    if (down) {
      var dx = ev.clientX - sx;
      var dy = ev.clientY - sy;
      group.rotation.y += dx*0.01;
      camera.position.y += 0.05*dy;
      sx += dx;
      sy += dy;
      render();
    }
  };

  function render()
  { 
    object.clear();
    camera.lookAt(scene.position);
    object.render(scene, camera);
  }

  render();
// See the note about rendering in the globe.js widget.
}
