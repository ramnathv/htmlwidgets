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

  viewer <- if (view) {
    if (isTRUE(x$sizingPolicy$browser$external)) {
      browseURL
    } else if (!is.null(getOption("page_viewer"))) {
      function(url) getOption("page_viewer")(url)
    } else {
      browseURL
    }
  } else {
    NULL
  }

  html_print(htmltools::as.tags(x, standalone=TRUE), viewer = viewer)
  invisible(x)
}

#' @method as.tags htmlwidget
#' @export
as.tags.htmlwidget <- function(x, standalone = FALSE) {
  toHTML(x, standalone = standalone)
}

#' Prepend/append extra HTML content to a widget
#'
#' Use these functions to attach extra HTML content (primarily JavaScript and/or
#' CSS styles) to a widget, for rendering in standalone mode (i.e. printing at
#' the R console) or in a knitr document. These functions are NOT supported when
#' running in a Shiny widget rendering function, and will result in a warning if
#' used in that context. Multiple calls are allowed, and later calls do not undo
#' the effects of previous calls.
#'
#' @param x An HTML Widget object
#' @param ... Valid \link[htmltools]{tags}, text, and/or
#'   \code{\link[htmltools]{HTML}}, or lists thereof.
#' @return A modified HTML Widget object.
#'
#' @export
prependContent <- function(x, ...) {
  x$prepend <- c(x$prepend, list(...))
  x
}

#' @rdname prependContent
#' @export
appendContent <- function(x, ...) {
  x$append <- c(x$append, list(...))
  x
}

#' Execute custom JavaScript code after rendering
#'
#' Use this function to supplement the widget's built-in JavaScript rendering
#' logic with additional custom JavaScript code, just for this specific widget
#' object.
#'
#' @param x An HTML Widget object
#' @param jsCode Character vector containing JavaScript code (see Details)
#' @param data An additional argument to pass to the \code{jsCode} function.
#'   This can be any R object that can be serialized to JSON. If you have
#'   multiple objects to pass to the function, use a named list.
#' @return The modified widget object
#'
#' @details The \code{jsCode} parameter must contain valid JavaScript code which
#'   when evaluated returns a function.
#'
#'   The function will be invoked with three arguments: the first is the widget's
#'   main HTML element, and the second is the data to be rendered (the \code{x}
#'   parameter in \code{createWidget}). The third argument is the JavaScript
#'   equivalent of the R object passed into \code{onRender} as the \code{data}
#'   argument; this is an easy way to transfer e.g. data frames without having
#'   to manually do the JSON encoding.
#'
#'   When the function is invoked, the \code{this} keyword will refer to the
#'   widget instance object.
#'
#' @seealso \code{\link{onStaticRenderComplete}}, for writing custom JavaScript
#'   that involves multiple widgets.
#'
#' @examples
#' \dontrun{
#' library(leaflet)
#'
#' # This example uses browser geolocation. RStudio users:
#' # this won't work in the Viewer pane; try popping it
#' # out into your system web browser.
#' leaflet() %>% addTiles() %>%
#'   onRender("
#'     function(el, x) {
#'       // Navigate the map to the user's location
#'       this.locate({setView: true});
#'     }
#'   ")
#'
#'
#' # This example shows how you can make an R data frame available
#' # to your JavaScript code.
#'
#' meh <- "&#x1F610;";
#' yikes <- "&#x1F628;";
#'
#' df <- data.frame(
#'   lng = quakes$long,
#'   lat = quakes$lat,
#'   html = ifelse(quakes$mag < 5.5, meh, yikes),
#'   stringsAsFactors = FALSE
#' )
#'
#' leaflet() %>% addTiles() %>%
#'   fitBounds(min(df$lng), min(df$lat), max(df$lng), max(df$lat)) %>%
#'   onRender("
#'     function(el, x, data) {
#'       for (var i = 0; i < data.lng.length; i++) {
#'         var icon = L.divIcon({className: '', html: data.html[i]});
#'         L.marker([data.lat[i], data.lng[i]], {icon: icon}).addTo(this);
#'       }
#'     }
#'   ", data = df)
#' }
#'
#' @export
onRender <- function(x, jsCode, data = NULL) {
  addHook(x, "render", jsCode, data)
}

addHook <- function(x, hookName, jsCode, data = NULL) {
  if (length(jsCode) == 0)
    return(x)

  if (length(jsCode) > 1)
    jsCode <- paste(jsCode, collapse = "\n")

  x$jsHooks[[hookName]] <- c(x$jsHooks[[hookName]], list(list(code = jsCode, data = data)))
  x
}


