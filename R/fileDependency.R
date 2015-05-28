# Given a file path (that exists), return a hash of the contents and the
# full file path.
generateFileDependencyKey <- function(filename) {
  filename <- normalizePath(filename, mustWork = TRUE)
  hash1 <- digest::digest(file = filename, algo = "sha1", raw = TRUE)
  hash2 <- digest::digest(filename, algo = "sha1", raw = TRUE)
  paste0(as.raw(bitops::bitXor(hash1, hash2)), collapse = "")
}

#' Create a file dependency that can be accessed by the client using javascript.
#' @export
fileDependency <- function(filename, version = '0.0.1'){
  # We use an opaque name so that if the file contents change, an entirely
  # different fileDependency is served (to avoid stale cached data).
  htmltools::htmlDependency(
    name = generateFileDependencyKey(filename),
    version = version,
    src = dirname(filename),
    attachment = basename(filename)
  )
}

#' Mark a string as an attachment
#' @export
attachment <- function(x){
  structure(
    "{attachment}",
    class = unique(c("ATTACHMENT", oldClass(x))),
    attachmentPath = normalizePath(x, mustWork = TRUE)
  )
}

attachmentDeps <- function(list) {
  # This removes all of the non-attachments, and replaces the attachment value
  # (which is always the string literal "{attachment}") with the attachmentPath
  # attribute, which is where the actual path is stored. The resulting structure
  # still retains the shape of the original list.
  #
  # Note that even though we want a flat list later, we can't use how = "unlist"
  # because that causes the extra attributes like attachmentPath to be dropped
  # before we get a chance to see them.
  attachments <- rapply(list, classes = "ATTACHMENT", how = "list", function(x) {
    attr(x, "attachmentPath", exact = TRUE)
  })

  # Remove the shape of the original list. The names in the resulting vector
  # reflect the "key" of the attachment location, if and only if named lists
  # were used all the way. For example:
  #   list(a = list(b = attachment("foo.csv")))
  # would result in
  #   c("a.b" = "foo.csv")
  # which is great.
  #
  # However:
  #   list(a = list(attachment("foo.csv"), attachment("bar.csv")))
  # would result in this:
  #   c(a1 = "foo.csv", a2 = "bar.csv")
  #
  # which isn't exactly what we're looking for (a.1 or a.#1 maybe?). This
  # implies that this feature will not work correctly with key paths that
  # include unnamed elements (or names with periods for that matter).
  attachments <- unlist(attachments)

  # Create a fileDependency for each one.
  deps <- lapply(attachments, fileDependency)
  attachments <- lapply(as.list(attachments), function(x){
    generateFileDependencyKey(x)
  })

  list(attachments = attachments, deps = deps)
}

