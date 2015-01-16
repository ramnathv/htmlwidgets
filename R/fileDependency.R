#' Define a file dependency that can be accessed by the client using javascript.
#' @export
fileDependency <- function(filename, version = '0.0.1'){
  htmltools::htmlDependency(
    name = basename(tools:::file_path_sans_ext(filename)),
    version = version,
    src = normalizePath(dirname(filename)),
    attachment = basename(filename)
  )
}

attachment <- function(x){
  structure(x, class = unique(c("ATTACHMENT", oldClass(x))))
}

attachmentEvals <- function(list) {
  evals <- which(unlist(shouldEval2(list)))
  I(evals)  # need I() to prevent RJSONIO::toJSON() from converting it to scalar
}

#' JSON elements that are character with the class JS_EVAL will be evaluated
#'
#' @noRd
#' @keywords internal
shouldEval2 <- function(options) {
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
    lapply(options, shouldEval2)
  } else {
    is.character(options) && inherits(options, 'ATTACHMENT')
  }
}
