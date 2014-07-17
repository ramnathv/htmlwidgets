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
    widget_div(x, id = id, style = style, class = class(x)[1]),
    widget_script(x)
  )
  
  html <- htmltools::attachDependencies(html, widget_dependencies(x))
  
  htmltools::browsable(html)
  
}

#' @export
widgetOutput <- function(x){
  function(outputId, width, height){
    cx = structure(class = c(x, 'htmlwidget'), list(value = 10))
    html <- htmltools::tagList(
      widget_div(cx, id = outputId, class = paste0(x, "_output"), 
        style = sprintf("width:%dpx; height:%dpx", width, height)
      ),
      widget_script(cx)
    )
    dependencies = widget_dependencies(cx)
    htmltools::attachDependencies(html, dependencies)
  }
}

#' @export
renderWidget <- function(expr, env = parent.frame(), quoted = FALSE){
  func <- shiny::exprToFunction(expr, env, quoted)
  function(){
    data <- func()
    defaults <- list(min = 0, max = 100, title = 'JustGage')
    modifyList(defaults, data)
  }
}


#' @export
widget_div <- function(x, id, style, class){
  UseMethod('widget_div')
}

#' @export
widget_div.htmlwidget <- function(x, id, style, class){
  tags$div(id = id, style = style, class = class)
}

#' @export
widget_dependencies <- function(x){
  UseMethod('widget_dependencies')
}


#' @export
widget_dependencies.htmlwidget <- function(x){
  lib = class(x)[1]
  config = attr(x, "config") %||% sprintf('%s.yaml', lib)
  package = attr(x, "package") %||% lib
  getDependency(config, package)
}

#' @export
widget_script <- function(x, ...){
  UseMethod('widget_script')
}

#' @export
widget_script.htmlwidget <- function(x){
  lib = class(x)[1]
  jsfile = attr(x, "jsfile") %||% sprintf('%s.js', lib)
  package = attr(x, "package") %||% lib
  getScript(x, jsfile, package)
}