toHTML <- function(x, standalone = FALSE, knitrOptions = NULL) {

  sizeInfo <- resolveSizing(x, x$sizingPolicy, standalone = standalone, knitrOptions = knitrOptions)

  if (!is.null(x$elementId))
    id <- x$elementId
  else
    id <- paste("htmlwidget", createWidgetId(), sep="-")

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
      htmltools::tagList(
        x$prepend,
        widget_html(
          name = class(x)[1],
          package = attr(x, "package"),
          id = id,
          style = style,
          class = paste(class(x)[1], "html-widget"),
          width = sizeInfo$width,
          height = sizeInfo$height
        ),
        x$append
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

lookup_func <- function(name, package) {
  tryCatch(
    get(name, asNamespace(package), inherits = FALSE),
    error = function(e) NULL
  )
}

lookup_widget_html_method <- function(name, package) {
  # There are two ways we look for custom widget html container methods:
  #
  # PACKAGE:::widget_html.NAME - This is the newer, preferred lookup. Note that
  # it doesn't actually use S3 dispatch, because we don't have an S3 object to
  # dispatch with (widget_html can be called without a widget instance existing
  # yet).
  #
  # PACKAGE:::NAME_html - This is the original, legacy lookup. This is not
  # preferred because it's not unique enough, i.e. someone could happen to have
  # a function with this name that's not intended for widget_html use. However,
  # we have to keep it for now, for backward compatibility.

  fn_name <- paste0("widget_html.", name)
  fn <- lookup_func(fn_name, package)
  if (!is.null(fn)) {
    return(list(fn = fn, name = fn_name, legacy = FALSE))
  }

  fn_name <- paste0(name, "_html")
  fn <- lookup_func(fn_name, package)
  if (!is.null(fn)) {
    return(list(fn = fn, name = fn_name, legacy = TRUE))
  }

  list(fn = widget_html.default, name = "widget_html.default", legacy = FALSE)
}

widget_html <- function (name, package, id, style, class, inline = FALSE, ...) {

  fn_info <- lookup_widget_html_method(name, package)

  fn <- fn_info[["fn"]]
  # id, style, and class have been required args for years, but inline is fairly new
  # and undocumented, so unsuprisingly there are widgets out there are don't have an
  # inline arg https://github.com/renkun-ken/formattable/blob/484777/R/render.R#L79-L88
  args <- list(id = id, style = style, class = class, ...)
  if ("inline" %in% names(formals(fn))) {
    args$inline <- inline
  }
  fn_res <- do.call(fn, args)
  if (isTRUE(fn_info[["legacy"]])) {
    # For the PACKAGE:::NAME_html form (only), we worry about false positives;
    # hopefully false positives will return something that doesn't look like a
    # Shiny tag/html and they'll get this warning as a hint
    if (!inherits(fn_res, c("shiny.tag", "shiny.tag.list", "html"))) {
      warning(fn_info[["name"]], " returned an object of class `", class(fn_res)[1],
        "` instead of a `shiny.tag`."
      )
    }
  }

  fn_res
}

widget_html.default <- function (name, package, id, style, class, inline = FALSE, ...) {
  if (inline) {
    tags$span(id = id, style = style, class = class)
  } else {
    tags$div(id = id, style = style, class = class)
  }
}

## These functions are to support unit tests #######################

widgetA_html <- function(name, package, id, style, class, inline = FALSE, ...) {
  tags$canvas(id = id, class = class, style = style)
}

widgetB_html <- function(name, package, id, style, class, inline = FALSE, ...) {
  # Return a non-HTML result
  TRUE
}

widgetC_html <- function(name, package, id, style, class, inline = FALSE, ...) {
  tags$strong(id = id, class = class, style = style)
}

widget_html.widgetC <- function(name, package, id, style, class, inline = FALSE, ...) {
  tags$em(id = id, class = class, style = style)
}

widget_html.widgetD <- function(name, package, id, style, class, inline = FALSE, ...) {
  TRUE
}

widgetE_html <- function(name, package, id, style, class, inline = FALSE, ...) {
  tagList(tags$div(id = id, style = style, class = class))
}

widgetF_html <- function(name, package, id, style, class, inline = FALSE, ...) {
  HTML(as.character(tags$div(id = id, style = style, class = class)))
}

## End unit test support functions #################################

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
#' \code{vignette("develop_intro", package = "htmlwidgets")}.
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
         preRenderHook = preRenderHook,
         jsHooks = list()),
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
#' @param inline use an inline (\code{span()}) or block container (\code{div()})
#' for the output
#' @param outputFunction Shiny output function corresponding to this render
#'   function.
#' @param reportSize Should the widget's container size be reported in the
#'   shiny session's client data?
#' @param reportTheme Should the widget's container styles (e.g., colors and fonts)
#' be reported in the shiny session's client data?
#' @param expr An expression that generates an HTML widget (or a
#'   \href{https://rstudio.github.io/promises/}{promise} of an HTML widget).
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#' @param cacheHint Extra information to use for optional caching using
#'   \code{shiny::bindCache()}.
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
shinyWidgetOutput <- function(outputId, name, width, height, package = name,
                              inline = FALSE, reportSize = FALSE, reportTheme = FALSE) {

  checkShinyVersion()

  # Theme reporting requires this shiny feature
  # https://github.com/rstudio/shiny/pull/2740/files
  if (reportTheme &&
      nzchar(system.file(package = "shiny")) &&
      packageVersion("shiny") < "1.4.0.9003") {
    message("`reportTheme = TRUE` requires shiny v.1.4.0.9003 or higher. Consider upgrading shiny.")
  }

  # generate html
  html <- htmltools::tagList(
    widget_html(
      name, package, id = outputId,
      class = paste0(
        name, " html-widget html-widget-output",
        if (reportSize) " shiny-report-size",
        if (reportTheme) " shiny-report-theme"
      ),
      style = sprintf("width:%s; height:%s; %s",
        htmltools::validateCssUnit(width),
        htmltools::validateCssUnit(height),
        if (inline) "display: inline-block;" else ""
      ), width = width, height = height
    )
  )

  # attach dependencies
  dependencies = widget_dependencies(name, package)
  htmltools::attachDependencies(html, dependencies)
}


#' @rdname htmlwidgets-shiny
#' @export
shinyRenderWidget <- function(expr, outputFunction, env, quoted, cacheHint = "auto")  {
  checkShinyVersion()
  # generate a function for the expression
  shiny::installExprFunction(expr, "func", env, quoted)

  renderWidget <- function(instance) {
    if (!is.null(instance$elementId)) {
      warning("Ignoring explicitly provided widget ID \"",
        instance$elementId, "\"; Shiny doesn't use them"
      )
    }

    # We don't support prependContent/appendContent in dynamic Shiny contexts
    # because the Shiny equivalent of onStaticRenderComplete is unclear. If we
    # ever figure that out it would be great to support it. One possibility
    # would be to have a dedicated property for "post-render customization JS",
    # I suppose. In any case, it's less of a big deal for Shiny since there are
    # other mechanisms (that are at least as natural) for putting custom JS in a
    # Shiny app.
    if (!is.null(instance$prepend)) {
      warning("Ignoring prepended content; prependContent can't be used in a ",
        "Shiny render call")
    }
    if (!is.null(instance$append)) {
      warning("Ignoring appended content; appendContent can't be used in a ",
        "Shiny render call")
    }

    deps <- .subset2(instance, "dependencies")
    deps_payload <- lapply(
      htmltools::resolveDependencies(deps),
      shiny::createWebDependency
    )
    payload <- c(createPayload(instance), list(deps = deps_payload))
    payload <- toJSON(payload)
    attr(payload, "deps") <- deps
    payload
  }

  # The cacheHint and cacheReadHook args were added in Shiny 1.6.0.
  if (all(c("cacheHint", "cacheReadHook") %in% names(formals(shiny::createRenderFunction)))) {
    shiny::createRenderFunction(
      func,
      function(instance, session, name, ...) {
        renderWidget(instance)
      },
      outputFunction,
      NULL,
      cacheHint = cacheHint,
      cacheReadHook = function(value) {
        # If we've pulled the value from the cache and we're in a different R
        # process from the one that created it, we'll need to register the
        # dependencies again.
        deps <- attr(value, "deps")
        lapply(
          htmltools::resolveDependencies(deps),
          shiny::createWebDependency
        )
        value
      }
    )
  } else {
    shiny::createRenderFunction(
      func,
      function(instance, session, name, ...) {
        renderWidget(instance)
      },
      outputFunction,
      NULL
    )
  }

}

# For the magic behind shiny::installExprFunction()
utils::globalVariables("func")

checkShinyVersion <- function(error = TRUE) {
  x <- packageDescription('htmlwidgets', fields = 'Enhances')
  r <- '^.*?shiny \\(>= ([0-9.]+)\\).*$'
  if (is.na(x) || length(grep(r, x)) == 0 || system.file(package = 'shiny') == '')
    return()
  v <- gsub(r, '\\1', x)
  f <- if (error) stop else packageStartupMessage
  if (packageVersion('shiny') < v)
    f("Please upgrade the 'shiny' package to (at least) version ", v)
}
checkShinyVersion <- memoise::memoise(checkShinyVersion)

packageVersion <- memoise::memoise(utils::packageVersion)
packageDescription <- memoise::memoise(utils::packageDescription)

# Helper function to create payload
createPayload <- function(instance){
  if (!is.null(instance$preRenderHook)){
    instance <- instance$preRenderHook(instance)
    instance$preRenderHook <- NULL
  }
  x <- .subset2(instance, "x")
  list(x = x, evals = JSEvals(x), jsHooks = instance$jsHooks)
}

# package globals
.globals <- new.env(parent = emptyenv())
