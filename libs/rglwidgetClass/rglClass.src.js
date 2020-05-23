// To generate the help pages for this library, use

// jsdoc --destination ../../../doc/rglwidgetClass --template ~/node_modules/jsdoc-baseline rglClass.src.js

// To validate, use

// setwd(".../inst/htmlwidgets/lib/rglClass")
// hints <- js::jshint(readLines("rglClass.src.js"))
// hints[, c("line", "reason")]

/**
 * The class of an rgl widget
 * @class
*/
rglwidgetClass = function() {
    this.canvas = null;
    this.userMatrix = new CanvasMatrix4();
    this.types = [];
    this.prMatrix = new CanvasMatrix4();
    this.mvMatrix = new CanvasMatrix4();
    this.vp = null;
    this.prmvMatrix = null;
    this.origs = null;
    this.gl = null;
    this.scene = null;
    this.select = {state: "inactive", subscene: null, region: {p1: {x:0, y:0}, p2: {x:0, y:0}}};
    this.drawing = false;
};


    /**
     * Multiply matrix by vector
     * @returns {number[]}
     * @param M {number[][]} Left operand
     * @param v {number[]} Right operand
     */
    rglwidgetClass.prototype.multMV = function(M, v) {
        return [ M.m11 * v[0] + M.m12 * v[1] + M.m13 * v[2] + M.m14 * v[3],
                 M.m21 * v[0] + M.m22 * v[1] + M.m23 * v[2] + M.m24 * v[3],
                 M.m31 * v[0] + M.m32 * v[1] + M.m33 * v[2] + M.m34 * v[3],
                 M.m41 * v[0] + M.m42 * v[1] + M.m43 * v[2] + M.m44 * v[3]
               ];
    };
    
    /**
     * Multiply row vector by Matrix
     * @returns {number[]}
     * @param v {number[]} left operand
     * @param M {number[][]} right operand
     */
    rglwidgetClass.prototype.multVM = function(v, M) {
        return [ M.m11 * v[0] + M.m21 * v[1] + M.m31 * v[2] + M.m41 * v[3],
                 M.m12 * v[0] + M.m22 * v[1] + M.m32 * v[2] + M.m42 * v[3],
                 M.m13 * v[0] + M.m23 * v[1] + M.m33 * v[2] + M.m43 * v[3],
                 M.m14 * v[0] + M.m24 * v[1] + M.m34 * v[2] + M.m44 * v[3]
               ];
    };
    
    /**
     * Euclidean length of a vector
     * @returns {number}
     * @param v {number[]}
     */
    rglwidgetClass.prototype.vlen = function(v) {
      return Math.sqrt(this.dotprod(v, v));
    };

    /**
     * Dot product of two vectors
     * @instance rglwidgetClass
     * @returns {number}
     * @param a {number[]}
     * @param b {number[]}
     */
    rglwidgetClass.prototype.dotprod = function(a, b) {
      return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    };

    /**
     * Cross product of two vectors
     * @returns {number[]}
     * @param a {number[]}
     * @param b {number[]}
     */
    rglwidgetClass.prototype.xprod = function(a, b) {
      return [a[1]*b[2] - a[2]*b[1],
          a[2]*b[0] - a[0]*b[2],
          a[0]*b[1] - a[1]*b[0]];
    };

    /**
     * Bind vectors or matrices by columns
     * @returns {number[][]}
     * @param a {number[]|number[][]}
     * @param b {number[]|number[][]}
     */
    rglwidgetClass.prototype.cbind = function(a, b) {
      if (b.length < a.length)
        b = this.repeatToLen(b, a.length);
      else if (a.length < b.length)
        a = this.repeatToLen(a, b.length);
      return a.map(function(currentValue, index, array) {
            return currentValue.concat(b[index]);
      });
    };

    /**
     * Swap elements
     * @returns {any[]}
     * @param a {any[]}
     * @param i {number} Element to swap
     * @param j {number} Other element to swap
     */
    rglwidgetClass.prototype.swap = function(a, i, j) {
      var temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    };

    /**
     * Flatten a matrix into a vector
     * @returns {any[]}
     * @param a {any[][]}
     */
    rglwidgetClass.prototype.flatten = function(arr, result) {
      var value;
      if (typeof result === "undefined") result = [];
      for (var i = 0, length = arr.length; i < length; i++) {
        value = arr[i];
        if (Array.isArray(value)) {
          this.flatten(value, result);
        } else {
          result.push(value);
        }
      }
      return result;
    };

    /**
     * set element of 1d or 2d array as if it was flattened.
     * Column major, zero based!
     * @returns {any[]|any[][]}
     * @param {any[]|any[][]} a - array
     * @param {number} i - element
     * @param {any} value
     */
    rglwidgetClass.prototype.setElement = function(a, i, value) {
      if (Array.isArray(a[0])) {
        var dim = a.length,
            col = Math.floor(i/dim),
            row = i % dim;
        a[row][col] = value;
      } else {
        a[i] = value;
      }
    };

    /**
     * Transpose an array
     * @returns {any[][]}
     * @param {any[][]} a
     */
    rglwidgetClass.prototype.transpose = function(a) {
      var newArray = [],
          n = a.length,
          m = a[0].length,
          i;
      for(i = 0; i < m; i++){
        newArray.push([]);
      }

      for(i = 0; i < n; i++){
        for(var j = 0; j < m; j++){
          newArray[j].push(a[i][j]);
        }
      }
      return newArray;
    };

    /**
     * Calculate sum of squares of a numeric vector
     * @returns {number}
     * @param {number[]} x
     */
    rglwidgetClass.prototype.sumsq = function(x) {
      var result = 0, i;
      for (i=0; i < x.length; i++)
        result += x[i]*x[i];
      return result;
    };

    /**
     * Convert a matrix to a CanvasMatrix4
     * @returns {CanvasMatrix4}
     * @param {number[][]|number[]} mat
     */
    rglwidgetClass.prototype.toCanvasMatrix4 = function(mat) {
      if (mat instanceof CanvasMatrix4)
        return mat;
      var result = new CanvasMatrix4();
      mat = this.flatten(this.transpose(mat));
      result.load(mat);
      return result;
    };

    /**
     * Convert an R-style numeric colour string to an rgb vector
     * @returns {number[]}
     * @param {string} s
     */
    rglwidgetClass.prototype.stringToRgb = function(s) {
      s = s.replace("#", "");
      var bigint = parseInt(s, 16);
      return [((bigint >> 16) & 255)/255,
              ((bigint >> 8) & 255)/255,
               (bigint & 255)/255];
    };

    /**
     * Take a component-by-component product of two 3 vectors
     * @returns {number[]}
     * @param {number[]} x
     * @param {number[]} y
     */
    rglwidgetClass.prototype.componentProduct = function(x, y) {
      if (typeof y === "undefined") {
        this.alertOnce("Bad arg to componentProduct");
      }
      var result = new Float32Array(3), i;
      for (i = 0; i<3; i++)
        result[i] = x[i]*y[i];
      return result;
    };

    /**
     * Get next higher power of two
     * @returns { number }
     * @param { number } value - input value
     */
    rglwidgetClass.prototype.getPowerOfTwo = function(value) {
      var pow = 1;
      while(pow<value) {
        pow *= 2;
      }
      return pow;
    };

    /**
     * Unique entries
     * @returns { any[] }
     * @param { any[] } arr - An array
     */
    rglwidgetClass.prototype.unique = function(arr) {
      arr = [].concat(arr);
      return arr.filter(function(value, index, self) {
        return self.indexOf(value) === index;
      });
    };

    /**
     * Shallow compare of arrays
     * @returns { boolean }
     * @param { any[] } a - An array
     * @param { any[] } b - Another array
     */
    rglwidgetClass.prototype.equalArrays = function(a, b) {
      return a === b || (a && b &&
                      a.length === b.length &&
                      a.every(function(v, i) {return v === b[i];}));
    };
    
    /**
     * Repeat an array to a desired length
     * @returns {any[]}
     * @param {any | any[]} arr The input array
     * @param {number} len The desired output length
     */
    rglwidgetClass.prototype.repeatToLen = function(arr, len) {
      arr = [].concat(arr);
      while (arr.length < len/2)
        arr = arr.concat(arr);
      return arr.concat(arr.slice(0, len - arr.length));
    };

    /**
     * Give a single alert message, not to be repeated.
     * @param {string} msg  The message to give.
     */
    rglwidgetClass.prototype.alertOnce = function(msg) {
      if (typeof this.alerted !== "undefined")
        return;
      this.alerted = true;
      alert(msg);
    };

    rglwidgetClass.prototype.f_is_lit = 1;
    rglwidgetClass.prototype.f_is_smooth = 2;
    rglwidgetClass.prototype.f_has_texture = 4;
    rglwidgetClass.prototype.f_depth_sort = 8;
    rglwidgetClass.prototype.f_fixed_quads = 16;
    rglwidgetClass.prototype.f_is_transparent = 32;
    rglwidgetClass.prototype.f_is_lines = 64;
    rglwidgetClass.prototype.f_sprites_3d = 128;
    rglwidgetClass.prototype.f_sprite_3d = 256;
    rglwidgetClass.prototype.f_is_subscene = 512;
    rglwidgetClass.prototype.f_is_clipplanes = 1024;
    rglwidgetClass.prototype.f_fixed_size = 2048;
    rglwidgetClass.prototype.f_is_points = 4096;
    rglwidgetClass.prototype.f_is_twosided = 8192;
    rglwidgetClass.prototype.f_fat_lines = 16384;
    rglwidgetClass.prototype.f_is_brush = 32768;

    /**
     * Which list does a particular id come from?
     * @returns { string }
     * @param {number} id The id to look up.
     */
    rglwidgetClass.prototype.whichList = function(id) {
      var obj = this.getObj(id),
          flags = obj.flags;
        if (obj.type === "light")
          return "lights";
        if (flags & this.f_is_subscene)
            return "subscenes";
        if (flags & this.f_is_clipplanes)
            return "clipplanes";
        if (flags & this.f_is_transparent)
            return "transparent";
        return "opaque";
    };

    /**
     * Get an object by id number.
     * @returns { Object }
     * @param {number} id
     */
    rglwidgetClass.prototype.getObj = function(id) {
      if (typeof id !== "number") {
        this.alertOnce("getObj id is "+typeof id);
      }
      return this.scene.objects[id];
    };

    /**
     * Get ids of a particular type from a subscene or the whole scene
     * @returns { number[] }
     * @param {string} type What type of object?
     * @param {number} subscene  Which subscene?  If not given, find in the whole scene
     */
    rglwidgetClass.prototype.getIdsByType = function(type, subscene) {
      var
        result = [], i, self = this;
      if (typeof subscene === "undefined") {
        Object.keys(this.scene.objects).forEach(
          function(key) {
            key = parseInt(key, 10);
            if (self.getObj(key).type === type)
              result.push(key);
          });
      } else {
        ids = this.getObj(subscene).objects;
        for (i=0; i < ids.length; i++) {
          if (this.getObj(ids[i]).type === type) {
            result.push(ids[i]);
          }
        }
      }
      return result;
    };

    /**
     * Get a particular material property for an id
     * @returns { any }
     * @param {number} id  Which object?
     * @param {string} property Which material property?
     */
    rglwidgetClass.prototype.getMaterial = function(id, property) {
      var obj = this.getObj(id), mat;
      if (typeof obj.material === "undefined")
        console.error("material undefined");
      mat = obj.material[property];
      if (typeof mat === "undefined")
          mat = this.scene.material[property];
      return mat;
    };

    /**
     * Is a particular id in a subscene?
     * @returns { boolean }
     * @param {number} id Which id?
     * @param {number} subscene Which subscene id?
     */
    rglwidgetClass.prototype.inSubscene = function(id, subscene) {
      return this.getObj(subscene).objects.indexOf(id) > -1;
    };

    /**
     * Add an id to a subscene.
     * @param {number} id Which id?
     * @param {number} subscene Which subscene id?
     */
    rglwidgetClass.prototype.addToSubscene = function(id, subscene) {
      var thelist,
          thesub = this.getObj(subscene),
          ids = [id],
          obj = this.getObj(id), i;
      if (typeof obj != "undefined" && typeof (obj.newIds) !== "undefined") {
        ids = ids.concat(obj.newIds);
      }
      thesub.objects = [].concat(thesub.objects);
      for (i = 0; i < ids.length; i++) {
        id = ids[i];
        if (thesub.objects.indexOf(id) == -1) {
          thelist = this.whichList(id);
          thesub.objects.push(id);
          thesub[thelist].push(id);
        }
      }
    };

    /**
     * Delete an id from a subscene
     * @param { number } id - the id to add
     * @param { number } subscene - the id of the subscene
     */
    rglwidgetClass.prototype.delFromSubscene = function(id, subscene) {
      var thelist,
          thesub = this.getObj(subscene),
          obj = this.getObj(id),
          ids = [id], i;
      if (typeof obj !== "undefined" && typeof (obj.newIds) !== "undefined")
        ids = ids.concat(obj.newIds);
      thesub.objects = [].concat(thesub.objects); // It might be a scalar
      for (j=0; j<ids.length;j++) {
        id = ids[j];
        i = thesub.objects.indexOf(id);
        if (i > -1) {
          thesub.objects.splice(i, 1);
          thelist = this.whichList(id);
          i = thesub[thelist].indexOf(id);
          thesub[thelist].splice(i, 1);
        }
      }
    };

    /**
     * Set the ids in a subscene
     * @param { number[] } ids - the ids to set
     * @param { number } subsceneid - the id of the subscene
     */
    rglwidgetClass.prototype.setSubsceneEntries = function(ids, subsceneid) {
      var sub = this.getObj(subsceneid);
      sub.objects = ids;
      this.initSubscene(subsceneid);
    };

    /**
     * Get the ids in a subscene
     * @returns {number[]}
     * @param { number } subscene - the id of the subscene
     */
    rglwidgetClass.prototype.getSubsceneEntries = function(subscene) {
      return this.getObj(subscene).objects;
    };

    /**
     * Get the ids of the subscenes within a subscene
     * @returns { number[] }
     * @param { number } subscene - the id of the subscene
     */
    rglwidgetClass.prototype.getChildSubscenes = function(subscene) {
      return this.getObj(subscene).subscenes;
    };

    /**
     * Start drawing
     * @returns { boolean } Previous state
     */
    rglwidgetClass.prototype.startDrawing = function() {
    	var value = this.drawing;
    	this.drawing = true;
    	return value;
    };

    /**
     * Stop drawing and check for context loss
     * @param { boolean } saved - Previous state
     */
    rglwidgetClass.prototype.stopDrawing = function(saved) {
      this.drawing = saved;
      if (!saved && this.gl && this.gl.isContextLost())
        this.restartCanvas();
    };

    /**
     * Generate the vertex shader for an object
     * @returns {string}
     * @param { number } id - Id of object
     */
    rglwidgetClass.prototype.getVertexShader = function(id) {
      var obj = this.getObj(id),
          userShader = obj.userVertexShader,
          flags = obj.flags,
          type = obj.type,
          is_lit = flags & this.f_is_lit,
          has_texture = flags & this.f_has_texture,
          fixed_quads = flags & this.f_fixed_quads,
          sprites_3d = flags & this.f_sprites_3d,
          sprite_3d = flags & this.f_sprite_3d,
          nclipplanes = this.countClipplanes(),
          fixed_size = flags & this.f_fixed_size,
          is_points = flags & this.f_is_points,
          is_twosided = flags & this.f_is_twosided,
          fat_lines = flags & this.f_fat_lines,
          is_brush = flags & this.f_is_brush,
          result;

      if (type === "clipplanes" || sprites_3d) return;

      if (typeof userShader !== "undefined") return userShader;

      result = "  /* ****** "+type+" object "+id+" vertex shader ****** */\n"+
      "  attribute vec3 aPos;\n"+
      "  attribute vec4 aCol;\n"+
      " uniform mat4 mvMatrix;\n"+
      " uniform mat4 prMatrix;\n"+
      " varying vec4 vCol;\n"+
      " varying vec4 vPosition;\n";

      if ((is_lit && !fixed_quads && !is_brush) || sprite_3d)
        result = result + "  attribute vec3 aNorm;\n"+
                          " uniform mat4 normMatrix;\n"+
                          " varying vec3 vNormal;\n";

      if (has_texture || type === "text")
        result = result + " attribute vec2 aTexcoord;\n"+
                          " varying vec2 vTexcoord;\n";

      if (fixed_size)
        result = result + "  uniform vec2 textScale;\n";

      if (fixed_quads)
        result = result + "  attribute vec2 aOfs;\n";
      else if (sprite_3d)
        result = result + "  uniform vec3 uOrig;\n"+
                          "  uniform float uSize;\n"+
                          "  uniform mat4 usermat;\n";

      if (is_twosided)
        result = result + "  attribute vec3 aPos1;\n"+
                          "  attribute vec3 aPos2;\n"+
                          "  varying float normz;\n";

      if (fat_lines) {
      	result = result +   "  attribute vec3 aNext;\n"+
                            "  attribute vec2 aPoint;\n"+
                            "  varying vec2 vPoint;\n"+
                            "  varying float vLength;\n"+
                            "  uniform float uAspect;\n"+
                            "  uniform float uLwd;\n";
      }
      
      result = result + "  void main(void) {\n";

      if ((nclipplanes || (!fixed_quads && !sprite_3d)) && !is_brush)
        result = result + "    vPosition = mvMatrix * vec4(aPos, 1.);\n";

      if (!fixed_quads && !sprite_3d && !is_brush)
        result = result + "    gl_Position = prMatrix * vPosition;\n";

      if (is_points) {
        var size = this.getMaterial(id, "size");
        result = result + "    gl_PointSize = "+size.toFixed(1)+";\n";
      }

      result = result + "    vCol = aCol;\n";

      if (is_lit && !fixed_quads && !sprite_3d && !is_brush)
        result = result + "    vNormal = normalize((normMatrix * vec4(aNorm, 1.)).xyz);\n";

      if (has_texture || type == "text")
        result = result + "    vTexcoord = aTexcoord;\n";

      if (fixed_size)
        result = result + "    vec4 pos = prMatrix * mvMatrix * vec4(aPos, 1.);\n"+
                          "   pos = pos/pos.w;\n"+
                          "   gl_Position = pos + vec4(aOfs*textScale, 0.,0.);\n";

      if (type == "sprites" && !fixed_size)
        result = result + "    vec4 pos = mvMatrix * vec4(aPos, 1.);\n"+
                          "   pos = pos/pos.w + vec4(aOfs, 0., 0.);\n"+
                          "   gl_Position = prMatrix*pos;\n";

      if (sprite_3d)
        result = result + "   vNormal = normalize((normMatrix * vec4(aNorm, 1.)).xyz);\n"+
                          "   vec4 pos = mvMatrix * vec4(uOrig, 1.);\n"+
                          "   vPosition = pos/pos.w + vec4(uSize*(vec4(aPos, 1.)*usermat).xyz,0.);\n"+
                          "   gl_Position = prMatrix * vPosition;\n";

      if (is_twosided)
        result = result + "   vec4 pos1 = prMatrix*(mvMatrix*vec4(aPos1, 1.));\n"+
                          "   pos1 = pos1/pos1.w - gl_Position/gl_Position.w;\n"+
                          "   vec4 pos2 = prMatrix*(mvMatrix*vec4(aPos2, 1.));\n"+
                          "   pos2 = pos2/pos2.w - gl_Position/gl_Position.w;\n"+
                          "   normz = pos1.x*pos2.y - pos1.y*pos2.x;\n";
                          
      if (fat_lines) 
        /* This code was inspired by Matt Deslauriers' code in https://mattdesl.svbtle.com/drawing-lines-is-hard */
        result = result + "   vec2 aspectVec = vec2(uAspect, 1.0);\n"+
                          "   mat4 projViewModel = prMatrix * mvMatrix;\n"+
                          "   vec4 currentProjected = projViewModel * vec4(aPos, 1.0);\n"+
                          "   currentProjected = currentProjected/currentProjected.w;\n"+
                          "   vec4 nextProjected = projViewModel * vec4(aNext, 1.0);\n"+
                          "   vec2 currentScreen = currentProjected.xy * aspectVec;\n"+
                          "   vec2 nextScreen = (nextProjected.xy / nextProjected.w) * aspectVec;\n"+
                          "   float len = uLwd;\n"+
                          "   vec2 dir = vec2(1.0, 0.0);\n"+
                          "   vPoint = aPoint;\n"+
                          "   vLength = length(nextScreen - currentScreen)/2.0;\n"+
                          "   vLength = vLength/(vLength + len);\n"+
                          "   if (vLength > 0.0) {\n"+
                          "     dir = normalize(nextScreen - currentScreen);\n"+
                          "   }\n"+
                          "   vec2 normal = vec2(-dir.y, dir.x);\n"+
                          "   dir.x /= uAspect;\n"+
                          "   normal.x /= uAspect;\n"+
                          "   vec4 offset = vec4(len*(normal*aPoint.x*aPoint.y - dir), 0.0, 0.0);\n"+
                          "   gl_Position = currentProjected + offset;\n";

      if (is_brush)
        result = result + "   gl_Position = vec4(aPos, 1.);\n";
        
      result = result + "  }\n";

      // console.log(result);
      return result;
    };

    /**
     * Generate the fragment shader for an object
     * @returns {string}
     * @param { number } id - Id of object
     */
    rglwidgetClass.prototype.getFragmentShader = function(id) {
      var obj = this.getObj(id),
          userShader = obj.userFragmentShader,
          flags = obj.flags,
          type = obj.type,
          is_lit = flags & this.f_is_lit,
          has_texture = flags & this.f_has_texture,
          fixed_quads = flags & this.f_fixed_quads,
          sprites_3d = flags & this.f_sprites_3d,
          is_twosided = (flags & this.f_is_twosided) > 0,
          fat_lines = flags & this.f_fat_lines,
          is_transparent = flags & this.f_is_transparent,
          nclipplanes = this.countClipplanes(), i,
          texture_format, nlights,
          result;

      if (type === "clipplanes" || sprites_3d) return;

      if (typeof userShader !== "undefined") return userShader;

      if (has_texture)
        texture_format = this.getMaterial(id, "textype");

      result = "/* ****** "+type+" object "+id+" fragment shader ****** */\n"+
               "#ifdef GL_ES\n"+
               "#ifdef GL_FRAGMENT_PRECISION_HIGH\n"+
               "  precision highp float;\n"+
               "#else\n"+
               "  precision mediump float;\n"+
               "#endif\n"+
               "#endif\n"+
               "  varying vec4 vCol; // carries alpha\n"+
               "  varying vec4 vPosition;\n";

      if (has_texture || type === "text")
        result = result + "  varying vec2 vTexcoord;\n"+
                          " uniform sampler2D uSampler;\n";

      if (is_lit && !fixed_quads)
        result = result + "  varying vec3 vNormal;\n";

      for (i = 0; i < nclipplanes; i++)
        result = result + "  uniform vec4 vClipplane"+i+";\n";

      if (is_lit) {
        nlights = this.countLights();
        if (nlights)
            result = result + "  uniform mat4 mvMatrix;\n";
        else
            is_lit = false;
      }

      if (is_lit) {
        result = result + "   uniform vec3 emission;\n"+
                          "   uniform float shininess;\n";

        for (i=0; i < nlights; i++) {
          result = result + "   uniform vec3 ambient" + i + ";\n"+
                            "   uniform vec3 specular" + i +"; // light*material\n"+
                            "   uniform vec3 diffuse" + i + ";\n"+
                            "   uniform vec3 lightDir" + i + ";\n"+
                            "   uniform bool viewpoint" + i + ";\n"+
                            "   uniform bool finite" + i + ";\n";
        }
      }

      if (is_twosided)
        result = result + "   uniform bool front;\n"+
                          "   varying float normz;\n";
                          
      if (fat_lines)
        result = result + "   varying vec2 vPoint;\n"+
                          "   varying float vLength;\n";

      result = result + "  void main(void) {\n";
      
      if (fat_lines) {
        result = result + "    vec2 point = vPoint;\n"+
                          "    bool neg = point.y < 0.0;\n"+
                          "    point.y = neg ? "+
                          "      (point.y + vLength)/(1.0 - vLength) :\n"+
                          "     -(point.y - vLength)/(1.0 - vLength);\n";
        if (is_transparent && type == "linestrip")
          result = result+"    if (neg && length(point) <= 1.0) discard;\n";
        result = result + "    point.y = min(point.y, 0.0);\n"+
                          "    if (length(point) > 1.0) discard;\n";
      }

      for (i=0; i < nclipplanes;i++)
        result = result + "    if (dot(vPosition, vClipplane"+i+") < 0.0) discard;\n";

      if (fixed_quads) {
        result = result +   "    vec3 n = vec3(0., 0., 1.);\n";
      } else if (is_lit) {
      	result = result +   "    vec3 n = normalize(vNormal);\n";
      }

      if (is_twosided) {
      	result = result +   "    if ((normz <= 0.) != front) discard;\n";
      }

      if (is_lit) {
        result = result + "    vec3 eye = normalize(-vPosition.xyz);\n"+
                          "   vec3 lightdir;\n"+
                          "   vec4 colDiff;\n"+
                          "   vec3 halfVec;\n"+
                          "   vec4 lighteffect = vec4(emission, 0.);\n"+
                          "   vec3 col;\n"+
                          "   float nDotL;\n";
        if (!fixed_quads) {
          result = result +   "   n = -faceforward(n, n, eye);\n";
        }
        for (i=0; i < nlights; i++) {
          result = result + "   colDiff = vec4(vCol.rgb * diffuse" + i + ", vCol.a);\n"+
                            "   lightdir = lightDir" + i + ";\n"+
                            "   if (!viewpoint" + i +")\n"+
                            "     lightdir = (mvMatrix * vec4(lightdir, 1.)).xyz;\n"+
                            "   if (!finite" + i + ") {\n"+
                            "     halfVec = normalize(lightdir + eye);\n"+
                            "   } else {\n"+
                            "     lightdir = normalize(lightdir - vPosition.xyz);\n"+
                            "     halfVec = normalize(lightdir + eye);\n"+
                            "   }\n"+
                            "    col = ambient" + i + ";\n"+
                            "   nDotL = dot(n, lightdir);\n"+
                            "   col = col + max(nDotL, 0.) * colDiff.rgb;\n"+
                            "   col = col + pow(max(dot(halfVec, n), 0.), shininess) * specular" + i + ";\n"+
                            "   lighteffect = lighteffect + vec4(col, colDiff.a);\n";
        }

      } else {
        result = result +   "   vec4 colDiff = vCol;\n"+
                            "    vec4 lighteffect = colDiff;\n";
      }

      if (type === "text")
        result = result +   "    vec4 textureColor = lighteffect*texture2D(uSampler, vTexcoord);\n";

      if (has_texture) {
        result = result + {
            rgb:            "   vec4 textureColor = lighteffect*vec4(texture2D(uSampler, vTexcoord).rgb, 1.);\n",
            rgba:           "   vec4 textureColor = lighteffect*texture2D(uSampler, vTexcoord);\n",
            alpha:          "   vec4 textureColor = texture2D(uSampler, vTexcoord);\n"+
                            "   float luminance = dot(vec3(1.,1.,1.), textureColor.rgb)/3.;\n"+
                            "   textureColor =  vec4(lighteffect.rgb, lighteffect.a*luminance);\n",
            luminance:      "   vec4 textureColor = vec4(lighteffect.rgb*dot(texture2D(uSampler, vTexcoord).rgb, vec3(1.,1.,1.))/3., lighteffect.a);\n",
          "luminance.alpha":"    vec4 textureColor = texture2D(uSampler, vTexcoord);\n"+
                            "   float luminance = dot(vec3(1.,1.,1.),textureColor.rgb)/3.;\n"+
                            "   textureColor = vec4(lighteffect.rgb*luminance, lighteffect.a*textureColor.a);\n"
          }[texture_format]+
                            "   gl_FragColor = textureColor;\n";
      } else if (type === "text") {
        result = result +   "    if (textureColor.a < 0.1)\n"+
                            "     discard;\n"+
                            "   else\n"+
                            "     gl_FragColor = textureColor;\n";
      } else
        result = result +   "   gl_FragColor = lighteffect;\n";

      //if (fat_lines)
      //  result = result +   "   gl_FragColor = vec4(0.0, abs(point.x), abs(point.y), 1.0);"
      result = result + "  }\n";

      // console.log(result);
      return result;
    };

    /**
     * Call gl functions to create and compile shader
     * @returns {Object}
     * @param { number } shaderType - gl code for shader type
     * @param { string } code - code for the shader
     */
    rglwidgetClass.prototype.getShader = function(shaderType, code) {
        var gl = this.gl, shader;
        shader = gl.createShader(shaderType);
        gl.shaderSource(shader, code);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost())
            alert(gl.getShaderInfoLog(shader));
        return shader;
    };

    /**
     * Handle a texture after its image has been loaded
     * @param { Object } texture - the gl texture object
     * @param { Object } textureCanvas - the canvas holding the image
     */
    rglwidgetClass.prototype.handleLoadedTexture = function(texture, textureCanvas) {
      var gl = this.gl || this.initGL();
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.generateMipmap(gl.TEXTURE_2D);

      gl.bindTexture(gl.TEXTURE_2D, null);
    };

    /**
     * Get maximum dimension of texture in current browser.
     * @returns {number}
     */
    rglwidgetClass.prototype.getMaxTexSize = function() {
      var gl = this.gl || this.initGL();	
      return Math.min(4096, gl.getParameter(gl.MAX_TEXTURE_SIZE));
    };
    
    /**
     * Load an image to a texture
     * @param { string } uri - The image location
     * @param { Object } texture - the gl texture object
     */
    rglwidgetClass.prototype.loadImageToTexture = function(uri, texture) {
      var canvas = this.textureCanvas,
          ctx = canvas.getContext("2d"),
          image = new Image(),
          self = this;

       image.onload = function() {
         var w = image.width,
             h = image.height,
             canvasX = self.getPowerOfTwo(w),
             canvasY = self.getPowerOfTwo(h),
             gl = self.gl || self.initGL(),
             maxTexSize = self.getMaxTexSize();
         while (canvasX > 1 && canvasY > 1 && (canvasX > maxTexSize || canvasY > maxTexSize)) {
           canvasX /= 2;
           canvasY /= 2;
         }
         canvas.width = canvasX;
         canvas.height = canvasY;
         ctx.imageSmoothingEnabled = true;
         ctx.drawImage(image, 0, 0, canvasX, canvasY);
         self.handleLoadedTexture(texture, canvas);
         self.drawScene();
       };
       image.src = uri;
     };

    /**
     * Draw text to the texture canvas
     * @returns { Object } object with text measurements
     * @param { string } text - the text
     * @param { number } cex - expansion
     * @param { string } family - font family
     * @param { number } font - font number
     */
    rglwidgetClass.prototype.drawTextToCanvas = function(text, cex, family, font) {
       var canvasX, canvasY,
           textY,
           scaling = 20,
           textColour = "white",

           backgroundColour = "rgba(0,0,0,0)",
           canvas = this.textureCanvas,
           ctx = canvas.getContext("2d"),
           i, textHeight = 0, textHeights = [], width, widths = [], 
           offsetx, offsety = 0, line, lines = [], offsetsx = [],
           offsetsy = [], lineoffsetsy = [], fontStrings = [],
           maxTexSize = this.getMaxTexSize(),
           getFontString = function(i) {
             textHeights[i] = scaling*cex[i];
             var fontString = textHeights[i] + "px",
                 family0 = family[i],
                 font0 = font[i];
             if (family0 === "sans")
               family0 = "sans-serif";
             else if (family0 === "mono")
               family0 = "monospace";
             fontString = fontString + " " + family0;
             if (font0 === 2 || font0 === 4)
               fontString = "bold " + fontString;
             if (font0 === 3 || font0 === 4)
               fontString = "italic " + fontString;
             return fontString;
           };
       cex = this.repeatToLen(cex, text.length);
       family = this.repeatToLen(family, text.length);
       font = this.repeatToLen(font, text.length);

       canvasX = 1;
       line = -1;
       offsetx = maxTexSize;
       for (i = 0; i < text.length; i++)  {
         ctx.font = fontStrings[i] = getFontString(i);
         width = widths[i] = ctx.measureText(text[i]).width;
         if (offsetx + width > maxTexSize) {
           line += 1;
           offsety = lineoffsetsy[line] = offsety + 2*textHeight;
           if (offsety > maxTexSize)
             console.error("Too many strings for texture.");
           textHeight = 0;
           offsetx = 0;
         }
         textHeight = Math.max(textHeight, textHeights[i]);
         offsetsx[i] = offsetx;
         offsetx += width;
         canvasX = Math.max(canvasX, offsetx);
         lines[i] = line;
       }
       offsety = lineoffsetsy[line] = offsety + 2*textHeight;
       for (i = 0; i < text.length; i++) {
       	 offsetsy[i] = lineoffsetsy[lines[i]];
       }
       
       canvasX = this.getPowerOfTwo(canvasX);
       canvasY = this.getPowerOfTwo(offsety);

       canvas.width = canvasX;
       canvas.height = canvasY;

       ctx.fillStyle = backgroundColour;
       ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

       ctx.textBaseline = "alphabetic";
       for(i = 0; i < text.length; i++) {
         ctx.font = fontStrings[i];
         ctx.fillStyle = textColour;
         ctx.textAlign = "left";
         ctx.fillText(text[i], offsetsx[i],  offsetsy[i]);
       }
       return {canvasX:canvasX, canvasY:canvasY,
               widths:widths, textHeights:textHeights,
               offsetsx:offsetsx, offsetsy:offsetsy};
     };

    /**
     * Set the gl viewport and scissor test
     * @param { number } id - id of subscene
     */
    rglwidgetClass.prototype.setViewport = function(id) {
       var gl = this.gl || this.initGL(),
         vp = this.getObj(id).par3d.viewport,
         x = vp.x*this.canvas.width,
         y = vp.y*this.canvas.height,
         width = vp.width*this.canvas.width,
         height = vp.height*this.canvas.height;
       this.vp = {x:x, y:y, width:width, height:height};
       gl.viewport(x, y, width, height);
       gl.scissor(x, y, width, height);
       gl.enable(gl.SCISSOR_TEST);
     };

    /**
     * Set the projection matrix for a subscene
     * @param { number } id - id of subscene
     */
    rglwidgetClass.prototype.setprMatrix = function(id) {
       var subscene = this.getObj(id),
          embedding = subscene.embeddings.projection;
       if (embedding === "replace")
         this.prMatrix.makeIdentity();
       else
         this.setprMatrix(subscene.parent);
       if (embedding === "inherit")
         return;
       // This is based on the Frustum::enclose code from geom.cpp
       var bbox = subscene.par3d.bbox,
           scale = subscene.par3d.scale,
           ranges = [(bbox[1]-bbox[0])*scale[0]/2,
                     (bbox[3]-bbox[2])*scale[1]/2,
                     (bbox[5]-bbox[4])*scale[2]/2],
           radius = Math.sqrt(this.sumsq(ranges))*1.1; // A bit bigger to handle labels
       if (radius <= 0) radius = 1;
       var observer = subscene.par3d.observer,
           distance = observer[2],
           FOV = subscene.par3d.FOV, ortho = FOV === 0,
           t = ortho ? 1 : Math.tan(FOV*Math.PI/360),
           near = distance - radius,
           far = distance + radius,
           hlen,
           aspect = this.vp.width/this.vp.height,
           z = subscene.par3d.zoom,
           userProjection = subscene.par3d.userProjection;
       if (far < 0.0)
         far = 1.0;
       if (near < far/100.0)
         near = far/100.0;
       hlen = t*near;
       if (ortho) {
         if (aspect > 1)
           this.prMatrix.ortho(-hlen*aspect*z, hlen*aspect*z,
                          -hlen*z, hlen*z, near, far);
         else
           this.prMatrix.ortho(-hlen*z, hlen*z,
                          -hlen*z/aspect, hlen*z/aspect,
                          near, far);
       } else {
         if (aspect > 1)
           this.prMatrix.frustum(-hlen*aspect*z, hlen*aspect*z,
                          -hlen*z, hlen*z, near, far);
         else
           this.prMatrix.frustum(-hlen*z, hlen*z,
                          -hlen*z/aspect, hlen*z/aspect,
                          near, far);
       }
       this.prMatrix.multRight(userProjection);
     };

    /**
     * Set the model-view matrix for a subscene
     * @param { number } id - id of the subscene
     */
    rglwidgetClass.prototype.setmvMatrix = function(id) {
       var observer = this.getObj(id).par3d.observer;
       this.mvMatrix.makeIdentity();
       this.setmodelMatrix(id);
       this.mvMatrix.translate(-observer[0], -observer[1], -observer[2]);

     };

    /**
     * Set the model matrix for a subscene
     * @param { number } id - id of the subscene
     */
    rglwidgetClass.prototype.setmodelMatrix = function(id) {
      var subscene = this.getObj(id),
          embedding = subscene.embeddings.model;
      if (embedding !== "inherit") {
        var scale = subscene.par3d.scale,
            bbox = subscene.par3d.bbox,
            center = [(bbox[0]+bbox[1])/2,
                      (bbox[2]+bbox[3])/2,
                      (bbox[4]+bbox[5])/2];
         this.mvMatrix.translate(-center[0], -center[1], -center[2]);
         this.mvMatrix.scale(scale[0], scale[1], scale[2]);
         this.mvMatrix.multRight( subscene.par3d.userMatrix );
       }
       if (embedding !== "replace")
         this.setmodelMatrix(subscene.parent);
     };

    /**
     * Set the normals matrix for a subscene
     * @param { number } subsceneid - id of the subscene
     */
    rglwidgetClass.prototype.setnormMatrix = function(subsceneid) {
       var self = this,
       recurse = function(id) {
         var sub = self.getObj(id),
             embedding = sub.embeddings.model;
         if (embedding !== "inherit") {
           var scale = sub.par3d.scale;
           self.normMatrix.scale(1/scale[0], 1/scale[1], 1/scale[2]);
           self.normMatrix.multRight(sub.par3d.userMatrix);
         }
         if (embedding !== "replace")
           recurse(sub.parent);
       };
       self.normMatrix.makeIdentity();
       recurse(subsceneid);
     };

    /**
     * Set the combined projection-model-view matrix
     */
    rglwidgetClass.prototype.setprmvMatrix = function() {
       this.prmvMatrix = new CanvasMatrix4( this.mvMatrix );
       this.prmvMatrix.multRight( this.prMatrix );
     };

    /**
     * Count clipping planes in a scene
     * @returns {number}
     */
    rglwidgetClass.prototype.countClipplanes = function() {
      return this.countObjs("clipplanes");
    };

    /**
     * Count lights in a scene
     * @returns { number }
     */
    rglwidgetClass.prototype.countLights = function() {
      return this.countObjs("light");
    };

    /**
     * Count objects of specific type in a scene
     * @returns { number }
     * @param { string } type - Type of object to count
     */
    rglwidgetClass.prototype.countObjs = function(type) {
      var self = this,
          bound = 0;

      Object.keys(this.scene.objects).forEach(
        function(key) {
          if (self.getObj(parseInt(key, 10)).type === type)
            bound = bound + 1;
        });
      return bound;
    };

    /**
     * Initialize a subscene
     * @param { number } id - id of subscene.
     */
    rglwidgetClass.prototype.initSubscene = function(id) {
      var sub = this.getObj(id),
          i, obj;

      if (sub.type !== "subscene")
        return;

      sub.par3d.userMatrix = this.toCanvasMatrix4(sub.par3d.userMatrix);
      sub.par3d.userProjection = this.toCanvasMatrix4(sub.par3d.userProjection);
      sub.par3d.userProjection.transpose();
      sub.par3d.listeners = [].concat(sub.par3d.listeners);
      sub.backgroundId = undefined;
      sub.subscenes = [];
      sub.clipplanes = [];
      sub.transparent = [];
      sub.opaque = [];
      sub.lights = [];
      for (i=0; i < sub.objects.length; i++) {
        obj = this.getObj(sub.objects[i]);
        if (typeof obj === "undefined") {
          sub.objects.splice(i, 1);
          i--;
        } else if (obj.type === "background")
          sub.backgroundId = obj.id;
        else
          sub[this.whichList(obj.id)].push(obj.id);
      }
    };

    /**
     * Copy object
     * @param { number } id - id of object to copy
     * @param { string } reuse - Document id of scene to reuse
     */
    rglwidgetClass.prototype.copyObj = function(id, reuse) {
      var obj = this.getObj(id),
          prev = document.getElementById(reuse);
      if (prev !== null) {
        prev = prev.rglinstance;
        var
          prevobj = prev.getObj(id),
          fields = ["flags", "type",
                    "colors", "vertices", "centers",
                    "normals", "offsets",
                    "texts", "cex", "family", "font", "adj",
                    "material",
                    "radii",
                    "texcoords",
                    "userMatrix", "ids",
                    "dim",
                    "par3d", "userMatrix",
                    "viewpoint", "finite",
                    "pos"],
          i;
        for (i = 0; i < fields.length; i++) {
          if (typeof prevobj[fields[i]] !== "undefined")
            obj[fields[i]] = prevobj[fields[i]];
        }
      } else
        console.warn("copyObj failed");
    };

    /**
     * Update the triangles used to display a plane
     * @param { number } id - id of the plane
     * @param { Object } bbox - bounding box in which to display the plane
     */
    rglwidgetClass.prototype.planeUpdateTriangles = function(id, bbox) {
      var perms = [[0,0,1], [1,2,2], [2,1,0]],
          x, xrow, elem, A, d, nhits, i, j, k, u, v, w, intersect, which, v0, v2, vx, reverse,
          face1 = [], face2 = [], normals = [],
          obj = this.getObj(id),
          nPlanes = obj.normals.length;
      obj.bbox = bbox;
      obj.vertices = [];
      obj.initialized = false;
      for (elem = 0; elem < nPlanes; elem++) {
//    Vertex Av = normal.getRecycled(elem);
        x = [];
        A = obj.normals[elem];
        d = obj.offsets[elem][0];
        nhits = 0;
        for (i=0; i<3; i++)
          for (j=0; j<2; j++)
            for (k=0; k<2; k++) {
              u = perms[0][i];
              v = perms[1][i];
              w = perms[2][i];
              if (A[w] !== 0.0) {
                intersect = -(d + A[u]*bbox[j+2*u] + A[v]*bbox[k+2*v])/A[w];
                if (bbox[2*w] < intersect && intersect < bbox[1+2*w]) {
                  xrow = [];
                  xrow[u] = bbox[j+2*u];
                  xrow[v] = bbox[k+2*v];
                  xrow[w] = intersect;
                  x.push(xrow);
                  face1[nhits] = j + 2*u;
                  face2[nhits] = k + 2*v;
                  nhits++;
                }
              }
            }

            if (nhits > 3) {
            /* Re-order the intersections so the triangles work */
              for (i=0; i<nhits-2; i++) {
                which = 0; /* initialize to suppress warning */
                for (j=i+1; j<nhits; j++) {
                  if (face1[i] == face1[j] || face1[i] == face2[j] ||
                      face2[i] == face1[j] || face2[i] == face2[j] ) {
                    which = j;
                    break;
                  }
                }
                if (which > i+1) {
                  this.swap(x, i+1, which);
                  this.swap(face1, i+1, which);
                  this.swap(face2, i+1, which);
                }
              }
            }
            if (nhits >= 3) {
      /* Put in order so that the normal points out the FRONT of the faces */
              v0 = [x[0][0] - x[1][0] , x[0][1] - x[1][1], x[0][2] - x[1][2]];
              v2 = [x[2][0] - x[1][0] , x[2][1] - x[1][1], x[2][2] - x[1][2]];
              /* cross-product */
              vx = this.xprod(v0, v2);
              reverse = this.dotprod(vx, A) > 0;

              for (i=0; i<nhits-2; i++) {
                obj.vertices.push(x[0]);
                normals.push(A);
                for (j=1; j<3; j++) {
                  obj.vertices.push(x[i + (reverse ? 3-j : j)]);
                  normals.push(A);
                }
              }
            }
      }
      obj.pnormals = normals;
    };
    
    rglwidgetClass.prototype.getAdj = function (pos, offset, text) {
      switch(pos) {
        case 1: return [0.5, 1 + offset];
        case 2: return [1 + offset/text.length, 0.5];
        case 3: return [0.5, -offset];
        case 4: return [-offset/text.length, 0.5];
      }
    }

    /**
     * Initialize object for display
     * @param { number } id - id of object to initialize
     */
    rglwidgetClass.prototype.initObj = function(id) {
      var obj = this.getObj(id),
          flags = obj.flags,
          type = obj.type,
          is_lit = flags & this.f_is_lit,
          is_lines = flags & this.f_is_lines,
          fat_lines = flags & this.f_fat_lines,
          has_texture = flags & this.f_has_texture,
          fixed_quads = flags & this.f_fixed_quads,
          is_transparent = obj.is_transparent,
          depth_sort = flags & this.f_depth_sort,
          sprites_3d = flags & this.f_sprites_3d,
          sprite_3d = flags & this.f_sprite_3d,
          fixed_size = flags & this.f_fixed_size,
          is_twosided = (flags & this.f_is_twosided) > 0,
          is_brush = flags & this.f_is_brush,
          gl = this.gl || this.initGL(),
          polygon_offset,
          texinfo, drawtype, nclipplanes, f, nrows, oldrows,
          i,j,v,v1,v2, mat, uri, matobj, pass, passes, pmode,
          dim, nx, nz, attr;

    if (typeof id !== "number") {
      this.alertOnce("initObj id is "+typeof id);
    }

    obj.initialized = true;

    if (type === "bboxdeco" || type === "subscene")
      return;

    if (type === "light") {
      obj.ambient = new Float32Array(obj.colors[0].slice(0,3));
      obj.diffuse = new Float32Array(obj.colors[1].slice(0,3));
      obj.specular = new Float32Array(obj.colors[2].slice(0,3));
      obj.lightDir = new Float32Array(obj.vertices[0]);
      return;
    }

    if (type === "clipplanes") {
      obj.vClipplane = this.flatten(this.cbind(obj.normals, obj.offsets));
      return;
    }

    if (type === "background" && typeof obj.ids !== "undefined") {
      obj.quad = this.flatten([].concat(obj.ids));
      return;
    }

    polygon_offset = this.getMaterial(id, "polygon_offset");
    if (polygon_offset[0] != 0 || polygon_offset[1] != 0)
      obj.polygon_offset = polygon_offset;

    if (is_transparent) {
      depth_sort = ["triangles", "quads", "surface",
                    "spheres", "sprites", "text"].indexOf(type) >= 0;
    }
    
    if (is_brush)
      this.initSelection(id);

    if (typeof obj.vertices === "undefined")
      obj.vertices = [];

    v = obj.vertices;
    obj.vertexCount = v.length;
    if (!obj.vertexCount) return;

    if (is_twosided) {
      if (typeof obj.userAttributes === "undefined")
        obj.userAttributes = {};
      v1 = Array(v.length);
      v2 = Array(v.length);
      if (obj.type == "triangles" || obj.type == "quads") {
      	if (obj.type == "triangles")
      	  nrow = 3;
      	else
      	  nrow = 4;
        for (i=0; i<Math.floor(v.length/nrow); i++)
          for (j=0; j<nrow; j++) {
            v1[nrow*i + j] = v[nrow*i + ((j+1) % nrow)];
            v2[nrow*i + j] = v[nrow*i + ((j+2) % nrow)];
          }
      } else if (obj.type == "surface") {
        dim = obj.dim[0];
        nx = dim[0];
        nz = dim[1];
        for (j=0; j<nx; j++) {
          for (i=0; i<nz; i++) {
            if (i+1 < nz && j+1 < nx) {
              v2[j + nx*i] = v[j + nx*(i+1)];
              v1[j + nx*i] = v[j+1 + nx*(i+1)];
            } else if (i+1 < nz) {
              v2[j + nx*i] = v[j-1 + nx*i];
              v1[j + nx*i] = v[j + nx*(i+1)];
            } else {
              v2[j + nx*i] = v[j + nx*(i-1)];
              v1[j + nx*i] = v[j-1 + nx*(i-1)];
            }
          }
        }
      }
      obj.userAttributes.aPos1 = v1;
      obj.userAttributes.aPos2 = v2;
    }

    if (!sprites_3d) {
      if (gl.isContextLost()) return;
      obj.prog = gl.createProgram();
      gl.attachShader(obj.prog, this.getShader( gl.VERTEX_SHADER,
        this.getVertexShader(id) ));
      gl.attachShader(obj.prog, this.getShader( gl.FRAGMENT_SHADER,
                      this.getFragmentShader(id) ));
      //  Force aPos to location 0, aCol to location 1
      gl.bindAttribLocation(obj.prog, 0, "aPos");
      gl.bindAttribLocation(obj.prog, 1, "aCol");
      gl.linkProgram(obj.prog);
      var linked = gl.getProgramParameter(obj.prog, gl.LINK_STATUS);
      if (!linked) {

        // An error occurred while linking
        var lastError = gl.getProgramInfoLog(obj.prog);
        console.warn("Error in program linking:" + lastError);

        gl.deleteProgram(obj.prog);
        return;
      }
    }

    if (type === "text") {
      texinfo = this.drawTextToCanvas(obj.texts,
                                      this.flatten(obj.cex),
                                      this.flatten(obj.family),
                                      this.flatten(obj.family));
    }

    if (fixed_quads && !sprites_3d) {
      obj.ofsLoc = gl.getAttribLocation(obj.prog, "aOfs");
    }

    if (sprite_3d) {
      obj.origLoc = gl.getUniformLocation(obj.prog, "uOrig");
      obj.sizeLoc = gl.getUniformLocation(obj.prog, "uSize");
      obj.usermatLoc = gl.getUniformLocation(obj.prog, "usermat");
    }

    if (has_texture || type == "text") {
      if (!obj.texture)
        obj.texture = gl.createTexture();
      obj.texLoc = gl.getAttribLocation(obj.prog, "aTexcoord");
      obj.sampler = gl.getUniformLocation(obj.prog, "uSampler");
    }

    if (has_texture) {
      mat = obj.material;
      if (typeof mat.uri !== "undefined")
        uri = mat.uri;
      else if (typeof mat.uriElementId === "undefined") {
        matobj = this.getObj(mat.uriId);
        if (typeof matobj !== "undefined") {
          uri = matobj.material.uri;
        } else {
          uri = "";
        }
      } else
        uri = document.getElementById(mat.uriElementId).rglinstance.getObj(mat.uriId).material.uri;

      this.loadImageToTexture(uri, obj.texture);
    }

    if (type === "text") {
      this.handleLoadedTexture(obj.texture, this.textureCanvas);
    }

    var stride = 3, nc, cofs, nofs, radofs, oofs, tofs, vnew, fnew,
        nextofs = -1, pointofs = -1, alias, colors, key, selection, filter, adj, pos, offset;

    obj.alias = undefined;
    
    colors = obj.colors;

    j = this.scene.crosstalk.id.indexOf(id);
    if (j >= 0) {
      key = this.scene.crosstalk.key[j];
      options = this.scene.crosstalk.options[j];
      colors = colors.slice(0); 
      for (i = 0; i < v.length; i++)
        colors[i] = obj.colors[i % obj.colors.length].slice(0);
      if ( (selection = this.scene.crosstalk.selection) &&
           (selection.length || !options.selectedIgnoreNone) )
        for (i = 0; i < v.length; i++) {
          if (!selection.includes(key[i])) {
            if (options.deselectedColor)
              colors[i] = options.deselectedColor.slice(0);
            colors[i][3] = colors[i][3]*options.deselectedFade;   /* default: mostly transparent if not selected */
          } else if (options.selectedColor)
            colors[i] = options.selectedColor.slice(0);
        }
      if ( (filter = this.scene.crosstalk.filter) )
        for (i = 0; i < v.length; i++) 
          if (!filter.includes(key[i])) {
            if (options.filteredColor)
              colors[i] = options.filteredColor.slice(0);
            colors[i][3] = colors[i][3]*options.filteredFade;   /* default: completely hidden if filtered */
          }
    }  
    
    nc = obj.colorCount = colors.length;
    if (nc > 1) {
      cofs = stride;
      stride = stride + 4;
      v = this.cbind(v, colors);
    } else {
      cofs = -1;
      obj.onecolor = this.flatten(colors);
    }

    if (typeof obj.normals !== "undefined") {
      nofs = stride;
      stride = stride + 3;
      v = this.cbind(v, typeof obj.pnormals !== "undefined" ? obj.pnormals : obj.normals);
    } else
      nofs = -1;

    if (typeof obj.radii !== "undefined") {
      radofs = stride;
      stride = stride + 1;
      // FIXME:  always concat the radii?
      if (obj.radii.length === v.length) {
        v = this.cbind(v, obj.radii);
      } else if (obj.radii.length === 1) {
        v = v.map(function(row, i, arr) { return row.concat(obj.radii[0]);});
      }
    } else
      radofs = -1;
      
    // Add default indices
    f = Array(v.length);
    for (i = 0; i < v.length; i++)
      f[i] = i;
    obj.f = [f,f];

    if (type == "sprites" && !sprites_3d) {
      tofs = stride;
      stride += 2;
      oofs = stride;
      stride += 2;
      vnew = new Array(4*v.length);
      fnew = new Array(4*v.length);
      alias = new Array(v.length);
      var rescale = fixed_size ? 72 : 1,
          size = obj.radii, s = rescale*size[0]/2;
      last = v.length;
      f = obj.f[0];
      for (i=0; i < v.length; i++) {
        if (size.length > 1)
          s = rescale*size[i]/2;
        vnew[i]  = v[i].concat([0,0,-s,-s]);
        fnew[4*i] = f[i];
        vnew[last]= v[i].concat([1,0, s,-s]);
        fnew[4*i+1] = last++;
        vnew[last]= v[i].concat([1,1, s, s]);
        fnew[4*i+2] = last++;
        vnew[last]= v[i].concat([0,1,-s, s]);
        fnew[4*i+3] = last++;
        alias[i] = [last-3, last-2, last-1];
      }
      v = vnew;
      obj.vertexCount = v.length;
      obj.f = [fnew, fnew];
    } else if (type === "text") {
      tofs = stride;
      stride += 2;
      oofs = stride;
      stride += 2;
      vnew = new Array(4*v.length);
      f = obj.f[0];
      fnew = new Array(4*f.length);
      alias = new Array(v.length);
      last = v.length;
      adj = this.flatten(obj.adj);
      if (typeof obj.pos !== "undefined") {
        pos = this.flatten(obj.pos);
        offset = adj[0];
      }
      for (i=0; i < v.length; i++) {
        if (typeof pos !== "undefined")
          adj = this.getAdj(pos[i % pos.length], offset, obj.texts[i]);
        vnew[i]  = v[i].concat([0,-0.5]).concat(adj);
        fnew[4*i] = f[i];
        vnew[last] = v[i].concat([1,-0.5]).concat(adj);
        fnew[4*i+1] = last++;
        vnew[last] = v[i].concat([1, 1.5]).concat(adj);
        fnew[4*i+2] = last++;
        vnew[last] = v[i].concat([0, 1.5]).concat(adj);
        fnew[4*i+3] = last++;
        alias[i] = [last-3, last-2, last-1];
        for (j=0; j < 4; j++) {
          v1 = vnew[fnew[4*i+j]];
          v1[tofs+2] = 2*(v1[tofs]-v1[tofs+2])*texinfo.widths[i];
          v1[tofs+3] = 2*(v1[tofs+1]-v1[tofs+3])*texinfo.textHeights[i];
          v1[tofs] = (texinfo.offsetsx[i] + v1[tofs]*texinfo.widths[i])/texinfo.canvasX;
          v1[tofs+1] = 1.0-(texinfo.offsetsy[i] -
              v1[tofs+1]*texinfo.textHeights[i])/texinfo.canvasY;
          vnew[fnew[4*i+j]] = v1;
        }
      }
      v = vnew;
      obj.vertexCount = v.length;
      obj.f = [fnew, fnew];
    } else if (typeof obj.texcoords !== "undefined") {
      tofs = stride;
      stride += 2;
      oofs = -1;
      v = this.cbind(v, obj.texcoords);
    } else {
      tofs = -1;
      oofs = -1;
    }
    
    obj.alias = alias;
                          
    if (typeof obj.userAttributes !== "undefined") {
      obj.userAttribOffsets = {};
      obj.userAttribLocations = {};
      obj.userAttribSizes = {};
      for (attr in obj.userAttributes) {
      	obj.userAttribLocations[attr] = gl.getAttribLocation(obj.prog, attr);
      	if (obj.userAttribLocations[attr] >= 0) { // Attribute may not have been used
      	  obj.userAttribOffsets[attr] = stride;
      	  v = this.cbind(v, obj.userAttributes[attr]);
      	  stride = v[0].length;
      	  obj.userAttribSizes[attr] = stride - obj.userAttribOffsets[attr];
      	}
      }
    }

    if (typeof obj.userUniforms !== "undefined") {
      obj.userUniformLocations = {};
      for (attr in obj.userUniforms)
        obj.userUniformLocations[attr] = gl.getUniformLocation(obj.prog, attr);
    }

    if (sprites_3d) {
      obj.userMatrix = new CanvasMatrix4(obj.userMatrix);
      obj.objects = this.flatten([].concat(obj.ids));
      is_lit = false;
      for (i=0; i < obj.objects.length; i++)
        this.initObj(obj.objects[i]);
    }

    if (is_lit && !fixed_quads) {
       obj.normLoc = gl.getAttribLocation(obj.prog, "aNorm");
    }

    nclipplanes = this.countClipplanes();
    if (nclipplanes && !sprites_3d) {
      obj.clipLoc = [];
      for (i=0; i < nclipplanes; i++)
        obj.clipLoc[i] = gl.getUniformLocation(obj.prog,"vClipplane" + i);
    }

    if (is_lit) {
      obj.emissionLoc = gl.getUniformLocation(obj.prog, "emission");
      obj.emission = new Float32Array(this.stringToRgb(this.getMaterial(id, "emission")));
      obj.shininessLoc = gl.getUniformLocation(obj.prog, "shininess");
      obj.shininess = this.getMaterial(id, "shininess");
      obj.nlights = this.countLights();
      obj.ambientLoc = [];
      obj.ambient = new Float32Array(this.stringToRgb(this.getMaterial(id, "ambient")));
      obj.specularLoc = [];
      obj.specular = new Float32Array(this.stringToRgb(this.getMaterial(id, "specular")));
      obj.diffuseLoc = [];
      obj.lightDirLoc = [];
      obj.viewpointLoc = [];
      obj.finiteLoc = [];
      for (i=0; i < obj.nlights; i++) {
        obj.ambientLoc[i] = gl.getUniformLocation(obj.prog, "ambient" + i);
        obj.specularLoc[i] = gl.getUniformLocation(obj.prog, "specular" + i);
        obj.diffuseLoc[i] = gl.getUniformLocation(obj.prog, "diffuse" + i);
        obj.lightDirLoc[i] = gl.getUniformLocation(obj.prog, "lightDir" + i);
        obj.viewpointLoc[i] = gl.getUniformLocation(obj.prog, "viewpoint" + i);
        obj.finiteLoc[i] = gl.getUniformLocation(obj.prog, "finite" + i);
      }
    }
    
    obj.passes = is_twosided + 1;
    obj.pmode = new Array(obj.passes);
    for (pass = 0; pass < obj.passes; pass++) {
      if (type === "triangles" || type === "quads" || type === "surface")
      	pmode = this.getMaterial(id, (pass === 0) ? "front" : "back");
      else pmode = "filled";
      obj.pmode[pass] = pmode;
    }
    
 
      obj.f.length = obj.passes;
      for (pass = 0; pass < obj.passes; pass++) {
      	f = fnew = obj.f[pass];
        pmode = obj.pmode[pass];
      	if (pmode === "culled")
      	  f = [];
        else if (pmode === "points") {
          // stay with default
        } else if ((type === "quads" || type === "text" ||
             type === "sprites") && !sprites_3d) {
          nrows = Math.floor(obj.vertexCount/4);
          if (pmode === "filled") {
            fnew = Array(6*nrows);
            for (i=0; i < nrows; i++) {
              fnew[6*i] = f[4*i];
              fnew[6*i+1] = f[4*i + 1];
              fnew[6*i+2] = f[4*i + 2];
              fnew[6*i+3] = f[4*i];
              fnew[6*i+4] = f[4*i + 2];
              fnew[6*i+5] = f[4*i + 3];
            }
          } else {
            fnew = Array(8*nrows);
            for (i=0; i < nrows; i++) {
              fnew[8*i] = f[4*i];
              fnew[8*i+1] = f[4*i + 1];
              fnew[8*i+2] = f[4*i + 1];
              fnew[8*i+3] = f[4*i + 2];
              fnew[8*i+4] = f[4*i + 2];
              fnew[8*i+5] = f[4*i + 3];
              fnew[8*i+6] = f[4*i + 3];
              fnew[8*i+7] = f[4*i];
            }
          }
        } else if (type === "triangles") {
          nrows = Math.floor(obj.vertexCount/3);
          if (pmode === "filled") {
            fnew = Array(3*nrows);
            for (i=0; i < fnew.length; i++) {
              fnew[i] = f[i];
            }
          } else if (pmode === "lines") {
            fnew = Array(6*nrows);
      	    for (i=0; i < nrows; i++) {
      	      fnew[6*i] = f[3*i];
      	      fnew[6*i + 1] = f[3*i + 1];
      	      fnew[6*i + 2] = f[3*i + 1];
      	      fnew[6*i + 3] = f[3*i + 2];
      	      fnew[6*i + 4] = f[3*i + 2];
      	      fnew[6*i + 5] = f[3*i];
      	    }
          }
        } else if (type === "spheres") {
          // default
        } else if (type === "surface") {
          dim = obj.dim[0];
          nx = dim[0];
          nz = dim[1];
          if (pmode === "filled") {
            fnew = [];
            for (j=0; j<nx-1; j++) {
              for (i=0; i<nz-1; i++) {
                fnew.push(f[j + nx*i],
                       f[j + nx*(i+1)],
                       f[j + 1 + nx*(i+1)],
                       f[j + nx*i],
                       f[j + 1 + nx*(i+1)],
                       f[j + 1 + nx*i]);
              }
            }
          } else if (pmode === "lines") {
            fnew = [];
            for (j=0; j<nx; j++) {
              for (i=0; i<nz; i++) {
                if (i+1 < nz)
                  fnew.push(f[j + nx*i],
                         f[j + nx*(i+1)]);
                if (j+1 < nx)
                  fnew.push(f[j + nx*i],
                         f[j+1 + nx*i]);
              }
            }
          }
        }
        obj.f[pass] = fnew;
        if (depth_sort) {
          drawtype = "DYNAMIC_DRAW";
        } else {
          drawtype = "STATIC_DRAW";
        }
      }
    
    
    if (fat_lines) {
      alias = undefined;
      obj.nextLoc = gl.getAttribLocation(obj.prog, "aNext");
      obj.pointLoc = gl.getAttribLocation(obj.prog, "aPoint");
      obj.aspectLoc = gl.getUniformLocation(obj.prog, "uAspect");
      obj.lwdLoc = gl.getUniformLocation(obj.prog, "uLwd");
      // Expand vertices to turn each segment into a pair of triangles
        
      	for (pass = 0; pass < obj.passes; pass++) {
      	  f = obj.f[pass];	
          oldrows = f.length;
      	  if (obj.pmode[pass] === "lines") 
      	    break;
      	}
      
      if (type === "linestrip") 
        nrows = 4*(oldrows - 1); 
      else
        nrows = 2*oldrows;
      vnew = new Array(nrows);
      fnew = new Array(1.5*nrows);
      var fnext = new Array(nrows),
          fpt = new Array(nrows), 
          pt, start, gap = type === "linestrip" ? 3 : 1;
      
      // We're going to turn each pair of vertices into 4 new ones, with the "next" and "pt" attributes
      // added.
      // We do this by copying the originals in the first pass, adding the new attributes, then in a 
      // second pass add new vertices at the end.

      for (i = 0; i < v.length; i++) {
        vnew[i] = v[i].concat([0,0,0,0,0]); 
      }

      nextofs = stride;
      pointofs = stride + 3;
      stride = stride + 5;
            
      // Now add the extras
      last = v.length - 1;
      ind = 0;
      alias = new Array(f.length);
      for (i = 0; i < f.length; i++)
        alias[i] = [];
      for (i = 0; i < f.length - 1; i++) {
      	if (type !== "linestrip" && i % 2 == 1)
      	  continue;
      	k = ++last;
      	vnew[k] = vnew[f[i]].slice();
      	for (j=0; j<3; j++)
      	  vnew[k][nextofs + j] = vnew[f[i+1]][j];
      	vnew[k][pointofs] = -1;
      	vnew[k][pointofs+1] = -1;
      	fnew[ind] = k;
      	last++;
      	vnew[last] = vnew[k].slice();
      	vnew[last][pointofs] = 1;
      	fnew[ind+1] = last;
      	alias[f[i]].push(last-1, last);
      	last++;
      	k = last;
      	vnew[k] = vnew[f[i+1]].slice();
      	for (j=0; j<3; j++)
      	  vnew[k][nextofs + j] = vnew[f[i]][j];
      	vnew[k][pointofs] = -1;
      	vnew[k][pointofs+1] = 1;
      	fnew[ind+2] = k;
      	fnew[ind+3] = fnew[ind+1];
      	last++;
      	vnew[last] = vnew[k].slice();
      	vnew[last][pointofs] = 1;
      	fnew[ind+4] = last;
      	fnew[ind+5] = fnew[ind+2];
      	ind += 6;
      	alias[f[i+1]].push(last-1, last);
      }
      vnew.length = last+1;
      v = vnew;
      obj.vertexCount = v.length;
      if (typeof alias !== "undefined" && typeof obj.alias !== "undefined") {  // Already have aliases from previous section?
        var oldalias = obj.alias, newalias = Array(obj.alias.length);
        for (i = 0; i < newalias.length; i++) {
          newalias[i] = oldalias[i].slice();
          for (j = 0; j < oldalias[i].length; j++)
            Array.prototype.push.apply(newalias[i], alias[oldalias[j]]); // pushes each element 
        }
        obj.alias = newalias;
      } else
        obj.alias = alias;
      
      for (pass = 0; pass < obj.passes; pass++)
      	if (type === "lines" || type === "linestrip" || obj.pmode[pass] == "lines") {
          obj.f[pass] = fnew;
        }
      
      if (depth_sort) 
        drawtype = "DYNAMIC_DRAW";
      else
        drawtype = "STATIC_DRAW";
    }
    
      for (pass = 0; pass < obj.passes; pass++) {
        if (obj.vertexCount > 65535) {
          if (this.index_uint) {
            obj.f[pass] = new Uint32Array(obj.f[pass]);
            obj.index_uint = true;
          } else
            this.alertOnce("Object has "+obj.vertexCount+" vertices, not supported in this browser.");
        } else {
          obj.f[pass] = new Uint16Array(obj.f[pass]);
          obj.index_uint = false;
        }
      }
    
    if (stride !== v[0].length) {
      this.alertOnce("problem in stride calculation");
    }

    obj.vOffsets = {vofs:0, cofs:cofs, nofs:nofs, radofs:radofs, oofs:oofs, tofs:tofs,
                    nextofs:nextofs, pointofs:pointofs, stride:stride};

    obj.values = new Float32Array(this.flatten(v));

    if (type !== "spheres" && !sprites_3d) {
      obj.buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, obj.buf);
      gl.bufferData(gl.ARRAY_BUFFER, obj.values, gl.STATIC_DRAW); //
      obj.ibuf = Array(obj.passes);
      obj.ibuf[0] = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ibuf[0]);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, obj.f[0], gl[drawtype]);
      if (is_twosided) {
      	obj.ibuf[1] = gl.createBuffer();
      	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ibuf[1]);
      	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, obj.f[1], gl[drawtype]);
      }
    }

    if (!sprites_3d) {
      obj.mvMatLoc = gl.getUniformLocation(obj.prog, "mvMatrix");
      obj.prMatLoc = gl.getUniformLocation(obj.prog, "prMatrix");
    }

    if (fixed_size) {
      obj.textScaleLoc = gl.getUniformLocation(obj.prog, "textScale");
    }

    if (is_lit && !sprites_3d) {
      obj.normMatLoc = gl.getUniformLocation(obj.prog, "normMatrix");
    }

    if (is_twosided) {
      obj.frontLoc = gl.getUniformLocation(obj.prog, "front");
    }
  };

    /**
     * Set gl depth test based on object's material
     * @param { number } id - object to use
     */
    rglwidgetClass.prototype.setDepthTest = function(id) {
      var gl = this.gl || this.initGL(),
          tests = {never: gl.NEVER,
                   less:  gl.LESS,
                   equal: gl.EQUAL,
                   lequal:gl.LEQUAL,
                   greater: gl.GREATER,
                   notequal: gl.NOTEQUAL,
                   gequal: gl.GEQUAL,
                   always: gl.ALWAYS},
           test = tests[this.getMaterial(id, "depth_test")];
      gl.depthFunc(test);
    };

    rglwidgetClass.prototype.mode4type = {points : "POINTS",
                     linestrip : "LINE_STRIP",
                     abclines : "LINES",
                     lines : "LINES",
                     sprites : "TRIANGLES",
                     planes : "TRIANGLES",
                     text : "TRIANGLES",
                     quads : "TRIANGLES",
                     surface : "TRIANGLES",
                     triangles : "TRIANGLES"};

    /**
     * Sort objects from back to front
     * @returns { number[] }
     * @param { Object } obj - object to sort
     */
    rglwidgetClass.prototype.depthSort = function(obj) {
      var n = obj.centers.length,
          depths = new Float32Array(n),
          result = new Array(n),
          compare = function(i,j) { return depths[j] - depths[i]; },
          z, w;
      for(i=0; i<n; i++) {
        z = this.prmvMatrix.m13*obj.centers[i][0] +
            this.prmvMatrix.m23*obj.centers[i][1] +
            this.prmvMatrix.m33*obj.centers[i][2] +
            this.prmvMatrix.m43;
        w = this.prmvMatrix.m14*obj.centers[i][0] +
            this.prmvMatrix.m24*obj.centers[i][1] +
            this.prmvMatrix.m34*obj.centers[i][2] +
            this.prmvMatrix.m44;
        depths[i] = z/w;
        result[i] = i;
      }
      result.sort(compare);
      return result;
    };
    
    rglwidgetClass.prototype.disableArrays = function(obj, enabled) {
      var gl = this.gl || this.initGL(),
          objLocs = ["normLoc", "texLoc", "ofsLoc", "pointLoc", "nextLoc"],
          thisLocs = ["posLoc", "colLoc"], i, attr;
      for (i = 0; i < objLocs.length; i++) 
        if (enabled[objLocs[i]]) gl.disableVertexAttribArray(obj[objLocs[i]]);
      for (i = 0; i < thisLocs.length; i++)
        if (enabled[thisLocs[i]]) gl.disableVertexAttribArray(this[objLocs[i]]);
      if (typeof obj.userAttributes !== "undefined") {
      	for (attr in obj.userAttribSizes) {  // Not all attributes may have been used
      	  gl.disableVertexAttribArray( obj.userAttribLocations[attr] );
      	}
      }
    }
    
    /**
     * Draw an object in a subscene
     * @param { number } id - object to draw
     * @param { number } subsceneid - id of subscene
     */
    rglwidgetClass.prototype.drawObj = function(id, subsceneid) {
      var obj = this.getObj(id),
          subscene = this.getObj(subsceneid),
          flags = obj.flags,
          type = obj.type,
          is_lit = flags & this.f_is_lit,
          has_texture = flags & this.f_has_texture,
          fixed_quads = flags & this.f_fixed_quads,
          is_transparent = flags & this.f_is_transparent,
          depth_sort = flags & this.f_depth_sort,
          sprites_3d = flags & this.f_sprites_3d,
          sprite_3d = flags & this.f_sprite_3d,
          is_lines = flags & this.f_is_lines,
          fat_lines = flags & this.f_fat_lines,
          is_points = flags & this.f_is_points,
          fixed_size = flags & this.f_fixed_size,
          is_twosided = (flags & this.f_is_twosided) > 0,
          gl = this.gl || this.initGL(),
          mat,
          sphereMV, baseofs, ofs, sscale, i, count, light,
          pass, mode, pmode, attr,
          enabled = {};

      if (typeof id !== "number") {
        this.alertOnce("drawObj id is "+typeof id);
      }

      if (type === "planes") {
        if (obj.bbox !== subscene.par3d.bbox || !obj.initialized) {
          this.planeUpdateTriangles(id, subscene.par3d.bbox);
        }
      }

      if (!obj.initialized)
        this.initObj(id);

      if (type === "clipplanes") {
        count = obj.offsets.length;
        var IMVClip = [];
        for (i=0; i < count; i++) {
          IMVClip[i] = this.multMV(this.invMatrix, obj.vClipplane.slice(4*i, 4*(i+1)));
         }
         obj.IMVClip = IMVClip;
        return;
      }

      if (type === "light" || type === "bboxdeco" || !obj.vertexCount)
        return;
    
      if (!is_transparent &&
    	  obj.someHidden) {
        is_transparent = true;
        depth_sort = ["triangles", "quads", "surface",
                      "spheres", "sprites", "text"].indexOf(type) >= 0;
      }        

      this.setDepthTest(id);
      
      if (sprites_3d) {
        var norigs = obj.vertices.length,
            savenorm = new CanvasMatrix4(this.normMatrix);
        this.origs = obj.vertices;
        this.usermat = new Float32Array(obj.userMatrix.getAsArray());
        this.radii = obj.radii;
        this.normMatrix = subscene.spriteNormmat;
        for (this.iOrig=0; this.iOrig < norigs; this.iOrig++) {
          for (i=0; i < obj.objects.length; i++) {
            this.drawObj(obj.objects[i], subsceneid);
          }
        }
        this.normMatrix = savenorm;
        return;
      } else {
        gl.useProgram(obj.prog);
      }

      if (typeof obj.polygon_offset !== "undefined") {
        gl.polygonOffset(obj.polygon_offset[0],
                          obj.polygon_offset[1]);
        gl.enable(gl.POLYGON_OFFSET_FILL);
      }

      if (sprite_3d) {
        gl.uniform3fv(obj.origLoc, new Float32Array(this.origs[this.iOrig]));
        if (this.radii.length > 1) {
          gl.uniform1f(obj.sizeLoc, this.radii[this.iOrig][0]);
        } else {
          gl.uniform1f(obj.sizeLoc, this.radii[0][0]);
        }
        gl.uniformMatrix4fv(obj.usermatLoc, false, this.usermat);
      }

      if (type === "spheres") {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.sphere.buf);
      } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buf);
      }

      gl.uniformMatrix4fv( obj.prMatLoc, false, new Float32Array(this.prMatrix.getAsArray()) );
      gl.uniformMatrix4fv( obj.mvMatLoc, false, new Float32Array(this.mvMatrix.getAsArray()) );
      var clipcheck = 0,
          clipplaneids = subscene.clipplanes,
          clip, j;
      for (i=0; i < clipplaneids.length; i++) {
        clip = this.getObj(clipplaneids[i]);
        for (j=0; j < clip.offsets.length; j++) {
          gl.uniform4fv(obj.clipLoc[clipcheck + j], clip.IMVClip[j]);
        }
        clipcheck += clip.offsets.length;
      }
      if (typeof obj.clipLoc !== "undefined")
        for (i=clipcheck; i < obj.clipLoc.length; i++)
          gl.uniform4f(obj.clipLoc[i], 0,0,0,0);

      if (is_lit) {
        gl.uniformMatrix4fv( obj.normMatLoc, false, new Float32Array(this.normMatrix.getAsArray()) );
        gl.uniform3fv( obj.emissionLoc, obj.emission);
        gl.uniform1f( obj.shininessLoc, obj.shininess);
        for (i=0; i < subscene.lights.length; i++) {
          light = this.getObj(subscene.lights[i]);
          if (!light.initialized) this.initObj(subscene.lights[i]);
          gl.uniform3fv( obj.ambientLoc[i], this.componentProduct(light.ambient, obj.ambient));
          gl.uniform3fv( obj.specularLoc[i], this.componentProduct(light.specular, obj.specular));
          gl.uniform3fv( obj.diffuseLoc[i], light.diffuse);
          gl.uniform3fv( obj.lightDirLoc[i], light.lightDir);
          gl.uniform1i( obj.viewpointLoc[i], light.viewpoint);
          gl.uniform1i( obj.finiteLoc[i], light.finite);
        }
        for (i=subscene.lights.length; i < obj.nlights; i++) {
          gl.uniform3f( obj.ambientLoc[i], 0,0,0);
          gl.uniform3f( obj.specularLoc[i], 0,0,0);
          gl.uniform3f( obj.diffuseLoc[i], 0,0,0);
        }
      }

      if (fixed_size) {
        gl.uniform2f( obj.textScaleLoc, 0.75/this.vp.width, 0.75/this.vp.height);
      }

      gl.enableVertexAttribArray( this.posLoc );
      enabled.posLoc = true;

      var nc = obj.colorCount;
      count = obj.vertexCount;

      if (type === "spheres") {
        subscene = this.getObj(subsceneid);
        var scale = subscene.par3d.scale,
            scount = count, indices;
        gl.vertexAttribPointer(this.posLoc,  3, gl.FLOAT, false, 4*this.sphere.vOffsets.stride,  0);
        gl.enableVertexAttribArray(obj.normLoc );
        enabled.normLoc = true;
        gl.vertexAttribPointer(obj.normLoc,  3, gl.FLOAT, false, 4*this.sphere.vOffsets.stride,  0);
        gl.disableVertexAttribArray( this.colLoc );
        var sphereNorm = new CanvasMatrix4();
        sphereNorm.scale(scale[0], scale[1], scale[2]);
        sphereNorm.multRight(this.normMatrix);
        gl.uniformMatrix4fv( obj.normMatLoc, false, new Float32Array(sphereNorm.getAsArray()) );

        if (nc == 1) {
          gl.vertexAttrib4fv( this.colLoc, new Float32Array(obj.onecolor));
        }

        if (has_texture) {
          gl.enableVertexAttribArray( obj.texLoc );
          enabled.texLoc = true;
          gl.vertexAttribPointer(obj.texLoc, 2, gl.FLOAT, false, 4*this.sphere.vOffsets.stride,
                                 4*this.sphere.vOffsets.tofs);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, obj.texture);
          gl.uniform1i( obj.sampler, 0);
        }

        if (depth_sort)
          indices = this.depthSort(obj);

        for (i = 0; i < scount; i++) {
          sphereMV = new CanvasMatrix4();

          if (depth_sort) {
            baseofs = indices[i]*obj.vOffsets.stride;
          } else {
            baseofs = i*obj.vOffsets.stride;
          }

          ofs = baseofs + obj.vOffsets.radofs;
          sscale = obj.values[ofs];

          sphereMV.scale(sscale/scale[0], sscale/scale[1], sscale/scale[2]);
          sphereMV.translate(obj.values[baseofs],
                             obj.values[baseofs+1],
                             obj.values[baseofs+2]);
          sphereMV.multRight(this.mvMatrix);
          gl.uniformMatrix4fv( obj.mvMatLoc, false, new Float32Array(sphereMV.getAsArray()) );

          if (nc > 1) {
            ofs = baseofs + obj.vOffsets.cofs;
            gl.vertexAttrib4f( this.colLoc, obj.values[ofs],
                                        obj.values[ofs+1],
                                       obj.values[ofs+2],
                                       obj.values[ofs+3] );
          }
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sphere.ibuf);
          gl.drawElements(gl.TRIANGLES, this.sphere.sphereCount, gl.UNSIGNED_SHORT, 0);
        }
        
        this.disableArrays(obj, enabled);
        if (typeof obj.polygon_offset !== "undefined") 
          gl.disable(gl.POLYGON_OFFSET_FILL);
          
        return;
      } else {
        if (obj.colorCount === 1) {
          gl.disableVertexAttribArray( this.colLoc );
          gl.vertexAttrib4fv( this.colLoc, new Float32Array(obj.onecolor));
        } else {
          gl.enableVertexAttribArray( this.colLoc );
          enabled.colLoc = true;
          gl.vertexAttribPointer(this.colLoc, 4, gl.FLOAT, false, 4*obj.vOffsets.stride, 4*obj.vOffsets.cofs);
        }
      }

      if (is_lit && obj.vOffsets.nofs > 0) {
        gl.enableVertexAttribArray( obj.normLoc );
        enabled.normLoc = true;
        gl.vertexAttribPointer(obj.normLoc, 3, gl.FLOAT, false, 4*obj.vOffsets.stride, 4*obj.vOffsets.nofs);
      }

      if (has_texture || type === "text") {
        gl.enableVertexAttribArray( obj.texLoc );
        enabled.texLoc = true;
        gl.vertexAttribPointer(obj.texLoc, 2, gl.FLOAT, false, 4*obj.vOffsets.stride, 4*obj.vOffsets.tofs);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, obj.texture);
        gl.uniform1i( obj.sampler, 0);
      }

      if (fixed_quads) {
        gl.enableVertexAttribArray( obj.ofsLoc );
        enabled.ofsLoc = true;
        gl.vertexAttribPointer(obj.ofsLoc, 2, gl.FLOAT, false, 4*obj.vOffsets.stride, 4*obj.vOffsets.oofs);
      }

      if (typeof obj.userAttributes !== "undefined") {
      	for (attr in obj.userAttribSizes) {  // Not all attributes may have been used
      	  gl.enableVertexAttribArray( obj.userAttribLocations[attr] );
      	  gl.vertexAttribPointer( obj.userAttribLocations[attr], obj.userAttribSizes[attr],
      	  			  gl.FLOAT, false, 4*obj.vOffsets.stride, 4*obj.userAttribOffsets[attr]);
      	}
      }

      if (typeof obj.userUniforms !== "undefined") {
      	for (attr in obj.userUniformLocations) {
      	  var loc = obj.userUniformLocations[attr];
      	  if (loc !== null) {
      	    var uniform = obj.userUniforms[attr];
      	    if (typeof uniform.length === "undefined")
      	      gl.uniform1f(loc, uniform);
      	    else if (typeof uniform[0].length === "undefined") {
      	      uniform = new Float32Array(uniform);
      	      switch(uniform.length) {
      	      	case 2: gl.uniform2fv(loc, uniform); break;
      	      	case 3: gl.uniform3fv(loc, uniform); break;
      	      	case 4: gl.uniform4fv(loc, uniform); break;
      	      	default: console.warn("bad uniform length");
      	      }
      	    } else if (uniform.length == 4 && uniform[0].length == 4)
      	      gl.uniformMatrix4fv(loc, false, new Float32Array(uniform.getAsArray()));
      	    else
      	      console.warn("unsupported uniform matrix");
      	  }
      	}
      }

      for (pass = 0; pass < obj.passes; pass++) {
      	pmode = obj.pmode[pass];
        if (pmode === "culled")
          continue;

      	mode = fat_lines && (is_lines || pmode == "lines") ? "TRIANGLES" : this.mode4type[type];
        if (depth_sort && pmode == "filled") {// Don't try depthsorting on wireframe or points
          var faces = this.depthSort(obj),
              nfaces = faces.length,
              frowsize = Math.floor(obj.f[pass].length/nfaces);

          if (type !== "spheres") {
            var f = obj.index_uint ? new Uint32Array(obj.f[pass].length) : new Uint16Array(obj.f[pass].length);
            for (i=0; i<nfaces; i++) {
              for (j=0; j<frowsize; j++) {
                f[frowsize*i + j] = obj.f[pass][frowsize*faces[i] + j];
              }
            }
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ibuf[pass]);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, f, gl.DYNAMIC_DRAW);
          }
        }

      	if (is_twosided)
      	  gl.uniform1i(obj.frontLoc, pass !== 0);

        if (type !== "spheres") 
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ibuf[pass]);

        if (type === "sprites" || type === "text" || type === "quads") {
          count = count * 6/4;
        } else if (type === "surface") {
          count = obj.f[pass].length;
        }

        count = obj.f[pass].length;
      	if (!is_lines && pmode === "lines" && !fat_lines) {
          mode = "LINES";
        } else if (pmode === "points") {
          mode = "POINTS";
        }
                          
        if ((is_lines || pmode === "lines") && fat_lines) {
          gl.enableVertexAttribArray(obj.pointLoc);
          enabled.pointLoc = true;
          gl.vertexAttribPointer(obj.pointLoc, 2, gl.FLOAT, false, 4*obj.vOffsets.stride, 4*obj.vOffsets.pointofs);
          gl.enableVertexAttribArray(obj.nextLoc );
          enabled.nextLoc = true;
          gl.vertexAttribPointer(obj.nextLoc, 3, gl.FLOAT, false, 4*obj.vOffsets.stride, 4*obj.vOffsets.nextofs);
          gl.uniform1f(obj.aspectLoc, this.vp.width/this.vp.height);
          gl.uniform1f(obj.lwdLoc, this.getMaterial(id, "lwd")/this.vp.height);
        }

        gl.vertexAttribPointer(this.posLoc,  3, gl.FLOAT, false, 4*obj.vOffsets.stride,  4*obj.vOffsets.vofs);

        gl.drawElements(gl[mode], count, obj.index_uint ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
        this.disableArrays(obj, enabled);
     }
     
     if (typeof obj.polygon_offset !== "undefined") 
       gl.disable(gl.POLYGON_OFFSET_FILL);
   };

    /**
     * Draw the background for a subscene
     * @param { number } id - id of background object
     * @param { number } subsceneid - id of subscene
     */
    rglwidgetClass.prototype.drawBackground = function(id, subsceneid) {
      var gl = this.gl || this.initGL(),
          obj = this.getObj(id),
          bg, i;

      if (!obj.initialized)
        this.initObj(id);

      if (obj.colors.length) {
        bg = obj.colors[0];
        gl.clearColor(bg[0], bg[1], bg[2], bg[3]);
        gl.depthMask(true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }
      if (typeof obj.quad !== "undefined") {
        this.prMatrix.makeIdentity();
        this.mvMatrix.makeIdentity();
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.depthMask(false);
        for (i=0; i < obj.quad.length; i++)
          this.drawObj(obj.quad[i], subsceneid);
      }
    };

    /**
     * Draw a subscene
     * @param { number } subsceneid - id of subscene
     * @param { boolean } opaquePass - is this the opaque drawing pass?
     */
    rglwidgetClass.prototype.drawSubscene = function(subsceneid, opaquePass) {
      var gl = this.gl || this.initGL(),
          sub = this.getObj(subsceneid),
          objects = this.scene.objects,
          subids = sub.objects,
          subscene_has_faces = false,
          subscene_needs_sorting = false,
          flags, i, obj;
      if (sub.par3d.skipRedraw)
        return;
      for (i=0; i < subids.length; i++) {
      	obj = objects[subids[i]];
        flags = obj.flags;
        if (typeof flags !== "undefined") {
          subscene_has_faces |= (flags & this.f_is_lit)
                           & !(flags & this.f_fixed_quads);
          obj.is_transparent = (flags & this.f_is_transparent) || obj.someHidden;
          subscene_needs_sorting |= (flags & this.f_depth_sort) || obj.is_transparent;
        }
      }

      this.setViewport(subsceneid);

      if (typeof sub.backgroundId !== "undefined" && opaquePass)
          this.drawBackground(sub.backgroundId, subsceneid);

      if (subids.length) {
        this.setprMatrix(subsceneid);
        this.setmvMatrix(subsceneid);

        if (subscene_has_faces) {
          this.setnormMatrix(subsceneid);
          if ((sub.flags & this.f_sprites_3d) &&
              typeof sub.spriteNormmat === "undefined") {
            sub.spriteNormmat = new CanvasMatrix4(this.normMatrix);
          }
        }

        if (subscene_needs_sorting)
          this.setprmvMatrix();

        var clipids = sub.clipplanes;
        if (typeof clipids === "undefined") {
          console.warn("bad clipids");
        }
        if (clipids.length > 0) {
          this.invMatrix = new CanvasMatrix4(this.mvMatrix);
          this.invMatrix.invert();
          for (i = 0; i < clipids.length; i++)
            this.drawObj(clipids[i], subsceneid);
        }

        subids = sub.opaque.concat(sub.transparent);
        if (opaquePass) {
          gl.enable(gl.DEPTH_TEST);
          gl.depthMask(true);
          gl.disable(gl.BLEND);
          for (i = 0; i < subids.length; i++) {
            if (!this.getObj(subids[i]).is_transparent)	
              this.drawObj(subids[i], subsceneid);
          }
        } else {
          gl.depthMask(false);
          gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
                               gl.ONE, gl.ONE);
          gl.enable(gl.BLEND);
          for (i = 0; i < subids.length; i++) {
            if (this.getObj(subids[i]).is_transparent)
              this.drawObj(subids[i], subsceneid);
          }
        }
        subids = sub.subscenes;
        for (i = 0; i < subids.length; i++) {
          this.drawSubscene(subids[i], opaquePass);
        }
      }
    };
    
    /**
     * Respond to brush change
     */
    rglwidgetClass.prototype.selectionChanged = function() {
      var i, j, k, id, subid = this.select.subscene, subscene,
          objids, obj,
          p1 = this.select.region.p1, p2 = this.select.region.p2,
          filter, selection = [], handle, keys, xmin, x, xmax, ymin, y, ymax, z, v,
          someHidden;
      if (!subid)
        return;
      subscene = this.getObj(subid);
      objids = subscene.objects;
      filter = this.scene.crosstalk.filter;
      this.setmvMatrix(subid);
      this.setprMatrix(subid);
      this.setprmvMatrix();
      xmin = Math.min(p1.x, p2.x);
      xmax = Math.max(p1.x, p2.x);
      ymin = Math.min(p1.y, p2.y);
      ymax = Math.max(p1.y, p2.y);
      for (i = 0; i < objids.length; i++) {
      	id = objids[i];
      	j = this.scene.crosstalk.id.indexOf(id);
      	if (j >= 0) {
      	  keys = this.scene.crosstalk.key[j];
      	  obj = this.getObj(id);
      	  someHidden = false;
      	  for (k = 0; k < keys.length; k++) {
      	    if (filter && filter.indexOf(keys[k]) < 0) {
      	      someHidden = true;
      	      continue;
      	    }
      	    v = [].concat(obj.vertices[k]).concat(1.0);
            v = this.multVM(v, this.prmvMatrix);
            x = v[0]/v[3];
            y = v[1]/v[3];
            z = v[2]/v[3];
            if (xmin <= x && x <= xmax && ymin <= y && y <= ymax && -1.0 <= z && z <= 1.0) {
              selection.push(keys[k]);
            } else
              someHidden = true;
      	  }
      	  obj.someHidden = someHidden && (filter || selection.length);
      	  obj.initialized = false;
      	  /* Who should we notify?  Only shared data in the current subscene, or everyone? */
      	  if (!this.equalArrays(selection, this.scene.crosstalk.selection)) {
      	    handle = this.scene.crosstalk.sel_handle[j];
      	    handle.set(selection, {rglSubsceneId: this.select.subscene});
      	  }
      	}
      }
    };
    
    /**
     * Respond to selection or filter change from crosstalk
     * @param { Object } event - crosstalk event
     * @param { boolean } filter - filter or selection?
     */
    rglwidgetClass.prototype.selection = function(event, filter) {
      	var i, j, ids, obj, keys, crosstalk = this.scene.crosstalk,
      	    selection, someHidden;

      	// Record the message and find out if this event makes some objects have mixed values:
      	
      	crosstalk = this.scene.crosstalk;
      	
      	if (filter) {
      	  filter = crosstalk.filter = event.value;
      	  selection = crosstalk.selection;
      	} else {  
          selection = crosstalk.selection = event.value;
          filter = crosstalk.filter;
      	}
        ids = crosstalk.id;
        for (i = 0; i < ids.length ; i++) {
          obj = this.getObj(ids[i]);
          obj.initialized = false;
          keys = crosstalk.key[i];
          someHidden = false;
          for (j = 0; j < keys.length && !someHidden; j++) {
            if ((filter && filter.indexOf(keys[j]) < 0) ||
                (selection.length && selection.indexOf(keys[j]) < 0))
                someHidden = true;
          }
          obj.someHidden = someHidden;
        }
        this.drawScene();
    };
    
    /**
     * Clear the selection brush
     * @param { number } except - Subscene that should ignore this request
     */
    rglwidgetClass.prototype.clearBrush = function(except) {
      if (this.select.subscene != except) {
        this.select.state = "inactive";
        this.delFromSubscene(this.scene.brushId, this.select.subscene);
      }
      this.drawScene();
    };

    /**
     * Compute mouse coordinates relative to current canvas
     * @returns { Object }
     * @param { Object } event - event object from mouse click
     */
    rglwidgetClass.prototype.relMouseCoords = function(event) {
      var totalOffsetX = 0,
      totalOffsetY = 0,
      currentElement = this.canvas;

      do {
        totalOffsetX += currentElement.offsetLeft;
        totalOffsetY += currentElement.offsetTop;
        currentElement = currentElement.offsetParent;
      }
      while(currentElement);

      var canvasX = event.pageX - totalOffsetX,
          canvasY = event.pageY - totalOffsetY;

      return {x:canvasX, y:canvasY};
    };

    /**
     * Set mouse handlers for the scene
     */
    rglwidgetClass.prototype.setMouseHandlers = function() {
      var self = this, activeSubscene, handler,
          handlers = {}, drag = 0;

      handlers.rotBase = 0;

      this.screenToVector = function(x, y) {
        var viewport = this.getObj(activeSubscene).par3d.viewport,
          width = viewport.width*this.canvas.width,
          height = viewport.height*this.canvas.height,
          radius = Math.max(width, height)/2.0,
          cx = width/2.0,
          cy = height/2.0,
          px = (x-cx)/radius,
          py = (y-cy)/radius,
          plen = Math.sqrt(px*px+py*py);
        if (plen > 1.e-6) {
          px = px/plen;
          py = py/plen;
        }
        var angle = (Math.SQRT2 - plen)/Math.SQRT2*Math.PI/2,
          z = Math.sin(angle),
          zlen = Math.sqrt(1.0 - z*z);
        px = px * zlen;
        py = py * zlen;
        return [px, py, z];
      };

      handlers.trackballdown = function(x,y) {
        var activeSub = this.getObj(activeSubscene),
            activeModel = this.getObj(this.useid(activeSub.id, "model")),
            i, l = activeModel.par3d.listeners;
        handlers.rotBase = this.screenToVector(x, y);
        this.saveMat = [];
        for (i = 0; i < l.length; i++) {
          activeSub = this.getObj(l[i]);
          activeSub.saveMat = new CanvasMatrix4(activeSub.par3d.userMatrix);
        }
      };

      handlers.trackballmove = function(x,y) {
        var rotCurrent = this.screenToVector(x,y),
            rotBase = handlers.rotBase,
            dot = rotBase[0]*rotCurrent[0] +
                  rotBase[1]*rotCurrent[1] +
                  rotBase[2]*rotCurrent[2],
            angle = Math.acos( dot/this.vlen(rotBase)/this.vlen(rotCurrent) )*180.0/Math.PI,
            axis = this.xprod(rotBase, rotCurrent),
            objects = this.scene.objects,
            activeSub = this.getObj(activeSubscene),
            activeModel = this.getObj(this.useid(activeSub.id, "model")),
            l = activeModel.par3d.listeners,
            i;
        for (i = 0; i < l.length; i++) {
          activeSub = this.getObj(l[i]);
          activeSub.par3d.userMatrix.load(objects[l[i]].saveMat);
          activeSub.par3d.userMatrix.rotate(angle, axis[0], axis[1], axis[2]);
        }
        this.drawScene();
      };
      handlers.trackballend = 0;

      this.clamp = function(x, lo, hi) {
      	return Math.max(lo, Math.min(x, hi));
      };

      this.screenToPolar = function(x,y) {
        var viewport = this.getObj(activeSubscene).par3d.viewport,
          width = viewport.width*this.canvas.width,
          height = viewport.height*this.canvas.height,
    	  r = Math.min(width, height)/2,
    	  dx = this.clamp(x - width/2, -r, r),
    	  dy = this.clamp(y - height/2, -r, r);
    	  return [Math.asin(dx/r), Math.asin(-dy/r)];
      };

      handlers.polardown = function(x,y) {
        var activeSub = this.getObj(activeSubscene),
            activeModel = this.getObj(this.useid(activeSub.id, "model")),
            i, l = activeModel.par3d.listeners;
        handlers.dragBase = this.screenToPolar(x, y);
        this.saveMat = [];
        for (i = 0; i < l.length; i++) {
          activeSub = this.getObj(l[i]);
          activeSub.saveMat = new CanvasMatrix4(activeSub.par3d.userMatrix);
          activeSub.camBase = [-Math.atan2(activeSub.saveMat.m13, activeSub.saveMat.m11),
                               Math.atan2(activeSub.saveMat.m32, activeSub.saveMat.m22)];
        }
      };

      handlers.polarmove = function(x,y) {
        var dragCurrent = this.screenToPolar(x,y),
            activeSub = this.getObj(activeSubscene),
            activeModel = this.getObj(this.useid(activeSub.id, "model")),
            objects = this.scene.objects,
            l = activeModel.par3d.listeners,
            i, changepos = [];
        for (i = 0; i < l.length; i++) {
          activeSub = this.getObj(l[i]);
          for (j=0; j<2; j++)
            changepos[j] = -(dragCurrent[j] - handlers.dragBase[j]);
          activeSub.par3d.userMatrix.makeIdentity();
          activeSub.par3d.userMatrix.rotate(changepos[0]*180/Math.PI, 0,-1,0);
          activeSub.par3d.userMatrix.multRight(objects[l[i]].saveMat);
          activeSub.par3d.userMatrix.rotate(changepos[1]*180/Math.PI, -1,0,0);
        }
        this.drawScene();
      };
      handlers.polarend = 0;

      handlers.axisdown = function(x,y) {
        handlers.rotBase = this.screenToVector(x, this.canvas.height/2);
        var activeSub = this.getObj(activeSubscene),
            activeModel = this.getObj(this.useid(activeSub.id, "model")),
            i, l = activeModel.par3d.listeners;
        for (i = 0; i < l.length; i++) {
          activeSub = this.getObj(l[i]);
          activeSub.saveMat = new CanvasMatrix4(activeSub.par3d.userMatrix);
        }
      };

      handlers.axismove = function(x,y) {
        var rotCurrent = this.screenToVector(x, this.canvas.height/2),
            rotBase = handlers.rotBase,
            angle = (rotCurrent[0] - rotBase[0])*180/Math.PI,
            rotMat = new CanvasMatrix4();
        rotMat.rotate(angle, handlers.axis[0], handlers.axis[1], handlers.axis[2]);
        var activeSub = this.getObj(activeSubscene),
            activeModel = this.getObj(this.useid(activeSub.id, "model")),
            i, l = activeModel.par3d.listeners;
        for (i = 0; i < l.length; i++) {
          activeSub = this.getObj(l[i]);
          activeSub.par3d.userMatrix.load(activeSub.saveMat);
          activeSub.par3d.userMatrix.multLeft(rotMat);
        }
        this.drawScene();
      };
      handlers.axisend = 0;

      handlers.y0zoom = 0;
      handlers.zoom0 = 0;
      handlers.zoomdown = function(x, y) {
        var activeSub = this.getObj(activeSubscene),
          activeProjection = this.getObj(this.useid(activeSub.id, "projection")),
          i, l = activeProjection.par3d.listeners;
        handlers.y0zoom = y;
        for (i = 0; i < l.length; i++) {
          activeSub = this.getObj(l[i]);
          activeSub.zoom0 = Math.log(activeSub.par3d.zoom);
        }
      };
      handlers.zoommove = function(x, y) {
        var activeSub = this.getObj(activeSubscene),
            activeProjection = this.getObj(this.useid(activeSub.id, "projection")),
            i, l = activeProjection.par3d.listeners;
        for (i = 0; i < l.length; i++) {
          activeSub = this.getObj(l[i]);
          activeSub.par3d.zoom = Math.exp(activeSub.zoom0 + (y-handlers.y0zoom)/this.canvas.height);
        }
        this.drawScene();
      };
      handlers.zoomend = 0;

      handlers.y0fov = 0;
      handlers.fovdown = function(x, y) {
        handlers.y0fov = y;
        var activeSub = this.getObj(activeSubscene),
          activeProjection = this.getObj(this.useid(activeSub.id, "projection")),
          i, l = activeProjection.par3d.listeners;
        for (i = 0; i < l.length; i++) {
          activeSub = this.getObj(l[i]);
          activeSub.fov0 = activeSub.par3d.FOV;
        }
      };
      handlers.fovmove = function(x, y) {
        var activeSub = this.getObj(activeSubscene),
            activeProjection = this.getObj(this.useid(activeSub.id, "projection")),
            i, l = activeProjection.par3d.listeners;
        for (i = 0; i < l.length; i++) {
          activeSub = this.getObj(l[i]);
          activeSub.par3d.FOV = Math.max(1, Math.min(179, activeSub.fov0 +
             180*(y-handlers.y0fov)/this.canvas.height));
        }
        this.drawScene();
      };
      handlers.fovend = 0;
      
      handlers.selectingdown = function(x, y) {
      	var viewport = this.getObj(activeSubscene).par3d.viewport,
      	  width = viewport.width*this.canvas.width,
      	  height = viewport.height*this.canvas.height, 
          p = {x: 2.0*x/width - 1.0, y: 2.0*y/height - 1.0};
      	this.select.region = {p1: p, p2: p};
      	if (this.select.subscene && this.select.subscene != activeSubscene)
      	  this.delFromSubscene(this.scene.brushId, this.select.subscene);
      	this.select.subscene = activeSubscene;
      	this.addToSubscene(this.scene.brushId, activeSubscene);
      	this.select.state = "changing";
      	if (typeof this.scene.brushId !== "undefined")
      	  this.getObj(this.scene.brushId).initialized = false;
      	this.drawScene();
      };
      
      handlers.selectingmove = function(x, y) {
      	var viewport = this.getObj(activeSubscene).par3d.viewport,
      	  width = viewport.width*this.canvas.width,
      	  height = viewport.height*this.canvas.height;
      	if (this.select.state === "inactive") 
      	  return;
      	this.select.region.p2 = {x: 2.0*x/width - 1.0, y: 2.0*y/height - 1.0};
      	if (typeof this.scene.brushId !== "undefined")
      	  this.getObj(this.scene.brushId).initialized = false;
      	this.drawScene();
      };
      
      handlers.selectingend = 0;

      this.canvas.onmousedown = function ( ev ){
        if (!ev.which) // Use w3c defns in preference to MS
        switch (ev.button) {
          case 0: ev.which = 1; break;
          case 1:
          case 4: ev.which = 2; break;
          case 2: ev.which = 3;
        }
        drag = ["left", "middle", "right"][ev.which-1];
        var coords = self.relMouseCoords(ev);
        coords.y = self.canvas.height-coords.y;
        activeSubscene = self.whichSubscene(coords);
        var sub = self.getObj(activeSubscene), f;
        handler = sub.par3d.mouseMode[drag];
        switch (handler) {
        case "xAxis":
          handler = "axis";
          handlers.axis = [1.0, 0.0, 0.0];
          break;
        case "yAxis":
          handler = "axis";
          handlers.axis = [0.0, 1.0, 0.0];
          break;
        case "zAxis":
          handler = "axis";
          handlers.axis = [0.0, 0.0, 1.0];
          break;
        }
        f = handlers[handler + "down"];
        if (f) {
          coords = self.translateCoords(activeSubscene, coords);
          f.call(self, coords.x, coords.y);
          ev.preventDefault();
        } else
          console.warn("Mouse handler '" + handler + "' is not implemented.");

      };

      this.canvas.onmouseup = function ( ev ){
        if ( drag === 0 ) return;
        var f = handlers[handler + "end"];
        if (f) {
          f.call(self);
          ev.preventDefault();
        }
        drag = 0;
      };

      this.canvas.onmouseout = this.canvas.onmouseup;

      this.canvas.onmousemove = function ( ev ) {
        if ( drag === 0 ) return;
        var f = handlers[handler + "move"];
        if (f) {
          var coords = self.relMouseCoords(ev);
          coords.y = self.canvas.height - coords.y;
          coords = self.translateCoords(activeSubscene, coords);
          f.call(self, coords.x, coords.y);
        }
      };

      handlers.wheelHandler = function(ev) {
        var del = 1.02, i;
        if (ev.shiftKey) del = 1.002;
        var ds = ((ev.detail || ev.wheelDelta) > 0) ? del : (1 / del);
        if (typeof activeSubscene === "undefined")
          activeSubscene = self.scene.rootSubscene;
        var activeSub = self.getObj(activeSubscene),
            activeProjection = self.getObj(self.useid(activeSub.id, "projection")),
            l = activeProjection.par3d.listeners;

        for (i = 0; i < l.length; i++) {
          activeSub = self.getObj(l[i]);
          activeSub.par3d.zoom *= ds;
        }
        self.drawScene();
        ev.preventDefault();
      };

      this.canvas.addEventListener("DOMMouseScroll", handlers.wheelHandler, false);
      this.canvas.addEventListener("mousewheel", handlers.wheelHandler, false);
    };

    /**
     * Find a particular subscene by inheritance
     * @returns { number } id of subscene to use
     * @param { number } subsceneid - child subscene
     * @param { string } type - type of inheritance:  "projection" or "model"
     */
    rglwidgetClass.prototype.useid = function(subsceneid, type) {
      var sub = this.getObj(subsceneid);
      if (sub.embeddings[type] === "inherit")
        return(this.useid(sub.parent, type));
      else
        return subsceneid;
    };

    /**
     * Check whether point is in viewport of subscene
     * @returns {boolean}
     * @param { Object } coords - screen coordinates of point
     * @param { number } subsceneid - subscene to check
     */
    rglwidgetClass.prototype.inViewport = function(coords, subsceneid) {
      var viewport = this.getObj(subsceneid).par3d.viewport,
        x0 = coords.x - viewport.x*this.canvas.width,
        y0 = coords.y - viewport.y*this.canvas.height;
      return 0 <= x0 && x0 <= viewport.width*this.canvas.width &&
             0 <= y0 && y0 <= viewport.height*this.canvas.height;
    };

    /**
     * Find which subscene contains a point
     * @returns { number } subscene id
     * @param { Object } coords - coordinates of point
     */
    rglwidgetClass.prototype.whichSubscene = function(coords) {
      var self = this,
          recurse = function(subsceneid) {
            var subscenes = self.getChildSubscenes(subsceneid), i, id;
            for (i=0; i < subscenes.length; i++) {
              id = recurse(subscenes[i]);
              if (typeof(id) !== "undefined")
                return(id);
            }
            if (self.inViewport(coords, subsceneid))
              return(subsceneid);
            else
              return undefined;
          },
          rootid = this.scene.rootSubscene,
          result = recurse(rootid);
      if (typeof(result) === "undefined")
        result = rootid;
      return result;
    };

    /**
     * Translate from window coordinates to viewport coordinates
     * @returns { Object } translated coordinates
     * @param { number } subsceneid - which subscene to use?
     * @param { Object } coords - point to translate
     */
    rglwidgetClass.prototype.translateCoords = function(subsceneid, coords) {
      var viewport = this.getObj(subsceneid).par3d.viewport;
      return {x: coords.x - viewport.x*this.canvas.width,
              y: coords.y - viewport.y*this.canvas.height};
    };

    /**
     * Initialize the sphere object
     */
    rglwidgetClass.prototype.initSphere = function() {
      var verts = this.scene.sphereVerts,
          reuse = verts.reuse, result;
      if (typeof reuse !== "undefined") {
        var prev = document.getElementById(reuse).rglinstance.sphere;
        result = {values: prev.values, vOffsets: prev.vOffsets, it: prev.it};
      } else
        result = {values: new Float32Array(this.flatten(this.cbind(this.transpose(verts.vb),
                    this.transpose(verts.texcoords)))),
                  it: new Uint16Array(this.flatten(this.transpose(verts.it))),
                  vOffsets: {vofs:0, cofs:-1, nofs:-1, radofs:-1, oofs:-1,
                    tofs:3, nextofs:-1, pointofs:-1, stride:5}};

      result.sphereCount = result.it.length;
      this.sphere = result;
    };
    
    /**
     * Set the vertices in the selection box object
     */
    rglwidgetClass.prototype.initSelection = function(id) {
      if (typeof this.select.region === "undefined")
        return;
      var obj = this.getObj(id),
          width = this.canvas.width,
          height = this.canvas.height, 
          p1 = this.select.region.p1,
          p2 = this.select.region.p2;
          
      obj.vertices = [[p1.x, p1.y, 0.0],
                      [p2.x, p1.y, 0.0],
                      [p2.x, p2.y, 0.0],
                      [p1.x, p2.y, 0.0],
                      [p1.x, p1.y, 0.0]];
    };

    /**
     * Do the gl part of initializing the sphere
     */
    rglwidgetClass.prototype.initSphereGL = function() {
      var gl = this.gl || this.initGL(), sphere = this.sphere;
      if (gl.isContextLost()) return;
      sphere.buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sphere.buf);
      gl.bufferData(gl.ARRAY_BUFFER, sphere.values, gl.STATIC_DRAW);
      sphere.ibuf = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.ibuf);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.it, gl.STATIC_DRAW);
      return;
    };

    /**
     * Initialize the DOM object
     * @param { Object } el - the DOM object
     * @param { Object } x - the scene data sent by JSON from R
     */
    rglwidgetClass.prototype.initialize = function(el, x) {
      this.textureCanvas = document.createElement("canvas");
      this.textureCanvas.style.display = "block";
      this.scene = x;
      this.normMatrix = new CanvasMatrix4();
      this.saveMat = {};
      this.distance = null;
      this.posLoc = 0;
      this.colLoc = 1;
      if (el) {
        el.rglinstance = this;
        this.el = el;
        this.webGLoptions = el.rglinstance.scene.webGLoptions;
        this.initCanvas();
      }
      if (typeof Shiny !== "undefined") {
        var self = this;
        Shiny.addCustomMessageHandler("shinyGetPar3d",
          function(message) {
            var i, param, 
                subscene = self.getObj(message.subscene),
                parameters = [].concat(message.parameters),
                result = {tag: message.tag, subscene: message.subscene};
            if (typeof subscene !== "undefined") {
              for (i = 0; i < parameters.length; i++) {
                param = parameters[i];
                result[param] = subscene.par3d[param];
              };
            } else {
              console.log("subscene "+message.subscene+" undefined.")
            }
            Shiny.setInputValue("par3d:shinyPar3d", result, {priority: "event"});
          });
          
        Shiny.addCustomMessageHandler("shinySetPar3d",
          function(message) {
            var param = message.parameter, 
                subscene = self.getObj(message.subscene);
            if (typeof subscene !== "undefined") {
              subscene.par3d[param] = message.value;
              subscene.initialized = false;
              self.drawScene();
            } else {
              console.log("subscene "+message.subscene+" undefined.")
            }
          })
      }
    };

    /**
     * Restart the WebGL canvas
     */
    rglwidgetClass.prototype.restartCanvas = function() {
      var newcanvas = document.createElement("canvas"),
          self = this;
      newcanvas.width = this.el.width;
      newcanvas.height = this.el.height;
      newcanvas.addEventListener("webglcontextrestored",
        this.onContextRestored, false);
      newcanvas.addEventListener("webglcontextlost",
        this.onContextLost, false);
      while (this.el.firstChild) {
        this.el.removeChild(this.el.firstChild);
      }
      this.el.appendChild(newcanvas);
      this.canvas = newcanvas;
      this.setMouseHandlers();
      if (this.gl) 
        Object.keys(this.scene.objects).forEach(function(key){
          self.getObj(parseInt(key, 10)).texture = undefined; 
          });
      this.gl = null;
    };

    /**
     * Initialize the WebGL canvas
     */
    rglwidgetClass.prototype.initCanvas = function() {
      this.restartCanvas();
      var objs = this.scene.objects,
          self = this;
      Object.keys(objs).forEach(function(key){
        var id = parseInt(key, 10),
            obj = self.getObj(id);
        if (typeof obj.reuse !== "undefined")
          self.copyObj(id, obj.reuse);
      });
      Object.keys(objs).forEach(function(key){
        self.initSubscene(parseInt(key, 10));
      });
      this.setMouseHandlers();
      this.initSphere();

      this.onContextRestored = function(event) {
        self.initGL();
        self.drawScene();
      };

      this.onContextLost = function(event) {
        if (!self.drawing)
          this.gl = null;
        event.preventDefault();
      };

      this.initGL0();
      this.lazyLoadScene = function() {
      	if (typeof self.slide === "undefined")
      	  self.slide = self.getSlide();
      	if (self.isInBrowserViewport()) {
      	  if (!self.gl || self.gl.isContextLost())
      	    self.initGL();
      	  self.drawScene();
      	}
      };
      window.addEventListener("DOMContentLoaded", this.lazyLoadScene, false);
      window.addEventListener("load", this.lazyLoadScene, false);
      window.addEventListener("resize", this.lazyLoadScene, false);
      window.addEventListener("scroll", this.lazyLoadScene, false);
      this.slide = this.getSlide();
      if (this.slide) {
        if (typeof this.slide.rgl === "undefined")
          this.slide.rgl = [this];
        else
          this.slide.rgl.push(this);
        if (this.scene.context.rmarkdown) 
          if (this.scene.context.rmarkdown === "ioslides_presentation") {
            this.slide.setAttribute("slideenter", "this.rgl.forEach(function(scene) { scene.lazyLoadScene.call(window);})");
          } else if (this.scene.context.rmarkdown === "slidy_presentation") {
            // This method would also work in ioslides, but it gets triggered
            // something like 5 times per slide for every slide change, so
            // you'd need a quicker function than lazyLoadScene.
            var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,
            observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                self.slide.rgl.forEach(function(scene) { scene.lazyLoadScene.call(window); });});});
            observer.observe(this.slide, { attributes: true, attributeFilter:["class"] });
          }
      }
    };

    /**
     * Start the writeWebGL scene. This is only used by writeWebGL; rglwidget has
       no debug element and does the drawing in rglwidget.js.
     */
    rglwidgetClass.prototype.start = function() {
      if (typeof this.prefix !== "undefined") {
        this.debugelement = document.getElementById(this.prefix + "debug");
        this.debug("");
      }
      this.drag = 0;
      this.drawScene();
    };

    /**
     * Display a debug message
     * @param { string } msg - The message to display
     * @param { Object } [img] - Image to insert before message
     */
    rglwidgetClass.prototype.debug = function(msg, img) {
      if (typeof this.debugelement !== "undefined" && this.debugelement !== null) {
        this.debugelement.innerHTML = msg;
        if (typeof img !== "undefined") {
          this.debugelement.insertBefore(img, this.debugelement.firstChild);
        }
      } else if (msg !== "")
        alert(msg);
    };

    /**
     * Get the snapshot image of this scene
     * @returns { Object } The img DOM element
     */
    rglwidgetClass.prototype.getSnapshot = function() {
      var img;
      if (typeof this.scene.snapshot !== "undefined") {
        img = document.createElement("img");
        img.src = this.scene.snapshot;
        img.alt = "Snapshot";
      }
      return img;
    };

    /**
     * Initial test for WebGL
     */
    rglwidgetClass.prototype.initGL0 = function() {
      if (!window.WebGLRenderingContext){
        alert("Your browser does not support WebGL. See http://get.webgl.org");
        return;
      }
    };

    /**
     * If we are in an ioslides or slidy presentation, get the
     * DOM element of the current slide
     * @returns { Object }
     */
    rglwidgetClass.prototype.getSlide = function() {
      var result = this.el, done = false;
      while (result && !done && this.scene.context.rmarkdown) {
      	switch(this.scene.context.rmarkdown) {
          case "ioslides_presentation":
            if (result.tagName === "SLIDE") return result;
            break;
          case "slidy_presentation":
            if (result.tagName === "DIV" && result.classList.contains("slide"))
              return result;
            break;
          default: return null;
      	}
      	result = result.parentElement;
      }
      return null;
    };

    /**
     * Is this scene visible in the browser?
     * @returns { boolean }
     */
    rglwidgetClass.prototype.isInBrowserViewport = function() {
      var rect = this.canvas.getBoundingClientRect(),
          windHeight = (window.innerHeight || document.documentElement.clientHeight),
          windWidth = (window.innerWidth || document.documentElement.clientWidth);
      if (this.scene.context && this.scene.context.rmarkdown !== null) {
      	if (this.slide)
      	  return (this.scene.context.rmarkdown === "ioslides_presentation" &&
      	          this.slide.classList.contains("current")) ||
      	         (this.scene.context.rmarkdown === "slidy_presentation" &&
      	          !this.slide.classList.contains("hidden"));
      }
      return (
      	rect.top >= -windHeight &&
      	rect.left >= -windWidth &&
      	rect.bottom <= 2*windHeight &&
      	rect.right <= 2*windWidth);
    };

    /**
     * Initialize WebGL
     * @returns { Object } the WebGL context
     */
    rglwidgetClass.prototype.initGL = function() {
      var self = this;
      if (this.gl) {
      	if (!this.drawing && this.gl.isContextLost())
          this.restartCanvas();
        else
          return this.gl;
      }
      // if (!this.isInBrowserViewport()) return; Return what??? At this point we know this.gl is null.
      this.canvas.addEventListener("webglcontextrestored",
        this.onContextRestored, false);
      this.canvas.addEventListener("webglcontextlost",
        this.onContextLost, false);
      this.gl = this.canvas.getContext("webgl", this.webGLoptions) ||
               this.canvas.getContext("experimental-webgl", this.webGLoptions);
      this.index_uint = this.gl.getExtension("OES_element_index_uint");
      var save = this.startDrawing();
      this.initSphereGL();
      Object.keys(this.scene.objects).forEach(function(key){
        self.initObj(parseInt(key, 10));
        });
      this.stopDrawing(save);
      return this.gl;
    };

    /**
     * Resize the display to match element
     * @param { Object } el - DOM element to match
     */
    rglwidgetClass.prototype.resize = function(el) {
      this.canvas.width = el.width;
      this.canvas.height = el.height;
    };

    /**
     * Draw the whole scene
     */
    rglwidgetClass.prototype.drawScene = function() {
      var gl = this.gl || this.initGL(),
          wasDrawing = this.startDrawing();
      if (!wasDrawing) {
        if (this.select.state !== "inactive")
          this.selectionChanged();
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearDepth(1.0);
        gl.clearColor(1,1,1,1);
        gl.depthMask(true); // Must be true before clearing depth buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.drawSubscene(this.scene.rootSubscene, true);
        this.drawSubscene(this.scene.rootSubscene, false);
      }
      this.stopDrawing(wasDrawing);
    };

    /**
     * Change the displayed subset
     * @param { Object } el - Element of the control; not used.
     * @param { Object } control - The subset control data.
     */
    rglwidgetClass.prototype.subsetSetter = function(el, control) {
      if (typeof control.subscenes === "undefined" ||
          control.subscenes === null)
        control.subscenes = this.scene.rootSubscene;
      var value = Math.round(control.value),
          subscenes = [].concat(control.subscenes),
          fullset = [].concat(control.fullset),
          i, j, entries, subsceneid,
          adds = [], deletes = [],
          ismissing = function(x) {
            return fullset.indexOf(x) < 0;
          },
          tointeger = function(x) {
            return parseInt(x, 10);
          };
      if (isNaN(value))
        value = control.value = 0;
      if (control.accumulate)
        for (i=0; i <= value; i++)
          adds = adds.concat(control.subsets[i]);
      else
        adds = adds.concat(control.subsets[value]);
      deletes = fullset.filter(function(x) { return adds.indexOf(x) < 0; });
      for (i = 0; i < subscenes.length; i++) {
        subsceneid = subscenes[i];
        if (typeof this.getObj(subsceneid) === "undefined")
          this.alertOnce("typeof object is undefined");
        for (j = 0; j < adds.length; j++)
          this.addToSubscene(adds[j], subsceneid);
        for (j = 0; j < deletes.length; j++)
          this.delFromSubscene(deletes[j], subsceneid);
      }
    };

    /**
     * Change the requested property
     * @param { Object } el - Element of the control; not used.
     * @param { Object } control - The property setter control data.
     */
    rglwidgetClass.prototype.propertySetter = function(el, control)  {
      var value = control.value,
          values = [].concat(control.values),
          svals = [].concat(control.param),
          direct = values[0] === null,
          entries = [].concat(control.entries),
          ncol = entries.length,
          nrow = values.length/ncol,
          properties = this.repeatToLen(control.properties, ncol),
          objids = this.repeatToLen(control.objids, ncol),
          property, objid = objids[0],
          obj = this.getObj(objid),
          propvals, i, v1, v2, p, entry, gl, needsBinding,
          newprop, newid,

          getPropvals = function() {
            if (property === "userMatrix")
              return obj.par3d.userMatrix.getAsArray();
            else if (property === "scale" || property === "FOV" || property === "zoom")
              return [].concat(obj.par3d[property]);
            else
              return [].concat(obj[property]);
          };

          putPropvals = function(newvals) {
            if (newvals.length == 1)
              newvals = newvals[0];
            if (property === "userMatrix")
              obj.par3d.userMatrix.load(newvals);
            else if (property === "scale" || property === "FOV" || property === "zoom")
              obj.par3d[property] = newvals;
            else
              obj[property] = newvals;
          };

      if (direct && typeof value === "undefined")
        return;

      if (control.interp) {
        values = values.slice(0, ncol).concat(values).
                 concat(values.slice(ncol*(nrow-1), ncol*nrow));
        svals = [-Infinity].concat(svals).concat(Infinity);
        for (i = 1; i < svals.length; i++) {
          if (value <= svals[i]) {
            if (svals[i] === Infinity)
              p = 1;
            else
              p = (svals[i] - value)/(svals[i] - svals[i-1]);
            break;
          }
        }
      } else if (!direct) {
        value = Math.round(value);
      }

      for (j=0; j<entries.length; j++) {
        entry = entries[j];
        newprop = properties[j];
        newid = objids[j];

        if (newprop !== property || newid != objid) {
          if (typeof property !== "undefined")
            putPropvals(propvals);
          property = newprop;
          objid = newid;
          obj = this.getObj(objid);
          propvals = getPropvals();
        }
        if (control.interp) {
          v1 = values[ncol*(i-1) + j];
          v2 = values[ncol*i + j];
          this.setElement(propvals, entry, p*v1 + (1-p)*v2);
        } else if (!direct) {
          this.setElement(propvals, entry, values[ncol*value + j]);
        } else {
          this.setElement(propvals, entry, value[j]);
        }
      }
      putPropvals(propvals);

      needsBinding = [];
      for (j=0; j < entries.length; j++) {
        if (properties[j] === "values" &&
            needsBinding.indexOf(objids[j]) === -1) {
          needsBinding.push(objids[j]);
        }
      }
      for (j=0; j < needsBinding.length; j++) {
        gl = this.gl || this.initGL();
        obj = this.getObj(needsBinding[j]);
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buf);
        gl.bufferData(gl.ARRAY_BUFFER, obj.values, gl.STATIC_DRAW);
      }
    };

    /**
     * Change the requested vertices
     * @param { Object } el - Element of the control; not used.
     * @param { Object } control - The vertext setter control data.
     */
    rglwidgetClass.prototype.vertexSetter = function(el, control)  {
      var svals = [].concat(control.param),
          j, k, p, a, propvals, stride, ofs, obj, entry,
          attrib,
          ofss    = {x:"vofs", y:"vofs", z:"vofs",
                     red:"cofs", green:"cofs", blue:"cofs",
                     alpha:"cofs", radii:"radofs",
                     nx:"nofs", ny:"nofs", nz:"nofs",
                     ox:"oofs", oy:"oofs", oz:"oofs",
                     ts:"tofs", tt:"tofs"},
          pos     = {x:0, y:1, z:2,
                     red:0, green:1, blue:2,
                     alpha:3,radii:0,
                     nx:0, ny:1, nz:2,
                     ox:0, oy:1, oz:2,
                     ts:0, tt:1},
        values = control.values,
        direct = values === null,
        ncol,
        interp = control.interp,
        vertices = [].concat(control.vertices),
        attributes = [].concat(control.attributes),
        value = control.value, newval, aliases, alias;

      ncol = Math.max(vertices.length, attributes.length);

      if (!ncol)
        return;

      vertices = this.repeatToLen(vertices, ncol);
      attributes = this.repeatToLen(attributes, ncol);

      if (direct)
        interp = false;

      /* JSON doesn't pass Infinity */
      svals[0] = -Infinity;
      svals[svals.length - 1] = Infinity;

      for (j = 1; j < svals.length; j++) {
        if (value <= svals[j]) {
          if (interp) {
            if (svals[j] === Infinity)
              p = 1;
            else
              p = (svals[j] - value)/(svals[j] - svals[j-1]);
          } else {
            if (svals[j] - value > value - svals[j-1])
              j = j - 1;
          }
          break;
        }
      }

      obj = this.getObj(control.objid);
      // First, make sure color attributes vary in original
      if (typeof obj.vOffsets !== "undefined") {
      	varies = true;
        for (k = 0; k < ncol; k++) {
          attrib = attributes[k];
          if (typeof attrib !== "undefined") {
            ofs = obj.vOffsets[ofss[attrib]];
            if (ofs < 0) {
              switch(attrib) {
              	case "alpha":
              	case "red":
              	case "green":
              	case "blue":
              	  obj.colors = [obj.colors[0], obj.colors[0]];
              	  break;
              }
              varies = false;
            }
          }
        }
        if (!varies)
          this.initObj(control.objid);
      }
      propvals = obj.values;
      aliases = obj.alias;
      if (typeof aliases === "undefined")
        aliases = [];
      for (k=0; k<ncol; k++) {
        if (direct) {
          newval = value;
        } else if (interp) {
          newval = p*values[j-1][k] + (1-p)*values[j][k];
        } else {
          newval = values[j][k];
        }      	
        attrib = attributes[k];
        vertex = vertices[k];
        alias = aliases[vertex];
        if (obj.type === "planes" || obj.type === "clipplanes") {
          ofs = ["nx", "ny", "nz", "offset"].indexOf(attrib);
          if (ofs >= 0) {
            if (ofs < 3) {
              if (obj.normals[vertex][ofs] != newval) {  // Assume no aliases here...
              	obj.normals[vertex][ofs] = newval;
              	obj.initialized = false;
              }
            } else {
              if (obj.offsets[vertex][0] != newval) {
              	obj.offsets[vertex][0] = newval;
              	obj.initialized = false;
              }
            }
            continue;
          }
        }
        // Not a plane setting...
        ofs = obj.vOffsets[ofss[attrib]];
        if (ofs < 0)
          this.alertOnce("Attribute '"+attrib+"' not found in object "+control.objid);
        else {
          stride = obj.vOffsets.stride;
          ofs = ofs + pos[attrib];
          entry = vertex*stride + ofs;
          propvals[entry] = newval;
          if (typeof alias !== "undefined")
            for (a = 0; a < alias.length; a++)
              propvals[alias[a]*stride + ofs] = newval;
        }
      }
      if (typeof obj.buf !== "undefined") {
        var gl = this.gl || this.initGL();
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buf);
        gl.bufferData(gl.ARRAY_BUFFER, propvals, gl.STATIC_DRAW);
      }
    };

    /**
     * Change the requested vertex properties by age
     * @param { Object } el - Element of the control; not used.
     * @param { Object } control - The age setter control data.
     */
    rglwidgetClass.prototype.ageSetter = function(el, control) {
      var objids = [].concat(control.objids),
          nobjs = objids.length,
          time = control.value,
          births = [].concat(control.births),
          ages = [].concat(control.ages),
          steps = births.length,
          j = Array(steps),
          p = Array(steps),
          i, k, age, j0, propvals, stride, ofs, objid, obj,
          attrib, dim, varies, alias, aliases, a, d,
          attribs = ["colors", "alpha", "radii", "vertices",
                     "normals", "origins", "texcoords",
                     "x", "y", "z",
                     "red", "green", "blue"],
          ofss    = ["cofs", "cofs", "radofs", "vofs",
                     "nofs", "oofs", "tofs",
                     "vofs", "vofs", "vofs",
                     "cofs", "cofs", "cofs"],
          dims    = [3,1,1,3,
                     3,2,2,
                     1,1,1,
                     1,1,1],
          pos     = [0,3,0,0,
                     0,0,0,
                     0,1,2,
                     0,1,2];
      /* Infinity doesn't make it through JSON */
      ages[0] = -Infinity;
      ages[ages.length-1] = Infinity;
      for (i = 0; i < steps; i++) {
        if (births[i] !== null) {  // NA in R becomes null
          age = time - births[i];
          for (j0 = 1; age > ages[j0]; j0++);
          if (ages[j0] == Infinity)
            p[i] = 1;
          else if (ages[j0] > ages[j0-1])
            p[i] = (ages[j0] - age)/(ages[j0] - ages[j0-1]);
          else
            p[i] = 0;
          j[i] = j0;
        }
      }
      // First, make sure color attributes vary in original
      for (l = 0; l < nobjs; l++) {
      	objid = objids[l];
      	obj = this.getObj(objid);
      	varies = true;
        if (typeof obj.vOffsets === "undefined")
          continue;
        for (k = 0; k < attribs.length; k++) {
          attrib = control[attribs[k]];
          if (typeof attrib !== "undefined") {
            ofs = obj.vOffsets[ofss[k]];
            if (ofs < 0) {
              switch(attribs[k]) {
              	case "colors":
              	case "alpha":
              	case "red":
              	case "green":
              	case "blue":
              	  obj.colors = [obj.colors[0], obj.colors[0]];
              	  break;
              }
              varies = false;
            }
          }
        }
        if (!varies)
          this.initObj(objid);
      }
      for (l = 0; l < nobjs; l++) {
        objid = objids[l];
        obj = this.getObj(objid);
        if (typeof obj.vOffsets === "undefined")
          continue;
        aliases = obj.alias;
        if (typeof aliases === "undefined")
          aliases = [];
        propvals = obj.values;
        stride = obj.vOffsets.stride;
        for (k = 0; k < attribs.length; k++) {
          attrib = control[attribs[k]];
          if (typeof attrib !== "undefined") {
            ofs = obj.vOffsets[ofss[k]];
            if (ofs >= 0) {
              dim = dims[k];
              ofs = ofs + pos[k];
              for (i = 0; i < steps; i++) {
              	alias = aliases[i];
                if (births[i] !== null) {
                  for (d=0; d < dim; d++) {
                    propvals[i*stride + ofs + d] = p[i]*attrib[dim*(j[i]-1) + d] + (1-p[i])*attrib[dim*j[i] + d];
                    if (typeof alias !== "undefined")
                      for (a=0; a < alias.length; a++)
                        propvals[alias[a]*stride + ofs + d] = propvals[i*stride + ofs + d];
                  }
                }
              }
            } else
              this.alertOnce("\'"+attribs[k]+"\' property not found in object "+objid);
          }
        }
        obj.values = propvals;
        if (typeof obj.buf !== "undefined") {
          gl = this.gl || this.initGL();
          gl.bindBuffer(gl.ARRAY_BUFFER, obj.buf);
          gl.bufferData(gl.ARRAY_BUFFER, obj.values, gl.STATIC_DRAW);
        }
      }
    };

    /**
     * Bridge to old style control
     * @param { Object } el - Element of the control; not used.
     * @param { Object } control - The bridge control data.
     */
    rglwidgetClass.prototype.oldBridge = function(el, control) {
      var attrname, global = window[control.prefix + "rgl"];
      if (global)
        for (attrname in global)
          this[attrname] = global[attrname];
      window[control.prefix + "rgl"] = this;
    };

    /**
     * Set up a player control
     * @param { Object } el - The player control element
     * @param { Object } control - The player data.
     */
    rglwidgetClass.prototype.Player = function(el, control) {
      var
        self = this,
        components = [].concat(control.components),
        buttonLabels = [].concat(control.buttonLabels),

        Tick = function() { /* "this" will be a timer */
          var i,
              nominal = this.value,
              slider = this.Slider,
              labels = this.outputLabels,
              output = this.Output,
              step;
          if (typeof slider !== "undefined" && nominal != slider.value)
            slider.value = nominal;
          if (typeof output !== "undefined") {
            step = Math.round((nominal - output.sliderMin)/output.sliderStep);
            if (labels !== null) {
              output.innerHTML = labels[step];
            } else {
              step = step*output.sliderStep + output.sliderMin;
              output.innerHTML = step.toPrecision(output.outputPrecision);
            }
          }
          for (i=0; i < this.actions.length; i++) {
            this.actions[i].value = nominal;
          }
          self.applyControls(el, this.actions, false);
          self.drawScene();
        },

        OnSliderInput = function() { /* "this" will be the slider */
          this.rgltimer.value = Number(this.value);
          this.rgltimer.Tick();
        },

        addSlider = function(min, max, step, value) {
          var slider = document.createElement("input");
          slider.type = "range";
          slider.min = min;
          slider.max = max;
          slider.step = step;
          slider.value = value;
          slider.oninput = OnSliderInput;
          slider.sliderActions = control.actions;
          slider.sliderScene = this;
          slider.className = "rgl-slider";
          slider.id = el.id + "-slider";
          el.rgltimer.Slider = slider;
          slider.rgltimer = el.rgltimer;
          el.appendChild(slider);
        },

        addLabel = function(labels, min, step, precision) {
          var output = document.createElement("output");
          output.sliderMin = min;
          output.sliderStep = step;
          output.outputPrecision = precision;
          output.className = "rgl-label";
          output.id = el.id + "-label";
          el.rgltimer.Output = output;
          el.rgltimer.outputLabels = labels;
          el.appendChild(output);
        },

        addButton = function(which, label, active) {
          var button = document.createElement("input"),
              onclicks = {Reverse: function() { this.rgltimer.reverse();},
                    Play: function() { this.rgltimer.play();
                                       this.value = this.rgltimer.enabled ? this.inactiveValue : this.activeValue; },
                   Slower: function() { this.rgltimer.slower(); },
                   Faster: function() { this.rgltimer.faster(); },
                   Reset: function() { this.rgltimer.reset(); },
              	   Step:  function() { this.rgltimer.step(); }
              };
          button.rgltimer = el.rgltimer;
          button.type = "button";
          button.value = label;
          button.activeValue = label;
          button.inactiveValue = active;
          if (which === "Play")
            button.rgltimer.PlayButton = button;
          button.onclick = onclicks[which];
          button.className = "rgl-button";
          button.id = el.id + "-" + which;
          el.appendChild(button);
        };

        if (typeof control.reinit !== "undefined" && control.reinit !== null) {
          control.actions.reinit = control.reinit;
        }
        el.rgltimer = new rgltimerClass(Tick, control.start, control.interval, control.stop,
                                        control.step, control.value, control.rate, control.loop, control.actions);
        for (var i=0; i < components.length; i++) {
          switch(components[i]) {
            case "Slider": addSlider(control.start, control.stop,
                                   control.step, control.value);
              break;
            case "Label": addLabel(control.labels, control.start,
                                   control.step, control.precision);
              break;
            default:
              addButton(components[i], buttonLabels[i], control.pause);
          }
        }
        el.rgltimer.Tick();
    };

    /**
     * Apply all registered controls
     * @param { Object } el - DOM element of the control
     * @param { Object } x - List of actions to apply
     * @param { boolean } [draw=true] - Whether to redraw after applying
     */
    rglwidgetClass.prototype.applyControls = function(el, x, draw) {
      var self = this, reinit = x.reinit, i, control, type;
      for (i = 0; i < x.length; i++) {
        control = x[i];
        type = control.type;
        self[type](el, control);
      }
      if (typeof reinit !== "undefined" && reinit !== null) {
        reinit = [].concat(reinit);
        for (i = 0; i < reinit.length; i++)
          self.getObj(reinit[i]).initialized = false;
      }
      if (typeof draw === "undefined" || draw)
        self.drawScene();
    };

    /**
     * Handler for scene change
     * @param { Object } message - What sort of scene change to do?
     */
    rglwidgetClass.prototype.sceneChangeHandler = function(message) {
      var self = document.getElementById(message.elementId).rglinstance,
          objs = message.objects, mat = message.material,
          root = message.rootSubscene,
          initSubs = message.initSubscenes,
          redraw = message.redrawScene,
          skipRedraw = message.skipRedraw,
          deletes, subs, allsubs = [], i,j;
      if (typeof message.delete !== "undefined") {
        deletes = [].concat(message.delete);
        if (typeof message.delfromSubscenes !== "undefined")
          subs = [].concat(message.delfromSubscenes);
        else
          subs = [];
        for (i = 0; i < deletes.length; i++) {
          for (j = 0; j < subs.length; j++) {
            self.delFromSubscene(deletes[i], subs[j]);
          }
          delete self.scene.objects[deletes[i]];
        }
      }
      if (typeof objs !== "undefined") {
        Object.keys(objs).forEach(function(key){
          key = parseInt(key, 10);
          self.scene.objects[key] = objs[key];
          self.initObj(key);
          var obj = self.getObj(key),
              subs = [].concat(obj.inSubscenes), k;
          allsubs = allsubs.concat(subs);
          for (k = 0; k < subs.length; k++)
            self.addToSubscene(key, subs[k]);
        });
      }
      if (typeof mat !== "undefined") {
        self.scene.material = mat;
      }
      if (typeof root !== "undefined") {
        self.scene.rootSubscene = root;
      }
      if (typeof initSubs !== "undefined")
        allsubs = allsubs.concat(initSubs);
      allsubs = self.unique(allsubs);
      for (i = 0; i < allsubs.length; i++) {
        self.initSubscene(allsubs[i]);
      }
      if (typeof skipRedraw !== "undefined") {
        root = self.getObj(self.scene.rootSubscene);
        root.par3d.skipRedraw = skipRedraw;
      }
      if (redraw)
        self.drawScene();
    };
    
    /**
     * Set mouse mode for a subscene
     * @param { string } mode - name of mode
     * @param { number } button - button number (1 to 3)
     * @param { number } subscene - subscene id number
     * @param { number } stayActive - if truthy, don't clear brush
     */
    rglwidgetClass.prototype.setMouseMode = function(mode, button, subscene, stayActive) {
      var sub = this.getObj(subscene),
          which = ["left", "right", "middle"][button - 1];
      if (!stayActive && sub.par3d.mouseMode[which] === "selecting")
        this.clearBrush(null);
      sub.par3d.mouseMode[which] = mode;
    };

