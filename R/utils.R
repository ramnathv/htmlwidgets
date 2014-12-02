#' @export
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

#' Mark elements of a list as a javascript literal.
#' 
#' This function \code{JS()} marks a character vector with a special class, so that 
#' it will be treated as a javascript literal when evaluated on the client-side.
#' The function \code{JSEvals()} will then identify the elements of a
#' list that should be evaluated as javascript objects on the client side.
#' 
#' @param x character vector that needs to be treated as a javascript object.
#' @author Yihui Xie
#' @export
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
  I(evals)  # need I() to prevent RJSONIO::toJSON() from converting it to scalar
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
