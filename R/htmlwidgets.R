#' @export
print.htmlwidget <- function(x, ...) {
  print(htmltools::as.tags(x))
}

#' @export
as.tags.htmlwidget <- function(x) {
  toHTML(x, 450, 350)
}


#' @export
knit_print.htmlwidget <- function(x, ..., options) {
  knit_print(
    toHTML(x, options$out.width.px, options$out.height.px),
    options = options, 
    ...
  )
}

#' @export
toHTML <- function(x, ...){
  UseMethod('toHTML')
}

#' @export
toHTML.htmlwidget <- function(x, defaultWidth, defaultHeight){
  id <- paste("htmlwidget", as.integer(stats::runif(1, 1, 10000)), sep="-")
  
  width <- if (is.null(x$width)) defaultWidth else x$width
  height <- if (is.null(x$height)) defaultHeight else x$height
  
  # create a style attribute for the width and height
  style <- paste("width:", width, "px;height:", height, "px;", sep = "")
  
  x$id = id
  
  html <- htmltools::tagList(
    widget_html(x, id = id, style = style, class = class(x)[1]),
    widget_data(x, id)
  )
  
  html <- htmltools::attachDependencies(html, widget_dependencies(x))
  
  htmltools::browsable(html)
  
}

#' @export
widgetOutput <- function(x){
  function(outputId, width, height){
    cx = structure(class = c(x, 'htmlwidget'), list(value = 10))
    html <- htmltools::tagList(
      widget_html(cx, id = outputId, class = paste(x, "html-widget html-widget-output"), 
        style = sprintf("width:%dpx; height:%dpx", width, height)
      )
    )
    dependencies = widget_dependencies(cx)
    htmltools::attachDependencies(html, dependencies)
  }
}

#' @export
renderWidget <- function(expr, env = parent.frame(), quoted = FALSE){
  func <- shiny::exprToFunction(expr, env, quoted)
  function(){
    data <- unclass(func())
    return(data)
  }
}


#' @export
widget_html <- function(x, id, style, class){
  UseMethod('widget_html')
}

#' @export
widget_html.htmlwidget <- function(x, id, style, class){
  tags$div(id = id, style = style, class = class)
}

#' @export
widget_dependencies <- function(x){
  UseMethod('widget_dependencies')
}


#' @export
widget_dependencies.htmlwidget <- function(x){
  lib = class(x)[1]
  jsfile = attr(x, "jsfile") %||% sprintf('%s.js', lib)
  config = attr(x, "config") %||% sprintf('%s.yaml', lib)
  package = attr(x, "package") %||% lib
  widgetDep <- getDependency(config, package)
  
  # TODO: The binding JS file should really be in its own directory to prevent
  # htmltools from picking up the entire package
  bindingDep <- htmlDependency(paste0(lib, "-binding"), packageVersion(package),
    system.file(package = package),
    script = jsfile
  )
  
  c(
    list(htmlDependency("htmlwidgets", packageVersion("htmlwidgets"),
      src = system.file("www", package="htmlwidgets"),
      script = "htmlwidgets.js"
    )),
    widgetDep,
    list(bindingDep)
  )
}

# Generates a <script type="application/json"> tag with the JSON-encoded data,
# to be picked up by htmlwidgets.js for static rendering.
#' @export
widget_data <- function(x, id, ...){
  UseMethod('widget_data')
}

#' @export
widget_data.htmlwidget <- function(x, id, ...){
  tags$script(type="application/json", `data-for` = id,
    HTML(RJSONIO::toJSON(x))
  )
}
