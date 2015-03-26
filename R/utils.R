# Copied from shiny 0.11.1.9003
toJSON <- function(
  x, ...,  dataframe = "columns", null = "null", na = "null", auto_unbox = TRUE,
  digits = getOption("shiny.json.digits", 16), use_signif = TRUE, force = TRUE,
  POSIXt = "ISO8601", UTC = TRUE, rownames = FALSE, keep_vec_names = TRUE,
  pretty = TRUE
) {
  jsonlite::toJSON(
    I(x), dataframe = dataframe, null = null, na = na, auto_unbox = auto_unbox,
    digits = digits, use_signif = use_signif, force = force, POSIXt = POSIXt,
    UTC = UTC, rownames = rownames, keep_vec_names = keep_vec_names,
    pretty = pretty, ...
  )
}

if (requireNamespace('shiny')) local({
  tryCatch({
    toJSON2 <- getFromNamespace('toJSON', 'shiny')
    args2 <- formals(toJSON2)
    args1 <- formals(toJSON)
    args1$pretty <- NULL  # shiny does not have pretty = TRUE for now
    if (!identical(args1, args2)) {
      warning('Check shiny:::toJSON and make sure htmlwidgets:::toJSON is in sync')
    }
  })
})

getDependency <- function(name, package = name){
  config = sprintf("htmlwidgets/%s.yaml", name)
  jsfile = sprintf("htmlwidgets/%s.js", name)

  config = yaml::yaml.load_file(
    system.file(config, package = package)
  )
  widgetDep <- lapply(config$dependencies, function(l){
    l$src = system.file(l$src, package = package)
    do.call(htmlDependency, l)
  })

  # Create a dependency that will cause the jsfile and only the jsfile (rather
  # than all of its filesystem siblings) to be copied
  bindingDir <- tempfile("widgetbinding")
  dir.create(bindingDir, mode = "0700")
  file.copy(system.file(jsfile, package = package), bindingDir)

  bindingDep <- htmlDependency(paste0(name, "-binding"), packageVersion(package),
    bindingDir,
    script = basename(jsfile)
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

`%||%` <- function(x, y){
  if (is.null(x)) y else x
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
    stop("The arguments for JS() must be a chraracter vector")
  x <- paste(x, collapse = '\n')
  structure(x, class = unique(c("JS_EVAL", oldClass(x))))
}

# Creates a list of keys whose values need to be evaluated on the client-side.
#
# It works by transforming \code{list(foo = list(1, list(bar =
# I('function(){}')), 2))} to \code{list("foo.2.bar")}. Later on the JS side, we
# will split foo.2.bar to ['foo', '2', 'bar'] and evaluate the JSON object
# member. Note '2' (character) should have been 2 (integer) but it does not seem
# to matter in JS: x[2] is the same as x['2'] when all child members of x are
# unnamed, and ('2' in x) will be true even if x is an array without names. This
# is a little hackish.
#
# @param list a list in which the elements that should be evaluated as
#   JavaScript are to be identified
# @author Yihui Xie
JSEvals <- function(list) {
  evals <- names(which(unlist(shouldEval(list))))
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
      names(options) <- seq_len(n) - 1L
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

