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
widgetOutput <- function(x){
  if (is.character(x)) {
    cx <- structure(class = c(x, 'htmlwidget'), list(value = 10))
    className <- x
  } else {
    cx <- x
    className <- class(cx)[[1]]
  }
  
  function(outputId, width, height){
    html <- htmltools::tagList(
      widget_html(cx, id = outputId, class = paste(className, "html-widget html-widget-output"), 
        style = sprintf("width:%dpx; height:%dpx", width, height),
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
    return(data)
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
widget_data.default <- function(x, id, ...){
  tags$script(type="application/json", `data-for` = id,
    HTML(toJSON(x, collapse = ""))
  )
}
