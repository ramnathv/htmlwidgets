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

#' Mark elements of a list as the JavaScript code
#'
#' The function \code{withJS()} evaluates its argument \code{expr} in an
#' environment that has defined a function \code{JS()} to mark a character
#' vector with a special class, so that this character vector will be treated as
#' literal JavaScript code that will be evaluated, instead of an ordinary
#' character string. The function \code{JSEvals()} identifies the elements of a
#' list that should be evaluated as JavaScript.
#' @param expr an \emph{unevaluated} R expression that, when evaluated, returns
#'   a list of which some elements are to be marked as JavaScript code using
#'   \code{JS()}
#' @return For \code{withJS}, the argument \code{expr} is evaluated and the
#'   result is returned. For \code{JSEvals()}, a character vector with elements
#'   of the form \samp{x.y.N.z} is returned; a character string \samp{x.y.N.z}
#'   means the element \code{list$x$y[[N]]$z} is JavaScript code. On the
#'   JavaScript side, you can pass \samp{x.y.N.z} to the \code{member} argument
#'   of the helper function \code{HTMLWidgets.evaluateStringMember(o, member)}
#'   in this package to evaluate the corresponding element in the object
#'   \code{o} where \code{o} is the JavaScript object converted from the R list
#'   that was passed to \code{JSEvals()}.
#' @note The function \code{JS()} is only visible \emph{inside} \code{withJS()}.
#'   It is not an exported function in this package. Its only goal is to provide
#'   a way for users to mark list elements, and it may be meaningless beyond
#'   this goal.
#'
#'   For package authors, make sure you do not evaluate the expression before
#'   passing it to \code{withJS()}. You can achieve this by passing
#'   \code{substitute(foo)} to \code{withJS()} in your function, where
#'   \code{foo} is the function argument value. See examples below.
#' @export
#' @examples
#' ex <- expression(list(x = 1, y = JS('function(){return true;}')))
#' htmlwidgets::withJS(ex)
#'
#' # use withJS() in another function: make sure you use substitute() so the
#' # argument is not evaluated
#' f1 <- function(options) htmlwidgets::withJS(substitute(options))
#' f1(list(x = 1, y = JS('function(){return true;}')))
#'
#' \donttest{# do not pass an argument directly to withJS(), e.g.
#' f2 <- function(options) htmlwidgets::withJS(options)
#' f2(list(x = 1, y = JS('function(){return true;}')))
#' # you will get an error "could not find function JS"
#' }
#' obj <- f1(list(x = 1, y = list(a = 2, b = JS('[1, 2, null]')), z = list(3, JS('{"a": 4}'))))
#' htmlwidgets::JSEvals(obj)
withJS <- function(expr) {
  env <- new.env(parent = parent.frame())
  env$JS <- function(x) {
    if (is.character(x)) structure(x, class = 'JS_EVAL') else x
  }
  eval(expr, envir = env)
}

# Does this: list(foo = list(1, list(bar = I('function(){}')), 2)) => foo.2.bar
# Later on the JS side, we will split foo.2.bar to ['foo', '2', 'bar'] and
# evaluate the JSON object member. Note '2' (character) should have been 2
# (integer) but it does not seem to matter in JS: x[2] is the same as x['2']
# when all child members of x are unnamed, and ('2' in x) will be true even if x
# is an array without names. This is a little hackish.

#' @rdname withJS
#' @param list a list in which the elements that should be evaluated as
#'   JavaScript are to be identified
#' @export
JSEvals <- function(list) {
  evals <- names(which(unlist(shouldEval(list))))
  I(evals)  # need I() to prevent RJSONIO::toJSON() from converting it to scalar
}

# JSON elements that are character with the class JS_EVAL will be evaluated
shouldEval <- function(options) {
  if (is.list(options)) {
    if ((n <- length(options)) == 0) return(FALSE)
    # use numeric indices as names (remember JS indexes from 0, hence -1 here)
    if (is.null(nms <- names(options)))
      nms <- names(options) <- seq_len(n) - 1L
    if (length(nms) != n || any(nms == ''))
      stop("'options' must be a fully named list, or have no names (NULL)")
    lapply(options, shouldEval)
  } else {
    is.character(options) && inherits(options, 'JS_EVAL')
  }
}