/**
 * The class of an rgl timer object
 * @class
*/

/**
 * Construct an rgltimerClass object
 * @constructor
 * @param { function } Tick - action when timer fires
 * @param { number } startTime - nominal start time in seconds
 * @param { number } interval - seconds between updates
 * @param { number } stopTime - nominal stop time in seconds
 * @param { number } stepSize - nominal step size
 * @param { number } value - current nominal time
 * @param { number } rate - nominal units per second
 * @param { string } loop - "none", "cycle" or "oscillate"
 * @param { Object } actions - list of actions
 */
rgltimerClass = function(Tick, startTime, interval, stopTime, stepSize, value, rate, loop, actions) {
  this.enabled = false;
  this.timerId = 0;
  /** nominal start time in seconds */
  this.startTime = startTime;   
  /** current nominal time */      
  this.value = value;
  /** seconds between updates */                 
  this.interval = interval;
  /** nominal stop time */           
  this.stopTime = stopTime;
  /** nominal step size */           
  this.stepSize = stepSize;
  /** nominal units per second */           
  this.rate = rate;
  /** "none", "cycle", or "oscillate" */                   
  this.loop = loop;
  /** real world start time */                   
  this.realStart = undefined;
  /** multiplier for fast-forward or reverse */         
  this.multiplier = 1;                
  this.actions = actions;
  this.Tick = Tick;
};

  /**
   * Start playing timer object
   */
  rgltimerClass.prototype.play = function() {
    if (this.enabled) {
      this.enabled = false;
      window.clearInterval(this.timerId);
      this.timerId = 0;
      return;
    }
    var tick = function(self) {
      var now = new Date();
      self.value = self.multiplier*self.rate*(now - self.realStart)/1000 + self.startTime;
      self.forceToRange();
      if (typeof self.Tick !== "undefined") {
        self.Tick(self.value);
      }

    };
    this.realStart = new Date() - 1000*(this.value - this.startTime)/this.rate/this.multiplier;
    this.timerId = window.setInterval(tick, 1000*this.interval, this);
    this.enabled = true;
  };

  /**
   * Force value into legal range
   */
  rgltimerClass.prototype.forceToRange = function() {
    if (this.value > this.stopTime + this.stepSize/2 || this.value < this.startTime - this.stepSize/2) {
      if (!this.loop) {
        this.reset();
      } else {
        var cycle = this.stopTime - this.startTime + this.stepSize,
            newval = (this.value - this.startTime) % cycle + this.startTime;
        if (newval < this.startTime) {
          newval += cycle;
        }
        this.realStart += (this.value - newval)*1000/this.multiplier/this.rate;
        this.value = newval;
      }
    }
  };

  /**
   * Reset to start values
   */
  rgltimerClass.prototype.reset = function() {
    this.value = this.startTime;
    this.newmultiplier(1);
    if (typeof this.Tick !== "undefined") {
        this.Tick(this.value);
    }
    if (this.enabled)
      this.play();  /* really pause... */
    if (typeof this.PlayButton !== "undefined")
      this.PlayButton.value = "Play";
  };

  /**
   * Increase the multiplier to play faster
   */
  rgltimerClass.prototype.faster = function() {
    this.newmultiplier(Math.SQRT2*this.multiplier);
  };

  /**
   * Decrease the multiplier to play slower
   */
  rgltimerClass.prototype.slower = function() {
    this.newmultiplier(this.multiplier/Math.SQRT2);
  };

  /**
   * Change sign of multiplier to reverse direction
   */
  rgltimerClass.prototype.reverse = function() {
    this.newmultiplier(-this.multiplier);
  };

  /**
   * Set multiplier for play speed
   * @param { number } newmult - new value
   */
  rgltimerClass.prototype.newmultiplier = function(newmult) {
    if (newmult != this.multiplier) {
      this.realStart += 1000*(this.value - this.startTime)/this.rate*(1/this.multiplier - 1/newmult);
      this.multiplier = newmult;
    }
  };

  /**
   * Take one step
   */
  rgltimerClass.prototype.step = function() {
    this.value += this.rate*this.multiplier;
    this.forceToRange();
    if (typeof this.Tick !== "undefined")
      this.Tick(this.value);
  };
