#' Create a file dependency that can be accessed by the client using javascript.
#' @export
fileDependency <- function(filename, version = '0.0.1'){
  htmltools::htmlDependency(
    name = basename(tools:::file_path_sans_ext(filename)),
    version = version,
    src = dirname(filename),
    attachment = basename(filename)
  )
}

#' Mark a string as an attachment
#' @export
attachment <- function(x){
  structure(
    normalizePath(x, mustWork = TRUE),
    class = unique(c("ATTACHMENT", oldClass(x)))
  )
}

attachmentDeps <- function(list) {
  attachments = rapply(list, identity, classes = 'ATTACHMENT')
  deps = lapply(attachments, fileDependency)
  attachments = lapply(as.list(attachments), function(x){
    basename(tools::file_path_sans_ext(x))
  })
  list(attachments = attachments, deps = deps)
}

