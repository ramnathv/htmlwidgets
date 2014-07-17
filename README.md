## htmlwidgets

This is an experimental R package aimed at providing basic plumbing that makes it easy to develop html widgets for R. These widgets can be used to create standalone output, be embedded inside another document, or used in a [shiny](http://shiny.rstudio.com). You can install it from `github`.

```r
library(devtools)
install_github('rstudio/htmltools')
install_github('ramnathv/htmlwidgets')
```

### Philosophy

The basic philosophy of the `htmlwidgets` package is convention over configuration. By following a small set of easy-to-follow conventions, it is possible to create html widgets with very little code. Let me explain this by developing a html widget for [jquery Knob](http://anthonyterrien.com/knob/).

Any HTML widget consists of three pieces

1. Dependencies
2. HTML 
3. On Ready Script
4. R Function

#### Dependencies

Dependencies are the javascript and stylesheet files used by a widget. The `htmltools` package provides a simple and compact way to specify dependencies using an R function. `htmlwidgets` uses a YAML configuration file to achieve the same. 

```yaml
dependencies:
  - name: jquery
    version: 2.1.1
    src: "lib/jquery/dist"
    script: jquery.min.js
  - name: knob
    version: 1.0.1
    src: "lib/knob/dist"
    script: jquery.knob.min.js
```

By default, the `htmlwidgets` package requires the YAML file to have the same name as the package containing the widget being developed. So we will name it `knob.yaml` and place it in the `inst` folder of the [knob] package.

#### HTML

The `htmlwidgets` package provides an S3 method named `widget_div` that defines the HTML required by a widget. In most cases, the generic method would be sufficient. But the `knob` widget uses an `input` tag instead of a `div`. So we  would need to write an S3 method for the `knob` class.

```r
#' @export
widget_div.knob <- function(x, id, style, class){
  tags$input(type = "text", class = class, id = id)
}
```

#### On Ready Script

The final piece in the puzzle is the javascript that needs to be inserted in the HTML that will activate the widget. By convention, we save this in a file named `knob.js` again in the `inst` folder.

The `htmlwidgets` package is setup such that all data passed to a widget is passed on to the HTML as a JSON object called `payload`. So when the widget is not being used as a part of a Shiny application, we pass the payload to the `renderKnob` function which draws the knob. When used as a part of a Shiny application, the payload data is returned from the server side directly.

```js
if (window.Shiny == undefined){
  renderKnob('#' + payload.id, payload)
} else {
// This output binding handles statusOutputBindings
  var knobOutputBinding = new Shiny.OutputBinding();
  $.extend(knobOutputBinding, {
    find: function(scope) {
      return scope.find('.knob_output');
    },
    renderValue: renderKnob
  });
  Shiny.outputBindings.register(knobOutputBinding, 'dashboard.knobOutputBinding');
}

function renderKnob(el, data){
  if (!$(el).val()){
    $(el).knob()
  }
  $(el).val(data.value).trigger('change')
  $(el).trigger('configure', data)
}
```

#### R Function

Finally, we need to define R functions that the user can use to specify the widget. The R function simply accepts a set of arguments, creates a list, and adds appropriate class attributes, that will allow the `htmlwidgets` package to do its magic!

```r
#' @export
knob <- function(title, value, min, max, width = NULL, height = NULL, ...){
  params = list(title = title, value = value, min = min, max = max,
    width = width, height = height, ...               
  )
  params = Filter(Negate(is.null), params)
  structure(params, class = c('knob', 'htmlwidget'))
}
```

We also define a `knobOutput` function using the generic `widgetOutput` function in `htmlwidgets` that allows it to be used in a shiny application on the UI side.

```
#' @export
knobOutput <- htmlwidgets::widgetOutput('knob')
```

That is all there is! With these four pieces, we have an HTML widget that is ready to go! You can install the [knob](http://github.com/ramnathv/knob) widget from github.

```r
install_github('ramnathv/knob')
```

Let us first create a simple knob.

```r
library(knob)
k1 = knob('Test', 20, 0, 100, angleArc = 250, angleOffset = -125, 
  fgColor = "#66CC66"
)
k1
```

![knob1](http://i.imgur.com/2wekMlK.png)

We can also use it in a Shiny application.

```r
library(shiny)
library(htmlwidgets)
library(knob)
ui = bootstrapPage(
  tags$style('body{margin-left:40px; margin-top:40px;}'),
  sliderInput('value', 'Value', 0, 200, 50),
  sliderInput('angleArc', 'Arc Angle', 0, 360, 250),
  knobOutput('live_gauge', width = 250, height = 200)
)
server = function(input, output, session){
  output$live_gauge <- renderWidget(list(
    title = 'My Gauge',
    min = 0,
    value = input$value,
    angleArc = input$angleArc,
    max = 200
  ))
}

runApp(list(ui = ui, server = server))
```

![knob2](http://i.imgur.com/f9p07hI)


#### Credits

This package is highly inspired by the [justgage](http://github.com/jjallaire/justgage) package under development by JJ of [RStudio](http://rstudio.com). I have used several functions from his package, some verbatim, some with minor tweaks, aimed at providing the plumbing required to create HTML widgets with ease.

