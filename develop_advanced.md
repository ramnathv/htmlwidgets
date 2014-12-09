---
title: Advanced Topics
output:
  html_document:
    toc: true
    toc_depth: 3
    highlight: kate
---

## Overview

This article covers several aspects of creating widgets that not required by all widgets, but are an essential part of getting bindings to certain types of JavaScript libraries to work properly. Topics covered include:

* Transforming JSON representations of R objects into representations required by JavaScript libraries (e.g. an R data frame to a d3 dataset).

* Tracking instance-specific widget data within JavaScript bindings.

* Passing JavaScript functions from R to JavaScript (e.g. a user provided formatting or drawing function)

* Generating custom HTML to enclose a widget (the default is a `<div>` but some libraries require a different element e.g. a `<span>`).


## Data Transformation

R objects passed as part of the `x` parameter to the `createWidget` function are transformed to JSON using the `RJSONIO::toJSON` function. However, sometimes this representation isn't what's required by the JavaScript library you are interfacing with. 

### dataframeToD3

R data frames are represented in "long" form (an array of named vectors) whereas d3 typically requires "wide" form (an array of objects each of which includes all names and values). Since the R representation is much faster to transmit over the network, we allow RJSONIO to proceed with it's default behavior and then transform the data in JavaScript using the `dataframeToD3` helper function. 

For example, the [simpleNetwork](http://christophergandrud.github.io/networkD3/#simple) widget accepts a data frame containing network links on the R side, then transforms it to a d3 representation within the JavaScript `renderValue` function:

```javascript
renderValue: function(el, x, instance) {

  // convert links data frame to d3 friendly format
  var links = HTMLWidgets.dataframeToD3(x.links);
  
  // ... use the links, etc ...

}
```

### transposeArray2D

Sometimes a 2-dimensional array requires a similar transposition. For this the `transposeArray2D` function is provided. For example, the [dygraphs](http://rstudio.github.io/dygraphs) widget uses this function to transpose the "file" (data) argument it gets from the R side before passing it on to the dygraphs library:

```javascript
renderValue: function(el, x, instance) {
   
    // ... code excluded ...
    
    // transpose array
    attrs.file = HTMLWidgets.transposeArray2D(attrs.file);
    
    // ... more code excluded ...
}
```

## Widget Instance Data

You may have noticed that the JavaScript binding for a widget consists of a set of JavaScript functions rather than a class which has it's own instance data. Many widgets don't require instance data, but if yours does (e.g. you need to save a JS library provided object, reference to a DOM element, or any other computed data) there is a mechanism available to do so.

Here's how it works: return an object from the `initialize` method and that object will subsequently be passed to the `renderValue` and `resize` methods. For example:

```javascript
HTMLWidgets.widget({
  
  name: "demo",
  
  type: "output",
  
  initialize: function(el, width, height) {
    // object we'll use for instance data
    return {};
  },

  renderValue: function(el, x, instance) {
    // access instance as necessary
  },

  resize: function(el, width, height, instance) { 
    // access instance as necessary
  }
});
```

A real-life example of using instance data is in the [dygraphs](http://rstudio.github.io/dygraphs) widget, which uses the instance to store the actual Dygraph object for later manipulation. Here's the code for the dygraphs JavaScript binding that takes advantage of instance data: <https://github.com/rstudio/dygraphs/blob/master/inst/htmlwidgets/dygraphs.js>

## Passing JavaScript Functions

As you'd expect, character vectors passed from R to JavaScript are converted to JavaScript strings. However, what if you want to allow users to provide custom JavaScript functions for formatting, drawing, or event handling? For this case the **htmlwidgets** class includes a `JS` function that allows you to request that a character value be evaluated as JavaScript when it is received on the client.

For example, the [dygraphs](http://rstudio.github.io/dygraphs) widget includes a `dyCallbacks` function that allows the user to provide callback functions for a variety of contexts. These callbacks are "marked" as containing JavaScript so that they can be converted to actual JavaScript functions on the client:

```r
callbacks <- list()
callbacks$clickCallback <- JS(clickCallback)
callbacks$drawCallback <- JS(drawCallback)
callbacks$highlightCallback <- JS(highlightCallback)
callbacks$pointClickCallback <- JS(pointClickCallback)
callbacks$underlayCallback <- JS(underlayCallback)
```

Another example is in the [DT](http://rstudio.github.io/DT) (DataTables) widget, where users can specify an `initCallback` with JavaScript to execute after the table is loaded and initialized:

```r
datatable(head(iris, 20), options = list(
  initComplete = JS(
    "function(settings, json) {",
    "$(this.api().table().header()).css({'background-color': '#000', 'color': '#fff'});",
    "}")
))
```

## Custom Widget HTML

Typically the HTML "housing" for a widget is just a `<div>` element, and this is correspondingly the default behavior for new widgets that don't specify otherwise. However, sometimes you need a different element type. For example, the [sparkline](https://github.com/htmlwidgets/sparkline) widget requires a `<span>` element so implements the following custom HTML generation function:

```r
sparkline_html <- function(id, style, class, ...){
  tags$span(id = id, class = class)
}
```

Note that this function is looked up within the package implementing the widget by the convention `widgetname_html` so it need not be formally exported from your package or otherwise registered with **htmlwidgets**.

Most widgets won't need a custom HTML function but if you need to generate custom HTML for your widget (e.g. you need an `<input>` or a `<span>` rather than a `<div>`) then you should use the **htmltools** package (as demonstrated by the code above).





