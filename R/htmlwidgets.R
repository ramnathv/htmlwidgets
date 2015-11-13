#' @export
print.htmlwidget <- function(x, ..., view = interactive()) {

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
  html_print(htmltools::as.tags(x, standalone=TRUE), viewer = if (view) viewerFunc)

  # return value
  invisible(x)
}

#' @export
print.suppress_viewer <- function(x, ..., view = interactive()) {
  html_print(htmltools::as.tags(x, standalone=TRUE), viewer = if (view) browseURL)
  invisible(x)
}

#' @method as.tags htmlwidget
#' @export
as.tags.htmlwidget <- function(x, standalone = FALSE) {
  toHTML(x, standalone = standalone)
}


toHTML <- function(x, standalone = FALSE, knitrOptions = NULL) {

  sizeInfo <- resolveSizing(x, x$sizingPolicy, standalone = standalone, knitrOptions = knitrOptions)

  if (!is.null(x$elementId))
    id <- x$elementId
  else
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
      widget_html(
        name = class(x)[1],
        package = attr(x, "package"),
        id = id,
        style = style,
        class = class(x)[1],
        width = sizeInfo$width,
        height = sizeInfo$height
      )
    ),
    widget_data(x, id),
    if (!is.null(sizeInfo$runtime)) {
      tags$script(type="application/htmlwidget-sizing", `data-for` = id,
        toJSON(sizeInfo$runtime)
      )
    }
  )
  html <- htmltools::attachDependencies(html,
    c(widget_dependencies(class(x)[1], attr(x, 'package')),
      x$dependencies)
  )

  htmltools::browsable(html)

}


widget_html <- function(name, package, id, style, class, ...){

  # attempt to lookup custom html function for widget
  fn <- tryCatch(get(paste0(name, "_html"),
                     asNamespace(package),
                     inherits = FALSE),
                 error = function(e) NULL)

  # call the custom function if we have one, otherwise create a div
  if (is.function(fn)) {
    fn(id = id, style = style, class = class, ...)
  } else {
    tags$div(id = id, style = style, class = class)
  }
}

widget_dependencies <- function(name, package){
  getDependency(name, package)
}

# Generates a <script type="application/json"> tag with the JSON-encoded data,
# to be picked up by htmlwidgets.js for static rendering.
widget_data <- function(x, id, ...){
  # It's illegal for </script> to appear inside of a script tag, even if it's
  # inside a quoted string. Fortunately we know that in JSON, the only place
  # the '<' character can appear is inside a quoted string, where a Unicode
  # escape has the same effect, without confusing the browser's parser. The
  # repro for the bug this gsub fixes is to have the string "</script>" appear
  # anywhere in the data/metadata of a widget--you will get a syntax error
  # instead of a properly rendered widget.
  #
  # Another issue is that if </body></html> appears inside a quoted string,
  # then when pandoc coverts it with --self-contained, the escaping gets messed
  # up. There may be other patterns that trigger this behavior, so to be safe
  # we can replace all instances of "</" with "\\u003c/".
  payload <- toJSON(createPayload(x))
  payload <- gsub("</", "\\u003c/", payload, fixed = TRUE)
  tags$script(type = "application/json", `data-for` = id, HTML(payload))
}

#' Create an HTML Widget
#'
#' Create an HTML widget based on widget YAML and JavaScript contained within
#' the specified package.
#'
#' For additional details on developing widgets, see package vignettes:
#' \code{vignette("htmlwidgets-intro", package = "htmlwidgets")}.
#'
#' @param name Widget name (should match the base name of the YAML and
#'   JavaScript files used to implement the widget)
#' @param x Widget instance data (underlying data to render and options that
#'   govern how it's rendered). This value will be converted to JSON using
#'   \code{\link[jsonlite]{toJSON}} and made available to the widget's
#'   JavaScript \code{renderValue} function.
#' @param width Fixed width for widget (in css units). The default is
#'   \code{NULL}, which results in intelligent automatic sizing based on the
#'   widget's container.
#' @param height Fixed height for widget (in css units). The default is
#'   \code{NULL}, which results in intelligent automatic sizing based on the
#'   widget's container.
#' @param sizingPolicy Options that govern how the widget is sized in various
#'   containers (e.g. a standalone browser, the RStudio Viewer, a knitr figure,
#'   or a Shiny output binding). These options can be specified by calling the
#'   \code{\link{sizingPolicy}} function.
#' @param package Package where the widget is defined (defaults to the widget
#'   name).
#' @param dependencies Additional widget HTML dependencies (over and above those
#'   defined in the widget YAML). This is useful for dynamic dependencies that
#'   only exist when selected widget options are enabled (e.g. sets of map tiles
#'   or projections).
#' @param elementId Use an explicit element ID for the widget (rather than an
#'   automatically generated one). Useful if you have other JavaScript that
#'   needs to explicitly discover and interact with a specific widget instance.
#' @param preRenderHook A function to be run on the widget, just prior to
#'   rendering. It accepts the entire widget object as input, and should return
#'   a modified widget object.
#'
#' @return An object of class \code{htmlwidget} that will intelligently print
#'   itself into HTML in a variety of contexts including the R console, within R
#'   Markdown documents, and within Shiny output bindings.
#' @export
createWidget <- function(name,
                         x,
                         width = NULL,
                         height = NULL,
                         sizingPolicy = htmlwidgets::sizingPolicy(),
                         package = name,
                         dependencies = NULL,
                         elementId = NULL,
                         preRenderHook = NULL) {
  # Turn single dependency object into list of dependencies, if necessary
  if (inherits(dependencies, "html_dependency"))
    dependencies <- list(dependencies)
  structure(
    list(x = x,
         width = width,
         height = height,
         sizingPolicy = sizingPolicy,
         dependencies = dependencies,
         elementId = elementId,
         preRenderHook = preRenderHook),
    class = c(name,
              if (sizingPolicy$viewer$suppress) "suppress_viewer",
              "htmlwidget"),
    package = package
  )
}


