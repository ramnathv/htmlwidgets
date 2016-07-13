// Add shim for Function.prototype.bind() from:
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind#Compatibility
// for fix some RStudio viewer bug (Desktop / windows)
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
    
    var aArgs = Array.prototype.slice.call(arguments, 1),
    fToBind = this,
    fNOP = function () {},
    fBound = function () {
      return fToBind.apply(this instanceof fNOP && oThis
                           ? this
                           : oThis,
                           aArgs.concat(Array.prototype.slice.call(arguments)));
    };
    
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    
    return fBound;
  };
}

//--------------------------------------------
// functions to reset edges after hard to read
//--------------------------------------------

// for edges
function resetEdges(edges){
  var edgesHardToRead = edges.get({
    fields: ['id', 'color'],
    filter: function (item) {
      return item.color === 'rgba(200,200,200,0.5)';
    },
    returnType :'Array'
  });
            
  // all in degree nodes get their own color and their label back
  for (i = 0; i < edgesHardToRead.length; i++) {
      edgesHardToRead[i].color = null;
  }
  edges.update(edgesHardToRead);
}

//--------------------------------------------
// functions to reset nodes after hard to read
//--------------------------------------------

// for classic node
function simpleResetNode(node){
  // get back color
  if (node.hiddenColor !== undefined) {
    node.color = node.hiddenColor;
    node.hiddenColor = undefined;
  }else{
    node.color = undefined;
  }
}

// for icon node
function simpleIconResetNode(node, group_color){
  if(node.iconDefined){ // icon defined in individual node data
    if (node.hiddenColor !== undefined) {
      node.icon.color = node.hiddenColor;
      node.hiddenColor = undefined;
    } else {
	  // but color in group
      if(group_color){
        delete node.icon.color;
      }else{ // else set default color
        node.icon.color = "#2B7CE9";
      }
    }
  }else{ 
  // just a group definition, so delete individual information
    delete node.icon;
  }
  // get back color
  if (node.hiddenColorForLabel !== undefined) {
    node.color = node.hiddenColorForLabel;
    node.hiddenColorForLabel = undefined;
  }else{
    node.color = undefined;
  }
}

// for image node
function simpleImageResetNode(node, type){
  // get back color
  if (node.hiddenColor !== undefined) {
    node.color = node.hiddenColor;
    node.hiddenColor = undefined;
  }else{
    node.color = undefined;
  }
  // and set shape as image/circularImage
  node.shape = type;
}

// Global function to reset one node
function resetOneNode(node, groups, options){
  if(node.isHardToRead !== undefined){ // we have to reset this node
    if(node.isHardToRead){
      var final_shape;
      var shape_group = false;
      var is_group = false;
	  // have a group information & a shape defined in group ?
      if(node.group !== undefined){
        if(groups.groups[node.group] !== undefined){
          is_group = true;
          if(groups.groups[node.group].shape !== undefined){
            shape_group = true;
          }
        }
      }
      // have a global shape in nodes options ?
      var shape_options = false;
      if(options.nodes !== undefined){
        if(options.nodes.shape !== undefined){
          shape_options = true;
        }
      }
      // set final shape (individual > group > global)
      if(node.hiddenImage !== undefined){
        final_shape = node.hiddenImage;
      } else if(node.shape !== undefined){
        final_shape = node.shape;
      } else if(shape_group){
        final_shape = groups.groups[node.group].shape;
      } else if(shape_options){
        final_shape = options.nodes.shape;
      }
      // and call good reset function
      if(final_shape === "icon"){
        group_color = false;
        if(is_group){ // have icon color in group ?
          if(groups.groups[node.group].icon){
            if(groups.groups[node.group].icon.color){
              group_color = true;
            }
          }
        }
        simpleIconResetNode(node, group_color);
      } else if(final_shape === "image"){
        simpleImageResetNode(node, "image");
      } else if(final_shape === "circularImage"){
        simpleImageResetNode(node, "circularImage");
      } else {
        simpleResetNode(node);
      }
	  // finally, get back label
      if (node.hiddenLabel !== undefined) {
        node.label = node.hiddenLabel;
        node.hiddenLabel = undefined;
      }
      node.isHardToRead = false;
    }
  }
}

// Global function to reset all node
function resetAllNodes(allNodes, update, nodes, groups, options){
  var updateArray = [];
  for (var nodeId in allNodes) {
    resetOneNode(allNodes[nodeId], groups, options);
	// reset coordinates
    allNodes[nodeId].x = undefined;
    allNodes[nodeId].y = undefined;
    if (allNodes.hasOwnProperty(nodeId) && update) {
      updateArray.push(allNodes[nodeId]);
    }
  }
  if(update){
    nodes.update(updateArray);
  }
}

//--------------------------------------------
// functions to set nodes as hard to read
//--------------------------------------------

// for classic node
function simpleNodeAsHardToRead(node){
  // saving color information (if we have)
  if (node.hiddenColor === undefined & node.color !== 'rgba(200,200,200,0.5)') {
    node.hiddenColor = node.color;
  }
  // set "hard to read" color
  node.color = 'rgba(200,200,200,0.5)';
  // reset and save label
  if (node.hiddenLabel === undefined) {
    node.hiddenLabel = node.label;
    node.label = undefined;
  }
}

// for icon node
function iconsNodeAsHardToRead(node){
  // individual information
  if(node.icon !== undefined){
    node.iconDefined = true;
	// saving color information (if we have)
    if (node.hiddenColor === undefined & node.icon.color !== 'rgba(200,200,200,0.5)') {
      node.hiddenColor = node.icon.color;
    }
  } else { // information in group : have to as individual
    node.icon = {};
    node.iconDefined = false;
  }
  // set "hard to read" color
  node.icon.color = 'rgba(200,200,200,0.5)';
  // for edges....saving color information (if we have)
  if (node.hiddenColorForLabel === undefined & node.color !== 'rgba(200,200,200,0.5)') {
    node.hiddenColorForLabel = node.color;
  }
  // set "hard to read" color
  node.color = 'rgba(200,200,200,0.5)';
  // reset and save label
  if (node.hiddenLabel === undefined) {
    node.hiddenLabel = node.label;
    node.label = undefined;
  }
}

// for image node
function imageNodeAsHardToRead(node, type){
  // saving color information (if we have)
  if (node.hiddenColor === undefined & node.color !== 'rgba(200,200,200,0.5)') {
    node.hiddenColor = node.color;
  }
  // set "hard to read" color
  node.color = 'rgba(200,200,200,0.5)';
  // reset and save label
  if (node.hiddenLabel === undefined) {
    node.hiddenLabel = node.label;
    node.label = undefined;
  }
  // keep shape information, and set a new
  if(type === "image"){
    node.hiddenImage = type;
    node.shape = "square";
  }else if(type === "circularImage"){
    node.hiddenImage = type;
    node.shape = "dot";
  }
}

// Global function to set one node as hard to read
function nodeAsHardToRead(node, groups, options){
  var final_shape;
  var shape_group = false;
  // have a group information & a shape defined in group ?
  if(node.group !== undefined){
    if(groups.groups[node.group] !== undefined){
      if(groups.groups[node.group].shape !== undefined){
        shape_group = true;
      }
    }
  }
  // have a group information & a shape defined in group ?
  var shape_options = false;
  if(options.nodes !== undefined){
    if(options.nodes.shape !== undefined){
      shape_options = true;
    }
  }
  // set final shape (individual > group > global)
  if(node.shape !== undefined){
    final_shape = node.shape;
  } else if(shape_group){
    final_shape = groups.groups[node.group].shape;
  } else if(shape_options){
    final_shape = options.nodes.shape;
  }
  // and call good function
  if(final_shape === "icon"){
    iconsNodeAsHardToRead(node);
  } else if(final_shape === "image"){
    imageNodeAsHardToRead(node, "image");
  } else if(final_shape === "circularImage"){
    imageNodeAsHardToRead(node, "circularImage");
  } else {
    simpleNodeAsHardToRead(node);
  }
  // finally set isHardToRead
  node.isHardToRead = true;
}

