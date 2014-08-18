#' @export
print.htmlwidget <- function(x, ...) {
 
  # if we have a viewer then forward viewer pane height (if any)
  viewer <- getOption("viewer")
  if (!is.null(viewer)) {
    viewerFunc <- function(url) {
      
      # get the requested pane height (it defaults to NULL)
      paneHeight <- x$sizingPolicy$viewer$paneHeight
      
      # convert maximize to -1 for compatibility with older versions of rstudio
      # (newer versions convert 'maximize' to -1 interally, older versions
      # will simply ignore the height if it's less than zero)
      if (identical(paneHeight, "maximize")) 
        paneHeight <- -1 
      
      # call the viewer
      viewer(url, height = paneHeight)
    }
  } else {
    viewerFunc <- utils::browseURL
  }
  
  # call html_print with the viewer
  html_print(htmltools::as.tags(x, standalone=TRUE), viewer = viewerFunc)
  
  # return value
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
      widget_html(name = class(x)[1], id = id, style = style, 
        class = class(x)[1], width = sizeInfo$width, 
        height = sizeInfo$height
      )
    ),
    widget_data(x, id),
    if (!is.null(sizeInfo$runtime)) {
      tags$script(type="application/htmlwidget-sizing", `data-for` = id,
        toJSON(sizeInfo$runtime, collapse="")
      )
    }
  )
  html <- htmltools::attachDependencies(html, 
    c(widget_dependencies(class(x)[1], attr(x, 'package')),
      x$dependencies)
  )
  
  htmltools::browsable(html)
  
}


#' @export
widget_html <- function(name, id, style, class, ...){
  fn = paste0(name, "_html")
  if(exists(fn) && is.function(match.fun(fn))){
    match.fun(fn)(id = id, style = style, class = class, ...)
  } else {
    tags$div(id = id, style = style, class = class)
  }
}

#' @export
widget_dependencies <- function(name, package){
  getDependency(name, package)
}

# Generates a <script type="application/json"> tag with the JSON-encoded data,
# to be picked up by htmlwidgets.js for static rendering.
#' @export
widget_data <- function(x, id, ...){
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
                         dependencies = NULL) {
  
  # Turn single dependency object into list of dependencies, if necessary
  if (inherits(dependencies, "html_dependency"))
    dependencies <- list(dependencies)
  
  structure(
    list(x = x,
         width = width,
         height = height,
         sizingPolicy = sizingPolicy,
         dependencies = dependencies), 
    class = c(name, 
              if (sizingPolicy$viewer$suppress) "suppress_viewer", 
              "htmlwidget"),
    package = package
  )
}


#' Shiny output function for an htmlwidget
#' 
#' @export
shinyWidgetOutput <- function(outputId, name, width, height, package = name) {
 
  # generate html
  html <- htmltools::tagList(
    widget_html(name, id = outputId, 
      class = paste(name, "html-widget html-widget-output"), 
      style = sprintf("width:%s; height:%s", 
        htmltools::validateCssUnit(width), 
        htmltools::validateCssUnit(height)
      ), width = width, height = height
    )
  )
  
  # attach dependencies
  dependencies = widget_dependencies(name, package)
  htmltools::attachDependencies(html, dependencies)
}


#' Shiny render function for an htmlwidget 
#' 
#' @export
shinyRenderWidget <- function(expr, outputFunction, env, quoted) {
  
  # generate a function for the expression
  func <- shiny::exprToFunction(expr, env, quoted)
  
  # create the render function
  renderFunc <- function() {
    instance <- func()
    x <- .subset2(instance, "x")
    deps <- .subset2(instance, "dependencies")
    deps <- lapply(
      htmltools::resolveDependencies(deps),
      shiny::createWebDependency
    )
    list(x = x, deps = deps)
  }
  
  # mark it with the output function so we can use it in Rmd files
  shiny::markRenderFunction(outputFunction, renderFunc)
}


