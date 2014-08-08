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
    widget_dependencies(class(x)[1], attr(x, 'package'))
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
                         package = name) {  
  structure(
    list(x = x,
         width = width,
         height = height,
         sizingPolicy = sizingPolicy), 
    class = c(name, 
              if (sizingPolicy$viewer$suppress) "suppress_viewer", 
              "htmlwidget"),
    package = package
  )
}


#' Create a shiny output function for a widget
#' 
#' @export
makeShinyOutput <- function(name, 
                            package = name, 
                            defaultWidth = "100%", 
                            defaultHeight = "400px") {  
  dependencies = widget_dependencies(name, package)

  # shiny output function (defaults are injected below via formals)
  output <- function(outputId, width, height) {
    
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
    htmltools::attachDependencies(html, dependencies)
  }
  
  # fixup formals so roxygen inherits the right default arguments
  formals(output)$width <- substitute(defaultWidth)
  formals(output)$height <- substitute(defaultHeight)
  
  # return the function
  output
}


#' Create a shiny render function for a widget 
#' 
#' @export
makeShinyRender <- function(outputFunction) {
  
  force(outputFunction)
  
  function(expr, env = parent.frame(), quoted = FALSE) {
    
    # ensure that quoted is always true (required for correct handling of expr)
    if (!quoted) {
      expr <- substitute(expr)
      quoted <- TRUE
    }
    
    # generate a function for the expression
    func <- shiny::exprToFunction(expr, env, quoted)
    
    # create the render function
    renderFunc <- function() .subset2(func(), "x")
    
    # mark it with the output function so we can use it in Rmd files
    shiny::markRenderFunction(outputFunction, function() .subset2(func(), "x"))
  }  
}