//----------------------------------------------------------------
// Revrite HTMLWidgets.dataframeToD3() for passing custom
// properties directly in data.frame (color.background for example
//----------------------------------------------------------------
function visNetworkdataframeToD3(df, type) {

  // variables we have specially to control
  var nodesctrl = ["color", "fixed", "font", "icon", "shadow", "scaling", "shapeProperties"];
  var edgesctrl = ["color", "font", "arrows", "shadow", "smooth", "scaling"];
  
  var names = [];
  var colnames = [];
  var length;
  var toctrl;
  var ctrlname;
  
  for (var name in df) {
    if (df.hasOwnProperty(name))
      colnames.push(name);
      ctrlname = name.split(".");
      if(ctrlname.length === 1){
        names.push( new Array(name));
      } else {
        if(type === "nodes"){
         toctrl = indexOf.call(nodesctrl, ctrlname[0], true);
        } else if(type === "edges"){
         toctrl = indexOf.call(edgesctrl, ctrlname[0], true);
        }
        if(toctrl > -1){
          names.push(ctrlname);
        } else {
          names.push(new Array(name));
        }
      }
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
        if(df[colnames[col]][row] !== null){
          if(names[col].length === 1){
            item[names[col]] = df[colnames[col]][row];
          } else if(names[col].length === 2){
            if(item[names[col][0]] === undefined){
              item[names[col][0]] = {};
            }
            if(names[col][0] === "icon" && names[col][1] === "code"){
              item[names[col][0]][names[col][1]] = JSON.parse( '"'+'\\u' + df[colnames[col]][row] + '"');
            } else if(names[col][0] === "icon" && names[col][1] === "color"){
              item.color = df[colnames[col]][row];
              item[names[col][0]][names[col][1]] = df[colnames[col]][row];
            } else{
              item[names[col][0]][names[col][1]] = df[colnames[col]][row];
            }
          } else if(names[col].length === 3){
            if(item[names[col][0]] === undefined){
              item[names[col][0]] = {};
            }
            if(item[names[col][0]][names[col][1]] === undefined){
              item[names[col][0]][names[col][1]] = {};
            }
            item[names[col][0]][names[col][1]][names[col][2]] = df[colnames[col]][row];
          } else if(names[col].length === 4){
            if(item[names[col][0]] === undefined){
              item[names[col][0]] = {};
            }
            if(item[names[col][0]][names[col][1]] === undefined){
              item[names[col][0]][names[col][1]] = {};
            }
            if(item[names[col][0]][names[col][1]][names[col][2]] === undefined){
              item[names[col][0]][names[col][1]][names[col][2]] = {};
            }
            item[names[col][0]][names[col][1]][names[col][2]][names[col][3]] = df[colnames[col]][row];
          }
        }
      }
      results.push(item);
    }
  return results;
}
 
//----------------------------------------------------------------
// Some utils functions
//---------------------------------------------------------------- 
// clone an object
function clone(obj) {
    if(obj === null || typeof(obj) != 'object')
        return obj;    
    var temp = new obj.constructor(); 
    for(var key in obj)
        temp[key] = clone(obj[key]);    
    return temp;
}
// update a list
function update(source, target) {
	Object.keys(target).forEach(function (k) {
		if (typeof target[k] === 'object') {
			source[k] = source[k] || {};
			update(source[k], target[k]);
		} else {
			source[k] = target[k];
		}
	});
}
// for find element
function indexOf(needle, str) {
        indexOf = function(needle, str) {
            var i = -1, index = -1;
            if(str){
                  needle = ''+needle;
            }
            for(i = 0; i < this.length; i++) {
                var val = this[i];
                if(str){
                  val = ''+val;
                }
                if(val === needle) {
                    index = i;
                    break;
                }
            }
            return index;
        };
    return indexOf.call(this, needle, str);
};
// reset a html list
function resetList(list_name, id, shiny_input_name) {
  var list = document.getElementById(list_name + id);
  list.value = "";
  if (window.Shiny){
    Shiny.onInputChange(id + '_' + shiny_input_name, "");
  }
}

