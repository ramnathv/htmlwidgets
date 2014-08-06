#' @export
print.htmlwidget <- function(x, ...) {
  print(browsable(htmltools::as.tags(x, standalone=TRUE)), ...)
  invisible(x)
}

#' @export
print.suppress_viewer <- function(x) {
  html_print(htmltools::as.tags(x, standalone=TRUE), viewer = browseURL)
  invisible(x)
}

#' @S3method as.tags htmlwidget
as.tags.htmlwidget <- function(x, standalone = FALSE) {
  toHTML(x, standalone = standalone)
}


#' @export
toHTML <- function(x, ...){
  UseMethod('toHTML')
}

#' @export
toHTML.htmlwidget <- function(x, standalone = FALSE, knitrOptions = NULL, ...){
  
  sizeInfo <- resolveSizing(x, x$sizingPolicy, standalone = standalone, knitrOptions = knitrOptions)
  
  id <- paste("htmlwidget", as.integer(stats::runif(1, 1, 10000)), sep="-")
  
  w <- validateCssUnit(sizeInfo$width)
  h <- validateCssUnit(sizeInfo$height)
  
  # create a style attribute for the width and height
  style <- paste(
    "width:", w, ";",
    "height:", h, ";",
    sep = "")
  
  x$id <- id
  
  container <- if (isTRUE(standalone)) {
    function(x) {
      div(id="htmlwidget_container", x)
    }
  } else {
    identity
  }
  
  html <- htmltools::tagList(
    container(
      widget_html(x, id = id, style = style, class = class(x)[1],
        width = sizeInfo$width, height = sizeInfo$height
      )
    ),
    widget_data(x, id),
    if (!is.null(sizeInfo$runtime)) {
      tags$script(type="application/htmlwidget-sizing", `data-for` = id,
        toJSON(sizeInfo$runtime, collapse="")
      )
    }
  )
  
  html <- htmltools::attachDependencies(html, widget_dependencies(x))
  
  htmltools::browsable(html)
  
}

#' @export
widgetOutput <- function(x, ...){
  if (is.character(x)) {
    cx <- createWidget(name = x, list(), ...)
    className <- x
  } else {
    cx <- x
    className <- class(cx)[[1]]
  }
  
  function(outputId, width, height){
    html <- htmltools::tagList(
      widget_html(cx, id = outputId, class = paste(className, "html-widget html-widget-output"), 
        style = sprintf("width:%s; height:%s", 
                        htmltools::validateCssUnit(width), 
                        htmltools::validateCssUnit(height)), 
        width = width, height = height
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
    return(data$x)
  }
}


#' @export
widget_html <- function(x, id, style, class, width, height, ...){
  UseMethod('widget_html')
}

#' @export
widget_html.htmlwidget <- function(x, id, style, class, ...){
  tags$div(id = id, style = style, class = class)
}

#' @export
widget_dependencies <- function(x){
  UseMethod('widget_dependencies')
}


#' @export
widget_dependencies.htmlwidget <- function(x){
  lib = class(x)[1]
  jsfile = attr(x, "jsfile", exact = TRUE) %||% sprintf('%s.js', lib)
  config = attr(x, "config", exact = TRUE) %||% sprintf('%s.yaml', lib)
  package = attr(x, "package", exact = TRUE) %||% lib
  getDependency(lib, package, config, jsfile)
}

# Generates a <script type="application/json"> tag with the JSON-encoded data,
# to be picked up by htmlwidgets.js for static rendering.
#' @export
widget_data <- function(x, id, ...){
  UseMethod('widget_data')
}

#' @export
widget_data.default <- function(x, id, ...){
  tags$script(type="application/json", `data-for` = id,
    HTML(toJSON(x$x, collapse = ""))
  )
}

#' @export
createWidget <- function(name, 
                         x,
                         width = NULL,
                         height = NULL,
                         sizingPolicy = htmlwidgets::sizingPolicy(), 
                         package = name, 
                         config = sprintf("htmlwidgets/%s.yaml", name), 
                         jsfile = sprintf("htmlwidgets/%s.js", name)) {  
  structure(
    list(x = x,
         width = width,
         height = height,
         sizingPolicy = sizingPolicy), 
    class = c(name, 
              if (sizingPolicy$viewer.suppress) "suppress_viewer", 
              "htmlwidget"),
    package = package,
    config = config,
    jsfile = jsfile
  )
}

