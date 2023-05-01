# @staticimports pkg:staticimports
#  is_installed get_package_version system_file
#  s3_register register_upgrade_message
#  %||%


# Copied from shiny 0.14.2
toJSON2 <- function(
  x, ...,  dataframe = "columns", null = "null", na = "null", auto_unbox = TRUE,
  digits = getOption("shiny.json.digits", 16), use_signif = TRUE, force = TRUE,
  POSIXt = "ISO8601", UTC = TRUE, rownames = FALSE, keep_vec_names = TRUE,
  strict_atomic = TRUE
) {
  if (strict_atomic) x <- I(x)
  jsonlite::toJSON(
    x, dataframe = dataframe, null = null, na = na, auto_unbox = auto_unbox,
    digits = digits, use_signif = use_signif, force = force, POSIXt = POSIXt,
    UTC = UTC, rownames = rownames, keep_vec_names = keep_vec_names,
    json_verbatim = TRUE, ...
  )
}

toJSON <- function(x) {
  if (!is.list(x) || !('x' %in% names(x))) return(toJSON2(x))
  func <- attr(x$x, 'TOJSON_FUNC', exact = TRUE)
  args <- attr(x$x, 'TOJSON_ARGS', exact = TRUE)
  if (length(args) == 0) args <- getOption('htmlwidgets.TOJSON_ARGS')
  if (!is.function(func)) func <- toJSON2
  res <- if (length(args) == 0) func(x) else do.call(func, c(list(x = x), args))
  # make sure shiny:::toJSON() does not encode it again
  structure(res, class = 'json')
}

#' Get js and css dependencies for  a htmlwidget
#'
#' @param name name of the widget.
#' @param package name of the package, defaults to the widget name.
#' @export
getDependency <- function(name, package = name){
  config = sprintf("htmlwidgets/%s.yaml", name)
  jsfile = sprintf("htmlwidgets/%s.js", name)

  # if yaml does not exist then assume no dependencies
  #  in this cases dependencies should be provided through the
  #  dependencies argument of createWidget
  widgetDep <- list()
  yaml_file <- system_file(config, package = package)
  if (file.exists(yaml_file)) {
    config = yaml::yaml.load_file(yaml_file)
    widgetDep <- lapply(config$dependencies, function(l) {
      l$package = package
      do.call(htmlDependency, l)
    })
  }

  # if js binding does not exist then assume provided through
  #  some other mechanism such as a specified `htmlDependency` or `script` tag.
  #  Note, this is a very special case.
  bindingDep <- if (file.exists(system_file(jsfile, package = package))) {
    htmlDependency(
      name = paste0(name, "-binding"),
      version = get_package_version(package),
      src = "htmlwidgets",
      package = package,
      script = basename(jsfile),
      all_files = FALSE
    )
  }

  c(
    list(htmlDependency(
      name = "htmlwidgets",
      version = get_package_version("htmlwidgets"),
      src = "www",
      package = "htmlwidgets",
      script = "htmlwidgets.js"
    )),
    widgetDep,
    list(bindingDep)
  )
}


prop <- function(x, path) {
  tryCatch({
    for (i in strsplit(path, "$", fixed = TRUE)[[1]]) {
      if (is.null(x))
        return(NULL)
      x <- x[[i]]
    }
    return(x)
  }, error = function(e) {
    return(NULL)
  })
}

any_prop <- function(scopes, path) {
  for (scope in scopes) {
    result <- prop(scope, path)
    if (!is.null(result))
      return(result)
  }
  return(NULL)
}

#' Mark character strings as literal JavaScript code
#'
#' This function \code{JS()} marks character vectors with a special class, so
#' that it will be treated as literal JavaScript code when evaluated on the
#' client-side.
#' @param ... character vectors as the JavaScript source code (all arguments
#'   will be pasted into one character string)
#' @author Yihui Xie
#' @export
#' @examples library(htmlwidgets)
#' JS('1 + 1')
#' list(x = JS('function(foo) {return foo;}'), y = 1:10)
#' JS('function(x) {', 'return x + 1;', '}')
JS <- function(...) {
  x <- c(...)
  if (is.null(x)) return()
  if (!is.character(x))
    stop("The arguments for JS() must be a character vector")
  x <- paste(x, collapse = '\n')
  structure(x, class = unique(c("JS_EVAL", oldClass(x))))
}