//----------------------------------------------------------------
// All available functions/methods with visNetworkProxy
//--------------------------------------------------------------- 
if (HTMLWidgets.shinyMode){
  

  // event method
  Shiny.addCustomMessageHandler('visShinyEvents', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      if(el){
        var network = el.chart;
        
        if(data.type === "once"){
          for (var key in data.events) {
            eval('network.once("' + key + '",' + data.events[key] + ')');
          }
        } else if(data.type === "on"){
          for (var key in data.events) {
            eval('network.on("' + key + '",' + data.events[key] + ')');
          }
        } else if(data.type === "off"){
          for (var key in data.events) {
            eval('network.off("' + key + '")');
          }
        }
      }
  });
  
  // moveNode method
  Shiny.addCustomMessageHandler('visShinyMoveNode', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      if(el){
        var network = el.chart;
        network.moveNode(data.nodeId, data.x, data.y);
      }
  });
  
  // unselectAll method
  Shiny.addCustomMessageHandler('visShinyUnselectAll', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      if(el){
        var network = el.chart;
        network.unselectAll();
      }
  });
  
  // updateOptions in the network
  Shiny.addCustomMessageHandler('visShinyOptions', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      if(el){
        var network = el.chart;
        var options = el.options;
        update(options, data.options);
        network.setOptions(options);
      }
  });
  
  // setData the network
  Shiny.addCustomMessageHandler('visShinySetData', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      if(el){
        var network = el.chart;
        var newnodes = new vis.DataSet();
        var newedges = new vis.DataSet();
		
        newnodes.add(visNetworkdataframeToD3(data.nodes, "nodes"));
        newedges.add(visNetworkdataframeToD3(data.edges, "edges"));
        var newdata = {
          nodes: newnodes,
          edges: newedges
        };
        network.setData(newdata);
      }
  });
  
  // fit to a specific node
  Shiny.addCustomMessageHandler('visShinyFit', function(data){
    // get container id
    var el = document.getElementById("graph"+data.id);
    if(el){
        var network = el.chart;
        network.fit(data.options);
      }
  });
  
  // focus on a node in the network
  Shiny.addCustomMessageHandler('visShinyFocus', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      if(el){
        var network = el.chart;
        network.focus(data.focusId, data.options);
      }
  });
  
  // stabilize the network
  Shiny.addCustomMessageHandler('visShinyStabilize', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      if(el){
        var network = el.chart;
        network.stabilize(data.options);
      }
  });
  
  // startSimulation on network
  Shiny.addCustomMessageHandler('visShinyStartSimulation', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      if(el){
        var network = el.chart;
        network.startSimulation();
      }
  });
  
  // stopSimulation on network
  Shiny.addCustomMessageHandler('visShinyStopSimulation', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      if(el){
        var network = el.chart;
        network.stopSimulation();
      }
  });
  
  // get positions of the network
  Shiny.addCustomMessageHandler('visShinyGetPositions', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      if(el){
        var network = el.chart;
        var pos;
        
        if(data.nodes !== undefined){
          pos = network.getPositions(data.nodes);
        }else{
          pos = network.getPositions();
        }
		// return positions in shiny
        Shiny.onInputChange(data.input, pos);
      }
  });
  
  // Redraw the network
  Shiny.addCustomMessageHandler('visShinyRedraw', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      if(el){
        var network = el.chart;
        network.redraw();
      }
  });
  
  // udpate nodes data
  Shiny.addCustomMessageHandler('visShinyUpdateNodes', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      var main_el = document.getElementById(data.id);
      
      if(el){
        // get & transform nodes object
        var tmpnodes = visNetworkdataframeToD3(data.nodes, "nodes");
        
        // reset some parameters / data before
        if (main_el.selectActive === true | main_el.highlightActive === true) {
          //reset nodes
          var allNodes = el.nodes.get({returnType:"Object"});
          resetAllNodes(allNodes, true, el.nodes, el.chart.groups, el.options);
          
          if (main_el.selectActive === true){
            main_el.selectActive = false;
            resetList('selectedBy', data.id, 'selectedBy');
          }
          if (main_el.highlightActive === true){
            main_el.highlightActive = false;
            resetList('nodeSelect', data.id, 'selected');
          }
        }
        // update nodes
        el.nodes.update(tmpnodes);
        main_el.updateNodes = true;
      }
  });

  // udpate edges data
  Shiny.addCustomMessageHandler('visShinyUpdateEdges', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      if(el){
        // get edges object
        var tmpedges = visNetworkdataframeToD3(data.edges, "edges");
        el.edges.update(tmpedges);
      }
  });
  
  // remove nodes
  Shiny.addCustomMessageHandler('visShinyRemoveNodes', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      var main_el = document.getElementById(data.id);
      if(el){
        // reset some parameters / date before
        if (main_el.selectActive === true | main_el.highlightActive === true) {
          //reset nodes
          var allNodes = el.nodes.get({returnType:"Object"});
          resetAllNodes(allNodes, true, el.nodes, el.chart.groups, el.options);
          
          if (main_el.selectActive === true){
            main_el.selectActive = false;
            resetList('selectedBy', data.id, 'selectedBy');
          }
          if (main_el.highlightActive === true){
            main_el.highlightActive = false;
            resetList('nodeSelect', data.id, 'selected');
          }
        }
        // remove nodes
        el.nodes.remove(data.rmid);
        main_el.updateNodes = true;
      }
  });
  
  // remove edges
  Shiny.addCustomMessageHandler('visShinyRemoveEdges', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      if(el){
        el.edges.remove(data.rmid);
      }
  });
  
  // select nodes
  Shiny.addCustomMessageHandler('visShinySelectNodes', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      if(el){
        var network = el.chart;
        if(data.selid !== null){
          network.selectNodes(data.selid, data.highlightEdges);
          if(data.clickEvent){
            el.myclick({nodes : data.selid});
          }
        }else{
          if(data.clickEvent){
            el.myclick({nodes : []});
          }
        }
      }
  });
  
  // select edges
  Shiny.addCustomMessageHandler('visShinySelectEdges', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      if(el){
        var network = el.chart;
        if(data.selid !== null){
          network.selectEdges(data.selid);
        }
      }
  });
  
  // set selection
  Shiny.addCustomMessageHandler('visShinySetSelection', function(data){
      // get container id
      var el = document.getElementById("graph"+data.id);
      if(el){
        var network = el.chart;
        if(data.selection.nodes !== null || data.selection.edges !== null){
          network.setSelection(data.selection, data.options);
        }
        if(data.clickEvent){
          if(data.selection.nodes !== null){
            el.myclick({nodes : data.selection.nodes});
          } else {
           el.myclick({nodes : []}); 
          }
        }
      }
  });
  
  Shiny.addCustomMessageHandler('visShinyCustomOptions', function(data){
        // get container id
        var graph = document.getElementById("graph"+data.id);
        var el = document.getElementById(data.id);
        var do_loop_by = false;
        var do_loop_id = false;
        var option;
        var option2;
        var selectList2;
        var selectList;
        var reset = false;
        
        if(graph){

          if(data.options.highlight !== undefined){
            if(document.getElementById(el.id).highlight && !data.options.highlight.enabled){
              // need reset nodes
              if(document.getElementById(el.id).highlightActive === true){
                reset = true;
              }
            }
            document.getElementById(el.id).highlight = data.options.highlight.enabled;
            document.getElementById(el.id).degree = data.options.highlight.degree;
            document.getElementById(el.id).hoverNearest = data.options.highlight.hoverNearest;
            document.getElementById(el.id).highlightAlgorithm = data.options.highlight.algorithm;
          }

          // init selection
          if(data.options.byselection !== undefined){
            if(data.options.byselection.selected !== undefined){
              document.getElementById("selectedBy"+data.id).value = data.options.byselection.selected;
              document.getElementById("selectedBy"+data.id).onchange();
            }
          }
          
          if(data.options.idselection !== undefined){
            if(data.options.idselection.enabled === true && data.options.idselection.selected !== undefined){
              //console.info(data.options.idselection)
              //console.info("ok")
              document.getElementById("nodeSelect"+data.id).value = data.options.idselection.selected;
              document.getElementById("nodeSelect"+data.id).onchange();
            }
          }
          
          if(reset){
            //console.info("reset nodes");
            document.getElementById("nodeSelect"+data.id).value = "";
            document.getElementById("nodeSelect"+data.id).onchange();
          }
          
          el.updateNodes = true;
          
          if(data.options.byselection !== undefined){
            selectList2 = document.getElementById("selectedBy"+data.id)
            selectList2.options.length = 0;
            if(data.options.byselection.enabled === true){
              option2 = document.createElement("option");
              option2.value = "";
              option2.text = "Select by " + data.options.byselection.variable;
              selectList2.appendChild(option2);
      
              if(data.options.byselection.values !== undefined){
                for (var i = 0; i < data.options.byselection.values.length; i++) {
                  option2 = document.createElement("option");
                  option2.value = data.options.byselection.values[i];
                  option2.text = data.options.byselection.values[i];
                  selectList2.appendChild(option2);
                }
              }else{
                do_loop_by = true;
              }

              el.byselection_variable = data.options.byselection.variable;
              el.byselection_multiple = data.options.byselection.multiple;
              selectList2.style.display = 'inline';
              selectList2.setAttribute('style', data.options.byselection.style);
              el.byselection = true;
            } else {
              selectList2.style.display = 'none';
              el.byselection = false;
              // reset selection
              if(el.selectActive === true){
                document.getElementById("selectedBy"+data.id).value = "";
                document.getElementById("selectedBy"+data.id).onchange();
              }
            }
          }else{
            // reset selection
            if(el.selectActive === true){
              document.getElementById("selectedBy"+data.id).value = "";
              document.getElementById("selectedBy"+data.id).onchange();
            }
          }
          
          if(data.options.idselection !== undefined){
            selectList = document.getElementById("nodeSelect"+data.id)
            selectList.options.length = 0;
            if(data.options.idselection.enabled === true){
              option = document.createElement("option");
              option.value = "";
              option.text = "Select by id";
              selectList.appendChild(option);
              selectList.style.display = 'inline';
              selectList.setAttribute('style', data.options.idselection.style);
              el.idselection = true;
              do_loop_id = true;
            } else {
              selectList.style.display = 'none';
              el.idselection = false;
            }
          }
          
          if(do_loop_by || do_loop_id){
              var allNodes = graph.nodes.get({returnType:"Object"});
              var byselection_values = [];
              for (var nodeId in allNodes) {
                if(do_loop_by){
                  var current_sel_value = allNodes[nodeId][data.options.byselection.variable];
                  if(data.options.byselection.multiple){
                    current_sel_value = current_sel_value.split(",").map(Function.prototype.call, String.prototype.trim);
                  }else{
                    current_sel_value = [current_sel_value];
                  }
                  for(var ind_c in current_sel_value){
                    if(indexOf.call(byselection_values, current_sel_value[ind_c], false) === -1){
                      option2 = document.createElement("option");
                      option2.value = current_sel_value[ind_c];
                      option2.text = current_sel_value[ind_c];
                      selectList2.appendChild(option2);
                      byselection_values.push(current_sel_value[ind_c]);
                    }
                  }
                }
                if(do_loop_id){
                  var addid = true;
                  if(data.options.idselection.values !== undefined){
                    if(indexOf.call(data.options.idselection.values, allNodes[nodeId].id, false) === -1){
                      addid = false;
                    }
                  }
                  if(addid){
                    option = document.createElement("option");
                    option.value = allNodes[nodeId].id;
                  if(allNodes[nodeId].label){
                    option.text = allNodes[nodeId].label;
                  }else{
                    option.text = allNodes[nodeId].id;
                  }
                  selectList.appendChild(option);
                  }
                }
              } 
          }
        }
      });
}