#' Shiny bindings for HTML widgets
#'
#' Helpers to create output and render functions for using HTML widgets within
#' Shiny applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param name Name of widget to create output binding for
#' @param width,height Must be a valid CSS unit (like \code{"100\%"},
#'   \code{"400px"}, \code{"auto"}) or a number, which will be coerced to a
#'   string and have \code{"px"} appended.
#' @param package Package containing widget (defaults to \code{name})
#' @param outputFunction Shiny output function corresponding to this render
#'   function.
#' @param expr An expression that generates an HTML widget
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @return An output or render function that enables the use of the widget
#'   within Shiny applications.
#'
#' @details These functions are delegated to from within your widgets own shiny
#'   output and render functions. The delegation is boilerplate and always works
#'   the same for all widgets (see example below).
#'
#' @examples
#' # shiny output binding for a widget named 'foo'
#' fooOutput <- function(outputId, width = "100%", height = "400px") {
#'   htmlwidgets::shinyWidgetOutput(outputId, "foo", width, height)
#' }
#'
#' # shiny render function for a widget named 'foo'
#' renderFoo <- function(expr, env = parent.frame(), quoted = FALSE) {
#'   if (!quoted) { expr <- substitute(expr) } # force quoted
#'   htmlwidgets::shinyRenderWidget(expr, fooOutput, env, quoted = TRUE)
#' }
#' @name htmlwidgets-shiny
#'
#' @export
shinyWidgetOutput <- function(outputId, name, width, height, package = name) {

  checkShinyVersion()
  # generate html
  html <- htmltools::tagList(
    widget_html(name, package, id = outputId,
      class = paste(name, "html-widget html-widget-output"),
      style = sprintf("width:%s; height:%s;",
        htmltools::validateCssUnit(width),
        htmltools::validateCssUnit(height)
      ), width = width, height = height
    )
  )

  # attach dependencies
  dependencies = widget_dependencies(name, package)
  htmltools::attachDependencies(html, dependencies)
}


#' @rdname htmlwidgets-shiny
#' @export
shinyRenderWidget <- function(expr, outputFunction, env, quoted) {

  checkShinyVersion()
  # generate a function for the expression
  func <- shiny::exprToFunction(expr, env, quoted)

  # create the render function
  renderFunc <- function() {
    instance <- func()
    if (!is.null(instance$elementId)) {
      warning("Ignoring explicitly provided widget ID \"",
        instance$elementId, "\"; Shiny doesn't use them"
      )
    }
    deps <- .subset2(instance, "dependencies")
    deps <- lapply(
      htmltools::resolveDependencies(deps),
      shiny::createWebDependency
    )
    payload <- c(createPayload(instance), list(deps = deps))
    toJSON(payload)
  }

  # mark it with the output function so we can use it in Rmd files
  shiny::markRenderFunction(outputFunction, renderFunc)
}

checkShinyVersion <- function(error = TRUE) {
  x <- utils::packageDescription('htmlwidgets', fields = 'Enhances')
  r <- '^.*?shiny \\(>= ([0-9.]+)\\).*$'
  if (is.na(x) || length(grep(r, x)) == 0 || system.file(package = 'shiny') == '')
    return()
  v <- gsub(r, '\\1', x)
  f <- if (error) stop else packageStartupMessage
  if (utils::packageVersion('shiny') < v)
    f("Please upgrade the 'shiny' package to (at least) version ", v)
}

# Helper function to create payload
createPayload <- function(instance){
  if (!is.null(instance$preRenderHook)){
    instance <- instance$preRenderHook(instance)
    instance$preRenderHook <- NULL
  }
  x <- .subset2(instance, "x")
  list(x = x, evals = JSEvals(x))
}

