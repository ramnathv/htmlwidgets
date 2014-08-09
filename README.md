## htmlwidgets

`htmlwidgets` is an R package aimed at providing basic plumbing that makes it easy to develop html widgets for R. These widgets can be used to create standalone output, be embedded inside another document, or used in a [shiny](http://shiny.rstudio.com) application. You can install it from `github`.

```r
library(devtools)
install_github(c('rstudio/htmltools', 'ramnathv/htmlwidgets'))
```

### Philosophy

The basic philosophy of the `htmlwidgets` package is convention over configuration. By following a small set of easy-to-follow conventions, it is possible to create html widgets with very little code. Let me explain this by developing a html widget for [jquery Knob](http://anthonyterrien.com/knob/).

Any HTML widget consists of four components.

1. Dependencies
2. HTML
3. Javascript
4. Data

#### Dependencies

Dependencies are the javascript and stylesheet assets used by a widget. The `htmltools` package provides a simple and compact way to specify dependencies using an R function. `htmlwidgets` uses a YAML configuration file to achieve the same. 

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

The YAML file needs to be named `knob.yaml` and placed in the `inst/htmlwidgets` folder of the package.

#### HTML

The `htmlwidgets` package provides a `widget_html` function that generates a `div` element to house the widget. This is sufficient for most cases. Since the `knob` widget uses an `input` element, we will write a function `knob_html`, which will automatically override `widget_html`.

```r
knob_html <- function(name, id, style, class, ...){
  tags$input(type = "text", class = class, id = id)
}
```

#### Javascript

The third piece in the puzzle is the javascript required to activate the widget. The `renderValue` function uses the `data` that it is sent to configure and display the `knob` widget. More on how `HTMLWidgets` works will be added later.


```js
HTMLWidgets.widget({
  name: "knob",
  type: "output",
  initialize: function(el) {
    $(el).knob()
  },
  renderValue: function(el, data) {
    $(el).trigger("configure", data);
    $(el).val(data.value).trigger("change");
  }
});
```

Once again by convention, we need to save this as `inst/htmlwidgets/knob.js`.

#### Data

Finally, we need to define an R functions that will accept user inputs, return data, and render the widget. 

```r
knob <- function(title, value, min, max, width = NULL, height = NULL, ...){
  params = list(title = title, value = value, min = min, max = max,
    width = width, height = height, ...               
  )
  params = Filter(Negate(is.null), params)
  htmlwidgets::createWidget('knob', params)
}
```

To complete the proceedings, we will go ahead and define functions that will allow the `knob` widget to be used in a Shiny application or document. This is made really simple by the `makeShinyOutput` and `makeShinyRender` utility functions provided by the `htmlwidgets` package.

```r
knobOutput <- htmlwidgets::makeShinyOutput('knob')
renderKnob <- htmlwidgets::makeShinyRender('knob')
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
library(knob)
ui = bootstrapPage(
  tags$style('body{margin-left:40px; margin-top:40px;}'),
  sliderInput('value', 'Value', 0, 200, 50),
  sliderInput('angleArc', 'Arc Angle', 0, 360, 250),
  knobOutput('live_gauge', width = 250, height = 200)
)
server = function(input, output, session){
  output$live_gauge <- renderKnob(knob(
    title = 'My Gauge',
    min = 0,
    value = input$value,
    angleArc = input$angleArc,
    max = 200
  ))
}

runApp(list(ui = ui, server = server))
```


![knob2](http://i.imgur.com/f9p07hI.png)


#### Credits

This package is highly inspired by the [justgage](http://github.com/jjallaire/justgage) package under development by JJ of [RStudio](http://rstudio.com). I have used several functions from his package, some verbatim, some with minor tweaks, aimed at providing the plumbing required to create HTML widgets with ease.