//----------------------------------------------------------------
// HTMLWidgets.widget Definition
//--------------------------------------------------------------- 
HTMLWidgets.widget({
  
  name: 'visNetwork',
  
  type: 'output',
  
  initialize: function(el, width, height) {
    return {
    };
  },
  
  renderValue: function(el, x, instance) {

    var data;
    var nodes;
    var edges;
    
    // highlight nearest variables & selectedBy
    var allNodes;
    var nodesDataset;
    
    // clustergin by zoom variables
    var clusterIndex = 0;
    var clusters = [];
    var lastClusterZoomLevel = 0;
    var clusterFactor;
    var ctrlwait = 0;
    
    // legend control
    var addlegend = false;
    
    // clear el.id (for shiny...)
    document.getElementById(el.id).innerHTML = "";  
    
    // shared control with proxy function (is there a better way ?)
    document.getElementById(el.id).highlightActive = false;
    document.getElementById(el.id).selectActive = false;
    document.getElementById(el.id).updateNodes = false;
    document.getElementById(el.id).idselection = x.idselection.enabled;
    document.getElementById(el.id).byselection = x.byselection.enabled;
    if(x.highlight !== undefined){
      document.getElementById(el.id).highlight = x.highlight.enabled;
      document.getElementById(el.id).hoverNearest = x.highlight.hoverNearest;
      document.getElementById(el.id).degree = x.highlight.degree;
      document.getElementById(el.id).highlightAlgorithm = x.highlight.algorithm;
    } else {
      document.getElementById(el.id).highlight = false;
      document.getElementById(el.id).hoverNearest = false;
      document.getElementById(el.id).degree = 1;
      document.getElementById(el.id).highlightAlgorithm = "all";
    }

    
    var changeInput = function(id, data) {
            Shiny.onInputChange(el.id + '_' + id, data);
    };
          
    //*************************
    //title
    //*************************
    if(x.main !== null){
      var div_title = document.createElement('div');
      div_title.innerHTML = x.main.text;
      div_title.setAttribute('style',  x.main.style);
      document.getElementById(el.id).appendChild(div_title);  
    }
 
    //*************************
    //idselection
    //*************************
    function onIdChange(id, init) {
      if(id === ""){
        instance.network.selectNodes([]);
      }else{
        instance.network.selectNodes([id]);
      }
      if(document.getElementById(el.id).highlight){
        neighbourhoodHighlight(instance.network.getSelection().nodes, "click", document.getElementById(el.id).highlightAlgorithm);
      }else{
        if(init){
          selectNode = document.getElementById('nodeSelect'+el.id);
          if(x.idselection.values !== undefined){
            if(indexOf.call(x.idselection.values, id, true) > -1){
              selectNode.value = id;
            }else{
              selectNode.value = "";
            }
          }else{
            selectNode.value = id;
          }
        }
      }
      if (window.Shiny){
        changeInput('selected', document.getElementById("nodeSelect"+el.id).value);
      }
      if(document.getElementById(el.id).byselection){
        resetList('selectedBy', el.id, 'selectedBy');
      }
    }
      
    // id nodes selection : add a list on top left
    // actually only with nodes + edges data (not dot and gephi)
    var idList = document.createElement("select");
    idList.setAttribute('class', 'dropdown');
    idList.style.display = 'none';
    idList.id = "nodeSelect"+el.id;
    document.getElementById(el.id).appendChild(idList);
      
    idList.onchange =  function(){
      if(instance.network){
        onIdChange(document.getElementById("nodeSelect"+el.id).value, false);
      }
    };
      
    var hr = document.createElement("hr");
    hr.setAttribute('style', 'height:0px; visibility:hidden; margin-bottom:-1px;');
    document.getElementById(el.id).appendChild(hr);  
      
    if(document.getElementById(el.id).idselection){  
      var option;
      //Create and append select list
      var selnodes = visNetworkdataframeToD3(x.nodes, "nodes");
      
      var selectList = document.getElementById("nodeSelect"+el.id)
      selectList.setAttribute('style', x.idselection.style);
      selectList.style.display = 'inline';
      
      option = document.createElement("option");
      option.value = "";
      option.text = "Select by id";
      selectList.appendChild(option);
      
      var addid;
      //Create and append the options
      for (var i = 0; i < selnodes.length; i++) {
        addid = true;
        if(x.idselection.values !== undefined){
          if(indexOf.call(x.idselection.values, selnodes[i].id, false) === -1){
            addid = false;
          }
        }
        if(addid){
          option = document.createElement("option");
          option.value = selnodes[i].id;
          if(selnodes[i].label){
            option.text = selnodes[i].label;
          }else{
            option.text = selnodes[i].id;
          }
          selectList.appendChild(option);
        }
      }
      
      if (window.Shiny){
        changeInput('selected', document.getElementById("nodeSelect"+el.id).value);
      }
    }
    
    //*************************
    //selectedBy
    //*************************
    function onByChange(value) {
        if(instance.network){
          selectedHighlight(value);
        }
        if (window.Shiny){
          changeInput('selectedBy', value);
        }
        if(document.getElementById(el.id).idselection){
          resetList('nodeSelect', el.id, 'selected');
        }
    }
    
    // selectedBy : add a list on top left
    // actually only with nodes + edges data (not dot and gephi)
    //Create and append select list
    var byList = document.createElement("select");
    byList.setAttribute('class', 'dropdown');
    byList.style.display = 'none';
    byList.id = "selectedBy"+el.id;
    document.getElementById(el.id).appendChild(byList);

    byList.onchange =  function(){
      onByChange(document.getElementById("selectedBy"+el.id).value);
    };
      
    
    if(document.getElementById(el.id).byselection){

      document.getElementById(el.id).byselection_values = x.byselection.values;
      document.getElementById(el.id).byselection_variable = x.byselection.variable;
      document.getElementById(el.id).byselection_multiple = x.byselection.multiple;
      var option2;
      
      //Create and append select list
      var selectList2 = document.getElementById("selectedBy"+el.id);
      selectList2.setAttribute('style', x.byselection.style);
      selectList2.style.display = 'inline';
      
      option2 = document.createElement("option");
      option2.value = "";
      option2.text = "Select by " + x.byselection.variable;
      selectList2.appendChild(option2);
      
      //Create and append the options
      for (var i2 = 0; i2 < x.byselection.values.length; i2++) {
        option2 = document.createElement("option");
        option2.value = x.byselection.values[i2];
        option2.text = x.byselection.values[i2];
        selectList2.appendChild(option2);
      }
      
      if (window.Shiny){
        changeInput('selectedBy', document.getElementById("selectedBy"+el.id).value);
      }
    }
    
    //*************************
    // pre-treatment for icons (unicode)
    //*************************
    if(x.options.groups){
      for (var gr in x.options.groups){
        if(x.options.groups[gr].icon){
          if(x.options.groups[gr].icon.code){
            x.options.groups[gr].icon.code = JSON.parse( '"'+'\\u' + x.options.groups[gr].icon.code + '"');
          }
          if(x.options.groups[gr].icon.color){
            x.options.groups[gr].color = x.options.groups[gr].icon.color;
          }
        }
      }
    }
    
    if(x.options.nodes.icon){
        if(x.options.nodes.icon.code){
          x.options.nodes.icon.code = JSON.parse( '"'+'\\u' + x.options.nodes.icon.code + '"');
        }
        if(x.options.nodes.icon.color){
          x.options.nodes.color = x.options.nodes.icon.color;
        }
    }
    
    //*************************
    //page structure
    //*************************
    
    // divide page
    var maindiv  = document.createElement('div');
    maindiv.id = "maindiv"+el.id;
    maindiv.setAttribute('style', 'height:95%');
    document.getElementById(el.id).appendChild(maindiv);
    
    var graph = document.createElement('div');
    graph.id = "graph"+el.id;
    
    if(x.legend !== undefined){
      if((x.groups && x.legend.useGroups) || (x.legend.nodes !== undefined) || (x.legend.edges !== undefined)){
        addlegend = true;
      }
    }
    
    //legend
    if(addlegend){
      var legendwidth = x.legend.width*100;
      var legend = document.createElement('div');
      
      var pos = x.legend.position;
      var pos2 = "right";
      if(pos == "right"){
        pos2 = "left";
      }
      
      legend.id = "legend"+el.id;
      legend.setAttribute('style', 'float:' + pos + '; width:'+legendwidth+'%;height:100%');
      
      //legend title
      if(x.legend.main !== undefined){
        var legend_title = document.createElement('div');
        legend_title.innerHTML = x.legend.main.text;
        legend_title.setAttribute('style',  x.legend.main.style);
        legend.appendChild(legend_title);  
        
        legend.id = "legend_main"+el.id;
        var legend_network = document.createElement('div');
        legend_network.id = "legend"+el.id;
        legend_network.setAttribute('style', 'height:100%');
        legend.appendChild(legend_network); 
      }
      
      document.getElementById("maindiv"+el.id).appendChild(legend);
      graph.setAttribute('style', 'float:' + pos2 + '; width:'+(100-legendwidth)+'%;height:100%');
    }else{
      graph.setAttribute('style', 'float:right; width:100%;height:100%');
    }
    
    document.getElementById("maindiv"+el.id).appendChild(graph);
    
    //*************************
    //legend definition
    //*************************
    if(addlegend){
      
      var legendnodes = new vis.DataSet();
      var legendedges = null;
      var datalegend;
      var tmpnodes;
      
      // set some options
      var optionslegend = {
        interaction:{
          dragNodes: false,
          dragView: false,
          selectable: false,
          zoomView: false
        },
        physics:{
          stabilization: false
        }
      };
      
      var mynetwork = document.getElementById('legend'+el.id);
      var lx = - mynetwork.clientWidth / 2 + 50;
      var ly = - mynetwork.clientHeight / 2 + 50;
      var step = 70;
      var tmp_ly;
      var tmp_lx = lx;
      var tmp_lx2;
      if(tmp_lx === 0){
        tmp_lx = 1
      }
      // want to view groups in legend
      if(x.groups && x.legend.useGroups){
        // create data
        for (var g1 = 0; g1 < x.groups.length; g1++){
          tmp_ly =ly+g1*step;
          if(tmp_ly === 0){
            tmp_ly = 1
          }
          legendnodes.add({id: null, x : tmp_lx, y : tmp_ly, label: x.groups[g1], group: x.groups[g1], value: 1, mass:0});
        }
        // control icon size
        if(x.options.groups){
          optionslegend.groups = clone(x.options.groups);
          for (var grp in optionslegend.groups) {
            if(optionslegend.groups[grp].shape === "icon"){
              optionslegend.groups[grp].icon.size = 50;
            }
          }
        }
      }
      // want to add custom nodes
      if(x.legend.nodes !== undefined){
        if(x.legend.nodesToDataframe){ // data in data.frame
          tmpnodes = visNetworkdataframeToD3(x.legend.nodes, "nodes")
        } else { // data in list
          tmpnodes = x.legend.nodes;
        }
        // only one element   
        if(tmpnodes.length === undefined){
          tmpnodes = new Array(tmpnodes);
        }
        // control icon
        for (var nd in tmpnodes){
          if(tmpnodes[nd].icon  && !x.legend.nodesToDataframe){
            tmpnodes[nd].icon.code = JSON.parse( '"'+'\\u' + tmpnodes[nd].icon.code + '"');
          }
        }
        // set coordinates
        for (var g = 0; g < tmpnodes.length; g++){
          tmpnodes[g].x = tmp_lx;
          tmp_ly = ly+(g+legendnodes.length)*step;
          if(tmp_ly === 0){
            tmp_ly = 1
          }
          tmpnodes[g].y = tmp_ly;
          if(tmpnodes[g].value === undefined && tmpnodes[g].size === undefined){
            tmpnodes[g].value = 1;
          }
          if(tmpnodes[g].id !== undefined){
            tmpnodes[g].id = null;
          }
          tmpnodes[g].mass = 0;
        }
        legendnodes.add(tmpnodes);
      }
      // want to add custom edges
      if(x.legend.edges !== undefined){
        if(x.legend.edgesToDataframe){ // data in data.frame
          legendedges = visNetworkdataframeToD3(x.legend.edges, "edges")
        } else {  // data in list
          legendedges = x.legend.edges;
        }
        // only one element 
        if(legendedges.length === undefined){
          legendedges = new Array(legendedges);
        }

        var ctrl = legendnodes.length;
        // set coordinates and options
        for (var edg = 0; edg < (legendedges.length); edg++){
          
          legendedges[edg].from = edg*2+1;
          legendedges[edg].to = edg*2+2;
          legendedges[edg].physics = false;
          legendedges[edg].smooth = false;
          legendedges[edg].value = undefined;

          if(legendedges[edg].arrows === undefined){
            legendedges[edg].arrows = 'to';
          }
          
          if(legendedges[edg].width === undefined){
            legendedges[edg].width = 1;
          }

          tmp_ly = ly+ctrl*step;
          if(tmp_ly === 0){
            tmp_ly = 1
          }
          
          tmp_lx = lx - mynetwork.clientWidth/3;
          if(tmp_lx === 0){
            tmp_lx = 1
          }
          
          tmp_lx2 = lx + mynetwork.clientWidth/3;
          if(tmp_lx2 === 0){
            tmp_lx2 = 1
          }
          
          legendnodes.add({id: edg*2+1, x : tmp_lx, y : tmp_ly, size : 0.0001, hidden : false, shape : "square", mass:0});
          legendnodes.add({id: edg*2+2, x : tmp_lx2, y : tmp_ly, size : 0.0001, hidden : false, shape : "square", mass:0});
          ctrl = ctrl+1;
        }
      }
      
      // render legend network
      datalegend = {
        nodes: legendnodes, 
        edges: legendedges       
      };
          
      instance.legend = new vis.Network(document.getElementById("legend"+el.id), datalegend, optionslegend);
    }
    
    //*************************
    // Main Network rendering
    //*************************
    if(x.nodes){
      
      // network
      nodes = new vis.DataSet();
      edges = new vis.DataSet();
      
      var tmpnodes = visNetworkdataframeToD3(x.nodes, "nodes");
      
      // update coordinates if igraph
      if(x.igraphlayout !== undefined){
        // to improved
        var zoomLevel = -232.622349 / (tmpnodes.length + 91.165919)  +2.516861;
        var factor = document.getElementById("graph"+el.id).clientWidth / 1890;
        zoomLevel = zoomLevel/factor;
        
        var scalex = (document.getElementById("graph"+el.id).clientWidth / 2) * zoomLevel;
        var scaley = scalex;
        if(x.igraphlayout.type !== "square"){
          scaley = (document.getElementById("graph"+el.id).clientHeight / 2) * zoomLevel;
        }
        for (var nd in tmpnodes) {
          tmpnodes[nd].x = tmpnodes[nd].x * scalex;
          tmpnodes[nd].y = tmpnodes[nd].y * scaley;
        }
      }
      
      nodes.add(tmpnodes);
      edges.add(visNetworkdataframeToD3(x.edges, "edges"));
      
      // reset tmpnodes
      tmpnodes = null;
      
      data = {
        nodes: nodes,
        edges: edges
      };
      
      //save data for re-use and update
      document.getElementById("graph"+el.id).nodes = nodes;
      document.getElementById("graph"+el.id).edges = edges;

    }else if(x.dot){
      data = {
        dot: x.dot
      };
    }else if(x.gephi){
      data = {
        gephi: x.gephi
      };
    } 
    
    var options = x.options;
    
    //*************************
    //manipulation
    //*************************
    if(x.options.manipulation.enabled){

      var style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(x.datacss));
      document.getElementsByTagName("head")[0].appendChild(style);

      var div = document.createElement('div');
      div.id = 'network-popUp';

      div.innerHTML = '<span id="operation">node</span> <br>\
      <table style="margin:auto;"><tr>\
      <td>id</td><td><input id="node-id" value="new value" disabled = true></td>\
      </tr>\
      <tr>\
      <td>label</td><td><input id="node-label" value="new value"> </td>\
      </tr></table>\
      <input type="button" value="save" id="saveButton"></button>\
      <input type="button" value="cancel" id="cancelButton"></button>';

      document.getElementById(el.id).appendChild(div);

      options.manipulation.addNode = function(data, callback) {
        document.getElementById('operation').innerHTML = "Add Node";
        document.getElementById('node-id').value = data.id;
        document.getElementById('node-label').value = data.label;
        document.getElementById('saveButton').onclick = saveNode.bind(this, data, callback, "addNode");
        document.getElementById('cancelButton').onclick = clearPopUp.bind();
        document.getElementById('network-popUp').style.display = 'block';
      };

      options.manipulation.editNode = function(data, callback) {
        document.getElementById('operation').innerHTML = "Edit Node";
        document.getElementById('node-id').value = data.id;
        document.getElementById('node-label').value = data.label;
        document.getElementById('saveButton').onclick = saveNode.bind(this, data, callback, "editNode");
        document.getElementById('cancelButton').onclick = cancelEdit.bind(this,callback);
        document.getElementById('network-popUp').style.display = 'block';
      };

      options.manipulation.deleteNode = function(data, callback) {
          var r = confirm("Do you want to delete " + data.nodes.length + " node(s) and " + data.edges.length + " edges ?");
          if (r === true) {
            deleteSubGraph(data, callback);
          }
      };

      options.manipulation.deleteEdge = function(data, callback) {
          var r = confirm("Do you want to delete " + data.edges.length + " edges ?");
          if (r === true) {
            deleteSubGraph(data, callback);
          }
      };

      options.manipulation.addEdge = function(data, callback) {
        if (data.from == data.to) {
          var r = confirm("Do you want to connect the node to itself?");
          if (r === true) {
            saveEdge(data, callback, "addEdge");
          }
        }
        else {
          saveEdge(data, callback, "addEdge");
        }
      };
      
      options.manipulation.editEdge = function(data, callback) {
        if (data.from == data.to) {
          var r = confirm("Do you want to connect the node to itself?");
          if (r === true) {
            saveEdge(data, callback, "editEdge");
          }
        }
        else {
          saveEdge(data, callback, "editEdge");
        }
      };
    }
    
    // create network
    instance.network = new vis.Network(document.getElementById("graph"+el.id), data, options);
    
    //save data for re-use and update
    document.getElementById("graph"+el.id).chart = instance.network;
    document.getElementById("graph"+el.id).options = options;

    // add Events
    // control to put this event due to highlightNearest
    var is_click_event = false;
    var is_hoverNode_event = false;
    var is_blurNode_event = false;
    if(x.events !== undefined){
      for (var key in x.events) {
        if(key === "click"){
          is_click_event = true;
        } else if(key === "hoverNode"){
          is_hoverNode_event = true;
        } else if(key === "blurNode"){
          is_blurNode_event = true;
        } else {
          instance.network.on(key, x.events[key]);
        }
      }
    }

    if(x.OnceEvents !== undefined){
      for (var key in x.OnceEvents) {
          instance.network.once(key, x.OnceEvents[key]);
      }
    }
    
    if(x.ResetEvents !== undefined){
      for (var key in x.ResetEvents) {
          instance.network.off(key);
      }
    }
    //*************************
    // Selected Highlight
    //*************************
  
    function selectedHighlight(value) {
      // need to update nodes before ?
      if(document.getElementById(el.id).updateNodes){
        document.getElementById(el.id).updateNodes = false;
        allNodes = nodesDataset.get({returnType:"Object"});
      }
      // get variable
      var sel = document.getElementById(el.id).byselection_variable;
      // need to make an update?
      var update = !(document.getElementById(el.id).selectActive === false & value === "");

      if (value !== "") {
        var updateArray = [];
        document.getElementById(el.id).selectActive = true;
        
        // mark all nodes as hard to read.
        for (var nodeId in allNodes) {
          var value_in = false;
          // unique selection
          if(document.getElementById(el.id).byselection_multiple === false){
            if(sel == "label"){
              value_in = ((allNodes[nodeId]["label"] + "") === value) || ((allNodes[nodeId]["hiddenLabel"] + "") === value);
            }else if(sel == "color"){
              value_in = ((allNodes[nodeId]["color"] + "") === value) || ((allNodes[nodeId]["hiddenColor"] + "") === value);
            }else {
              value_in = (allNodes[nodeId][sel] + "") === value;
            }
          }else{ // multiple selection
            if(sel == "label"){
              var current_value = allNodes[nodeId]["label"] + "";
              var value_split = current_value.split(",").map(Function.prototype.call, String.prototype.trim);
              var current_value2 = allNodes[nodeId]["hiddenLabel"] + "";
              var value_split2 = current_value.split(",").map(Function.prototype.call, String.prototype.trim);
              value_in = (value_split.indexOf(value) !== -1) || (value_split2.indexOf(value) !== -1);
            }else if(sel == "color"){
              var current_value = allNodes[nodeId]["color"] + "";
              var value_split = current_value.split(",").map(Function.prototype.call, String.prototype.trim);
              var current_value2 = allNodes[nodeId]["hiddenColor"] + "";
              var value_split2 = current_value.split(",").map(Function.prototype.call, String.prototype.trim);
              value_in = (value_split.indexOf(value) !== -1) || (value_split2.indexOf(value) !== -1);
            }else {
              var current_value = allNodes[nodeId][sel] + "";
              var value_split = current_value.split(",").map(Function.prototype.call, String.prototype.trim);
              value_in = value_split.indexOf(value) !== -1;
            }
          }
          if(value_in === false){ // not in selection, so as hard to read
            nodeAsHardToRead(allNodes[nodeId], instance.network.groups, options);
          } else { // in selection, so reset if needed
            resetOneNode(allNodes[nodeId], instance.network.groups, options);
          }
          allNodes[nodeId].x = undefined;
          allNodes[nodeId].y = undefined;
          // update data
          if (allNodes.hasOwnProperty(nodeId) && update) {
            updateArray.push(allNodes[nodeId]);
          }
        }
        if(update){
          nodesDataset.update(updateArray);
        }
      }
      else if (document.getElementById(el.id).selectActive === true) {
        //reset nodes
        resetAllNodes(allNodes, update, nodesDataset, instance.network.groups, options)
        document.getElementById(el.id).selectActive = false
      }
    } 
  
    //*************************
    //Highlight
    //*************************
    var is_hovered = false;
    var is_clicked = false;
    
    //unique element in array
    function uniqueArray(arr, exclude_cluster) {
      var a = [];
      for (var i=0, l=arr.length; i<l; i++){
        if (a.indexOf(arr[i]) === -1 && arr[i] !== ''){
          if(exclude_cluster === false){
            a.push(arr[i]);
          } else if(instance.network.isCluster(arr[i]) === false){
            a.push(arr[i]);
          }
        }
      }
      return a;
    }

    function neighbourhoodHighlight(params, action_type, algorithm) {

      var selectNode;
      // need to update nodes before ?
      if(document.getElementById(el.id).updateNodes){
        document.getElementById(el.id).updateNodes = false;
        allNodes = nodesDataset.get({returnType:"Object"});
      };
      
      // update 
      var update = !(document.getElementById(el.id).highlightActive === false & params.length === 0) | (document.getElementById(el.id).selectActive === true & params.length === 0);

      if(!(action_type == "hover" && is_clicked)){
        if (params.length > 0) {
        
          var updateArray = [];
          if(document.getElementById(el.id).idselection){
            selectNode = document.getElementById('nodeSelect'+el.id);
            if(x.idselection.values !== undefined){
              if(indexOf.call(x.idselection.values, params[0], true) > -1){
                selectNode.value = params[0];
              }else{
                selectNode.value = "";
              }
            }else{
              selectNode.value = params[0];
            }
            if (window.Shiny){
              changeInput('selected', selectNode.value);
            }
          }
          
          document.getElementById(el.id).highlightActive = true;
          var i,j;
          var selectedNode = params[0];
          var degrees = document.getElementById(el.id).degree;
          
          // mark all nodes as hard to read.
          for (var nodeId in allNodes) {
            nodeAsHardToRead(allNodes[nodeId], instance.network.groups, options);
            allNodes[nodeId].x = undefined;
            allNodes[nodeId].y = undefined;
          }
          if(algorithm === "all"){
            if(degrees > 0){
              var connectedNodes = uniqueArray(instance.network.getConnectedNodes(selectedNode), true);
            }else{
              var connectedNodes = [selectedNode];
            }
            
            var allConnectedNodes = [];
            // get the nodes to color
            if(degrees >= 2){
              for (i = 2; i <= degrees; i++) {
                var previous_connectedNodes = connectedNodes;
                var currentlength = connectedNodes.length;
                for (j = 0; j < currentlength; j++) {
                  connectedNodes = uniqueArray(connectedNodes.concat(instance.network.getConnectedNodes(connectedNodes[j])), true);
                }
                if (connectedNodes.length === previous_connectedNodes.length) { break; }
              }
            }
            // nodes to just label
            for (j = 0; j < connectedNodes.length; j++) {
                allConnectedNodes = allConnectedNodes.concat(instance.network.getConnectedNodes(connectedNodes[j]));
            }
            
            allConnectedNodes = uniqueArray(allConnectedNodes, true);

            // all higher degree nodes get a different color and their label back
            for (i = 0; i < allConnectedNodes.length; i++) {
              if (allNodes[allConnectedNodes[i]].hiddenLabel !== undefined) {
                allNodes[allConnectedNodes[i]].label = allNodes[allConnectedNodes[i]].hiddenLabel;
                allNodes[allConnectedNodes[i]].hiddenLabel = undefined;
              }
            }
            // all in degree nodes get their own color and their label back
            for (i = 0; i < connectedNodes.length; i++) {
              resetOneNode(allNodes[connectedNodes[i]], instance.network.groups, options);
            }
            // the main node gets its own color and its label back.
            resetOneNode(allNodes[selectedNode], instance.network.groups, options);
            
          } else if(algorithm === "hierarchical"){
            
            // first resetEdges
            resetEdges(edges);
            
            var degree_from = degrees.from;
            var degree_to = degrees.to;
            degrees = Math.max(degree_from, degree_to);
            
            var allConnectedNodes = [];
            var currentConnectedFromNodes = [];
            var currentConnectedToNodes = [];
            var connectedFromNodes = [];
            var connectedToNodes = [];
            
            if(degree_from > 0){
              connectedFromNodes = edges.get({
                fields: ['from'],
                filter: function (item) {
                  return item.to == selectedNode;
                },
                returnType :'Array'
              });
            }

            if(degree_to > 0){
              connectedToNodes = edges.get({
                fields: ['to'],
                filter: function (item) {
                  return item.from == selectedNode;
                },
                returnType :'Array'
              });
            }
            for (j = 0; j < connectedFromNodes.length; j++) {
                allConnectedNodes = allConnectedNodes.concat(connectedFromNodes[j].from);
                currentConnectedFromNodes = currentConnectedFromNodes.concat(connectedFromNodes[j].from);
            }
            
            for (j = 0; j < connectedToNodes.length; j++) {
                allConnectedNodes = allConnectedNodes.concat(connectedToNodes[j].to);
                currentConnectedToNodes = currentConnectedToNodes.concat(connectedToNodes[j].to);
            }
            
            if(degrees > 1){
              for (i = 2; i <= degrees; i++) {
                if(currentConnectedFromNodes.length > 0 && degrees <= degree_from){
                  connectedFromNodes = edges.get({
                    fields: ['from'],
                    filter: function (item) {
                      return indexOf.call(currentConnectedFromNodes, item.to, true) > -1;
                    },
                    returnType :'Array'
                  });
                }

                if(currentConnectedToNodes.length > 0 && degrees <= degree_to){
                  connectedToNodes = edges.get({
                    fields: ['to'],
                    filter: function (item) {
                      return indexOf.call(currentConnectedToNodes, item.from, true) > -1;
                    },
                    returnType :'Array'
                  });
                }
                
                currentConnectedFromNodes = [];
                currentConnectedToNodes = [];
                
                for (j = 0; j < connectedFromNodes.length; j++) {
                    allConnectedNodes = allConnectedNodes.concat(connectedFromNodes[j].from);
                    currentConnectedFromNodes = currentConnectedFromNodes.concat(connectedFromNodes[j].from);
                }
                
                for (j = 0; j < connectedToNodes.length; j++) {
                    allConnectedNodes = allConnectedNodes.concat(connectedToNodes[j].to);
                    currentConnectedToNodes = currentConnectedToNodes.concat(connectedToNodes[j].to);
                }
                
                if (currentConnectedToNodes.length === 0 &&  currentConnectedFromNodes.length === 0) { break; }
              }
            }
            
            allConnectedNodes = uniqueArray(allConnectedNodes, true).concat([selectedNode]);

            var nodesWithLabel = [];
            if(degrees > 0){
              // nodes to just label
              for (j = 0; j < currentConnectedToNodes.length; j++) {
                  nodesWithLabel = nodesWithLabel.concat(instance.network.getConnectedNodes(currentConnectedToNodes[j]));
              }
              
              for (j = 0; j < currentConnectedFromNodes.length; j++) {
                  nodesWithLabel = nodesWithLabel.concat(instance.network.getConnectedNodes(currentConnectedFromNodes[j]));
              }
              nodesWithLabel = uniqueArray(nodesWithLabel, true);
            } else{
              nodesWithLabel = currentConnectedToNodes;
              nodesWithLabel = nodesWithLabel.concat(currentConnectedFromNodes);
              nodesWithLabel = uniqueArray(nodesWithLabel, true);
            }

            // all higher degree nodes get a different color and their label back
            for (i = 0; i < nodesWithLabel.length; i++) {
              if (allNodes[nodesWithLabel[i]].hiddenLabel !== undefined) {
                allNodes[nodesWithLabel[i]].label = allNodes[nodesWithLabel[i]].hiddenLabel;
                allNodes[nodesWithLabel[i]].hiddenLabel = undefined;
              }
            }
              
            // all in degree nodes get their own color and their label back
            for (i = 0; i < allConnectedNodes.length; i++) {
              resetOneNode(allNodes[allConnectedNodes[i]], instance.network.groups, options);
            }
            
            // set som edges as hard to read
            var edgesHardToRead = edges.get({
              fields: ['id', 'color'],
              filter: function (item) {
                return ((indexOf.call(allConnectedNodes, item.from, true) === -1) && (indexOf.call(allConnectedNodes, item.to, true) > -1)) || ((indexOf.call(allConnectedNodes, item.from, true) > -1) && (indexOf.call(allConnectedNodes, item.to, true) === -1)) ;
              },
              returnType :'Array'
            });
            
            // all in degree nodes get their own color and their label back
            for (i = 0; i < edgesHardToRead.length; i++) {
              edgesHardToRead[i].color = 'rgba(200,200,200,0.5)';
            }
            
            edges.update(edgesHardToRead);
            
          }

          if(update){
            if(!(action_type == "hover")){
               is_clicked = true;
            }
            // transform the object into an array
            var updateArray = [];
            for (nodeId in allNodes) {
              if (allNodes.hasOwnProperty(nodeId)) {
                updateArray.push(allNodes[nodeId]);
              }
            }
            nodesDataset.update(updateArray);
          }else{
            is_clicked = false;
          }
        
        }
        else if (document.getElementById(el.id).highlightActive === true | document.getElementById(el.id).selectActive === true) {
          // reset nodeSelect list if actived
          if(document.getElementById(el.id).idselection){
            resetList("nodeSelect", el.id, 'selected');
          }
          //reset nodes
          resetAllNodes(allNodes, update, nodesDataset, instance.network.groups, options)
          if(algorithm === "hierarchical"){
            // resetEdges
            resetEdges(edges);
          }
          document.getElementById(el.id).highlightActive = false;
          is_clicked = false;
        }
      }
      // reset selectedBy list if actived
      if(document.getElementById(el.id).byselection){
        resetList("selectedBy", el.id, 'selectedBy');
      }
    }
    
    function onClickIDSelection(selectedItems) {
      var selectNode;
      if(document.getElementById(el.id).idselection){
        if (selectedItems.nodes.length !== 0) {
          selectNode = document.getElementById('nodeSelect'+el.id);
          if(x.idselection.values !== undefined){
            if(indexOf.call(x.idselection.values, selectedItems.nodes[0], true) > -1){
              selectNode.value = selectedItems.nodes;
            }else{
              selectNode.value = "";
            }
          }else{
            selectNode.value = selectedItems.nodes;
          }
          if (window.Shiny){
            changeInput('selected', selectNode.value);
          }
        }else{
          resetList("nodeSelect", el.id, 'selected');
        } 
      }
      if(document.getElementById(el.id).byselection){
        // reset selectedBy list if actived
        if (selectedItems.nodes.length === 0) {
          resetList("selectedBy", el.id, 'selectedBy');
          selectedHighlight("");
        }
      }
    }
    
    // get a copy of nodes for all highlight / selection process
    nodesDataset = nodes; 
    if((document.getElementById(el.id).byselection || document.getElementById(el.id).highlight) && x.nodes){
      allNodes = nodesDataset.get({returnType:"Object"});
    }

    // shared click function (selectedNodes)
    document.getElementById("graph"+el.id).myclick = function(params){
      if(instance.network.isCluster(params.nodes) === false){
        if(document.getElementById(el.id).highlight && x.nodes){
          neighbourhoodHighlight(params.nodes, "click", document.getElementById(el.id).highlightAlgorithm);
        }else if((document.getElementById(el.id).idselection || document.getElementById(el.id).byselection) && x.nodes){
          onClickIDSelection(params)
        } 
        if(is_click_event){
          x.events["click"](params);
        }
      }
    };
    
    // Set event in relation with highlightNearest      
    instance.network.on("click", function(params){
      if(instance.network.isCluster(params.nodes) === false){
        if(document.getElementById(el.id).highlight && x.nodes){
          neighbourhoodHighlight(params.nodes, "click", document.getElementById(el.id).highlightAlgorithm);
        }else if((document.getElementById(el.id).idselection || document.getElementById(el.id).byselection) && x.nodes){
          onClickIDSelection(params)
        } 
        if(is_click_event){
          x.events["click"](params);
        }
      }
    });
    
    instance.network.on("hoverNode", function(params){
      if(instance.network.isCluster(params.nodes) === false){
        if(document.getElementById(el.id).hoverNearest && x.nodes){
          neighbourhoodHighlight([params.node], "hover", document.getElementById(el.id).highlightAlgorithm);
        } 
        if(is_hoverNode_event){
          x.events["hoverNode"](params);
        }
      }
    });

    instance.network.on("blurNode", function(params){
      if(document.getElementById(el.id).hoverNearest && x.nodes){
        neighbourhoodHighlight([], "hover", document.getElementById(el.id).highlightAlgorithm);
      }      
      if(is_blurNode_event){
        x.events["blurNode"](params);
      }
    });
    
    //*************************
    // export
    //*************************
    if(x.export !== undefined){
      
      var downloaddiv = document.createElement('div');
      downloaddiv.setAttribute('style', 'float:right; width:100%');
      
      var downloadbutton = document.createElement("button");
      downloadbutton.setAttribute('style', x.export.css);
      downloadbutton.id = "download"+el.id;
      downloadbutton.appendChild(document.createTextNode(x.export.label)); 
      downloaddiv.appendChild(downloadbutton);
      
      var hr = document.createElement("hr");
      hr.setAttribute('style', 'height:5px; visibility:hidden; margin-bottom:-1px;');
      downloaddiv.appendChild(hr);  
      
      document.getElementById("maindiv"+el.id).appendChild(downloaddiv);
      
      document.getElementById("download"+el.id).onclick = function() {
           
           html2canvas(document.getElementById(el.id), {
             background: x.export.background,
              onrendered: function(canvas) {
                canvas.toBlob(function(blob) {
                            saveAs(blob, x.export.name);
                                    }, "image/"+x.export.type);
            }
        });
      };
    }

    //*************************
    // dataManipulation
    //*************************
    function clearPopUp() {
      document.getElementById('saveButton').onclick = null;
      document.getElementById('cancelButton').onclick = null;
      document.getElementById('network-popUp').style.display = 'none';
    }

    function saveNode(data, callback, cmd) {
      data.id = document.getElementById('node-id').value;
      data.label = document.getElementById('node-label').value;
      if (window.Shiny){
        var obj = {cmd: cmd, id: data.id, label: data.label}
        Shiny.onInputChange(el.id + '_graphChange', obj);
      }
      clearPopUp();
      callback(data);
    }

    function saveEdge(data, callback, cmd) {
      callback(data); //must be first called for egde id !
      if (window.Shiny){
        var obj = {cmd: cmd, id: data.id, from: data.from, to: data.to};
        Shiny.onInputChange(el.id + '_graphChange', obj);
      }
      
    }

    function deleteSubGraph(data, callback) {
      if (window.Shiny){
        var obj = {cmd: "deleteElements", nodes: data.nodes, edges: data.edges}
        Shiny.onInputChange(el.id + '_graphChange', obj);
      }
      callback(data);
    }

    function cancelEdit(callback) {
      clearPopUp();
      callback(null);
    }
    
    //*************************
    // CLUSTERING
    //*************************
    if(x.clusteringGroup || x.clusteringColor || x.clusteringHubsize || x.clusteringConnection){
      
      var clusterbutton = document.createElement("input");
      clusterbutton.id = "backbtn"+el.id;
      clusterbutton.setAttribute('type', 'button');  
      clusterbutton.setAttribute('value', 'Reinitialize clustering'); 
      clusterbutton.setAttribute('style', 'background-color:#FFFFFF;border: none');
      document.getElementById(el.id).appendChild(clusterbutton);
      
      clusterbutton.onclick =  function(){
        instance.network.setData(data);
        if(x.clusteringColor){
          clusterByColor();
        }
        if(x.clusteringGroup){
          clusterByGroup();
        }
        if(x.clusteringHubsize){
          clusterByHubsize();
        }
        if(x.clusteringConnection){
          clusterByConnection();
        }
        instance.network.fit();
      }
    }
    
    if(x.clusteringGroup || x.clusteringColor || x.clusteringOutliers || x.clusteringHubsize || x.clusteringConnection){
      // if we click on a node, we want to open it up!
      instance.network.on("doubleClick", function (params) {
        if (params.nodes.length == 1) {
          if (instance.network.isCluster(params.nodes[0]) == true) {
            instance.network.openCluster(params.nodes[0], {releaseFunction : function(clusterPosition, containedNodesPositions) {
              //console.info(clusterPosition)
              //console.info(containedNodesPositions)
              //var newPositions = {};
              // clusterPosition = {x:clusterX, y:clusterY};
              // containedNodesPositions = {nodeId:{x:nodeX,y:nodeY}, nodeId2....}
              //newPositions[nodeId] = {x:newPosX, y:newPosY};
              return containedNodesPositions;
            }});
            instance.network.fit()
          }
        }
      });
    }
    //*************************
    //clustering Connection
    //*************************
    if(x.clusteringConnection){
      
      function clusterByConnection() {
        for (var i = 0; i < x.clusteringConnection.nodes.length; i++) {
          instance.network.clusterByConnection(x.clusteringConnection.nodes[i])
        }
      }
      clusterByConnection();
    }
    
    //*************************
    //clustering hubsize
    //*************************
    if(x.clusteringHubsize){
      
      function clusterByHubsize() {
        var clusterOptionsByData = {
          processProperties: function(clusterOptions, childNodes) {
                  for (var i = 0; i < childNodes.length; i++) {
                      //totalMass += childNodes[i].mass;
                      if(i === 0){
                        //clusterOptions.shape =  childNodes[i].shape;
                        clusterOptions.color =  childNodes[i].color.background;
                      }else{
                        //if(childNodes[i].shape !== clusterOptions.shape){
                          //clusterOptions.shape = 'database';
                        //}
                        if(childNodes[i].color.background !== clusterOptions.color){
                          clusterOptions.color = 'grey';
                        }
                      }
                  }
            clusterOptions.label = "[" + childNodes.length + "]";
            return clusterOptions;
          },
          clusterNodeProperties: {borderWidth:3, shape:'box', font:{size:30}}
        }
        if(x.clusteringHubsize.size > 0){
          instance.network.clusterByHubsize(x.clusteringHubsize.size, clusterOptionsByData);
        }else{
          instance.network.clusterByHubsize(undefined, clusterOptionsByData);
        }
      }
      
      clusterByHubsize();
    }
    
    if(x.clusteringColor){
      
    //*************************
    //clustering color
    //*************************
    function clusterByColor() {
        var colors = x.clusteringColor.colors
        var clusterOptionsByData;
        for (var i = 0; i < colors.length; i++) {
          var color = colors[i];
          clusterOptionsByData = {
              joinCondition: function (childOptions) {
                  return childOptions.color.background == color; // the color is fully defined in the node.
              },
              processProperties: function (clusterOptions, childNodes, childEdges) {
                  var totalMass = 0;
                  for (var i = 0; i < childNodes.length; i++) {
                      totalMass += childNodes[i].mass;
                      if(x.clusteringColor.force === false){
                        if(i === 0){
                          clusterOptions.shape =  childNodes[i].shape;
                        }else{
                          if(childNodes[i].shape !== clusterOptions.shape){
                            clusterOptions.shape = x.clusteringColor.shape;
                          }
                        }
                      } else {
                        clusterOptions.shape = x.clusteringColor.shape;
                      }

                  }
                  clusterOptions.value = totalMass;
                  return clusterOptions;
              },
              clusterNodeProperties: {id: 'cluster:' + color, borderWidth: 3, color:color, label: x.clusteringColor.label + color}
          }
          instance.network.cluster(clusterOptionsByData);
        }
      }
      
      clusterByColor();
    }

    //*************************
    //clustering groups
    //*************************
    if(x.clusteringGroup){
      
      function clusterByGroup() {
        var groups = x.clusteringGroup.groups;
        var clusterOptionsByData;
        for (var i = 0; i < groups.length; i++) {
          var group = groups[i];
          clusterOptionsByData = {
              joinCondition: function (childOptions) {
                  return childOptions.group == group; //
              },
              processProperties: function (clusterOptions, childNodes, childEdges) {
                //console.info(clusterOptions);
                  var totalMass = 0;
                  for (var i = 0; i < childNodes.length; i++) {
                      totalMass += childNodes[i].mass;
                      if(x.clusteringGroup.force === false){
                        if(i === 0){
                          clusterOptions.shape =  childNodes[i].shape;
                          clusterOptions.color =  childNodes[i].color.background;
                        }else{
                          if(childNodes[i].shape !== clusterOptions.shape){
                            clusterOptions.shape = x.clusteringGroup.shape;
                          }
                          if(childNodes[i].color.background !== clusterOptions.color){
                            clusterOptions.color = x.clusteringGroup.color;
                          }
                        }
                      } else {
                        clusterOptions.shape = x.clusteringGroup.shape;
                        clusterOptions.color = x.clusteringGroup.color;
                      }
                  }
                  clusterOptions.value = totalMass;
                  return clusterOptions;
              },
              clusterNodeProperties: {id: 'cluster:' + group, borderWidth: 3, label:x.clusteringGroup.label + group}
          }
          instance.network.cluster(clusterOptionsByData);
        }
      }
      clusterByGroup();
    }
  
    //*************************
    //clustering by zoom
    //*************************
    if(x.clusteringOutliers){
      
      clusterFactor = x.clusteringOutliers.clusterFactor;
      
      // set the first initial zoom level
      instance.network.on('initRedraw', function() {
        if (lastClusterZoomLevel === 0) {
          lastClusterZoomLevel = instance.network.getScale();
        }
      });

      // we use the zoom event for our clustering
      instance.network.on('zoom', function (params) {
        if(ctrlwait === 0){
        if (params.direction == '-') {
          if (params.scale < lastClusterZoomLevel*clusterFactor) {
            makeClusters(params.scale);
            lastClusterZoomLevel = params.scale;
          }
        }
        else {
          openClusters(params.scale);
        }
        }
      });
    }

    // make the clusters
    function makeClusters(scale) {
        ctrlwait = 1;
        var clusterOptionsByData = {
            processProperties: function (clusterOptions, childNodes) {
                clusterIndex = clusterIndex + 1;
                var childrenCount = 0;
                for (var i = 0; i < childNodes.length; i++) {
                    childrenCount += childNodes[i].childrenCount || 1;
                }
                clusterOptions.childrenCount = childrenCount;
                clusterOptions.label = "# " + childrenCount + "";
                clusterOptions.font = {size: childrenCount*5+30}
                clusterOptions.id = 'cluster:' + clusterIndex;
                clusters.push({id:'cluster:' + clusterIndex, scale:scale});
                return clusterOptions;
            },
            clusterNodeProperties: {borderWidth: 3, shape: 'database', font: {size: 30}}
        }
        instance.network.clusterOutliers(clusterOptionsByData);
        if (x.clusteringOutliers.stabilize) {
            instance.network.stabilize();
        };
        ctrlwait = 0;
    }

    // open them back up!
    function openClusters(scale) {
        ctrlwait = 1;
        var newClusters = [];
        var declustered = false;
        for (var i = 0; i < clusters.length; i++) {
            if (clusters[i].scale < scale) {
                instance.network.openCluster(clusters[i].id);
                lastClusterZoomLevel = scale;
                declustered = true;
            }
            else {
                newClusters.push(clusters[i])
            }
        }
        clusters = newClusters;
        if (x.clusteringOutliers.stabilize) {
            instance.network.stabilize();
        };
        ctrlwait = 0;
    }
    
    //******************
    // init selection
    //******************
    if(document.getElementById(el.id).idselection && x.nodes && x.idselection.selected !== undefined){ 
      onIdChange(''+ x.idselection.selected, true);
    }
      
    if(document.getElementById(el.id).byselection && x.nodes && x.byselection.selected !== undefined){ 
      onByChange(x.byselection.selected);
      selectNode = document.getElementById('selectedBy'+el.id);
      selectNode.value = x.byselection.selected;
    }
    
    // try to fix icons loading css bug...
    function iconsRedraw() {
      setTimeout(function(){
        if(instance.network)
          instance.network.redraw();
        if(instance.legend)
          instance.legend.redraw();
      }, 200);
    }
    if(x.iconsRedraw !== undefined){
      if(x.iconsRedraw){
        instance.network.once("stabilized", function(){iconsRedraw();})
      }
    }
    
    /*console.info("clientWidth");
    console.info(document.getElementById("graph"+el.id).clientWidth);

    console.info("clientHeight");
    console.info(document.getElementById("graph"+el.id).clientHeight);

    console.info(instance.network);
    console.info(instance.network.getScale());*/
  }, 
  
  resize: function(el, width, height, instance) {
      if(instance.network)
        instance.network.fit();
      if(instance.legend)
        instance.legend.fit();
  }
  
});