#' Creates a list of keys whose values need to be evaluated on the client-side
#'
#' It works by transforming \code{list(foo = list(1, list(bar =
#' I('function(){}')), 2))} to \code{list("foo.2.bar")}. Later on the JS side,
#' the \code{window.HTMLWidgets.evaluateStringMember} function is called with
#' the JSON object and the "foo.2.bar" string, which is split to \code{['foo',
#' '2', 'bar']}, and the string at that location is replaced \emph{in-situ} with
#' the results of evaluating it. Note '2' (character) should have been 2
#' (integer) but it does not seem to matter in JS: x[2] is the same as x['2']
#' when all child members of x are unnamed, and ('2' in x) will be true even if
#' x is an array without names. This is a little hackish.
#'
#' This function is intended mostly for internal use. There's generally no need
#' for widget authors or users to call it, as it's called automatically on the
#' widget instance data during rendering. It's exported in case other packages
#' want to add support for \code{\link{JS}} in contexts outside of widget
#' payloads.
#'
#' @param list a list in which the elements that should be evaluated as
#'   JavaScript are to be identified
#' @author Yihui Xie
#' @keywords internal
#' @export
JSEvals <- function(list) {
  # the `%||% list()` part is necessary as of R 3.4.0 (April 2017) -- if `evals`
  # is NULL then `I(evals)` results in a warning in R 3.4.0. This is circumvented
  # if we let `evals` be equal to `list()` in those cases
  evals <- names(which(unlist(shouldEval(list)))) %||% list()
  I(evals)  # need I() to prevent toJSON() from converting it to scalar
}

#' JSON elements that are character with the class JS_EVAL will be evaluated
#'
#' @noRd
#' @keywords internal
shouldEval <- function(options) {
  if (is.list(options)) {
    if ((n <- length(options)) == 0) return(FALSE)
    # use numeric indices as names (remember JS indexes from 0, hence -1 here)
    if (is.null(names(options)))
      names(options) <- as.character(seq_len(n) - 1L)
    # Escape '\' and '.' by prefixing them with '\'. This allows us to tell the
    # difference between periods as separators and periods that are part of the
    # name itself.
    names(options) <- gsub("([\\.])", "\\\\\\1", names(options))
    nms <- names(options)
    if (length(nms) != n || any(nms == ''))
      stop("'options' must be a fully named list, or have no names (NULL)")
    lapply(options, shouldEval)
  } else {
    is.character(options) && inherits(options, 'JS_EVAL')
  }
}
# JSEvals(list(list(foo.bar=JS("hi"), baz.qux="bye"))) == "0.foo\\.bar"

#' Execute JavaScript code after static render
#'
#' Convenience function for wrapping a JavaScript code string with a
#' \code{<script>} tag and the boilerplate necessary to delay the execution of
#' the code until after the next time htmlwidgets completes rendering any
#' widgets that are in the page. This mechanism is designed for running code to
#' customize widget instances, which can't be done at page load time since the
#' widget instances will not have been created yet.
#'
#' Each call to \code{onStaticRenderComplete} will result in at most one
#' invocation of the given code. In some edge cases in Shiny, it's possible for
#' static rendering to happen more than once (e.g. a \code{renderUI} that
#' contains static HTML widgets). \code{onStaticRenderComplete} calls only
#' schedule execution for the next static render operation.
#'
#' The pure JavaScript equivalent of \code{onStaticRenderComplete} is
#' \code{HTMLWidgets.addPostRenderHandler(callback)}, where \code{callback} is a
#' JavaScript function that takes no arguments.
#'
#' @param jsCode A character vector containing JavaScript code. No R error will
#'   be raised if the code is invalid, not even on JavaScript syntax errors.
#'   However, the web browser will throw errors at runtime.
#' @return An htmltools \code{\link[htmltools]{tags}$script} object.
#'
#' @examples
#' \dontrun{
#' library(leaflet)
#' library(htmltools)
#' library(htmlwidgets)
#'
#' page <- tagList(
#'   leaflet() %>% addTiles(),
#'   onStaticRenderComplete(
#'     "HTMLWidgets.find('.leaflet').setZoom(4);"
#'   )
#' )
#' print(page, browse = TRUE)
#' }
#'
#' @export
onStaticRenderComplete <- function(jsCode) {
  tags$script(
    "HTMLWidgets.addPostRenderHandler(function() {",
    HTML(paste0(jsCode, collapse = "\n")),
    "});"
  )
}
