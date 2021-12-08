
#' Set the random seed for widget element ids
#'
#' Set a random seed for generating widget element ids. Calling this
#' function rather than relying on the default behavior ensures
#' stable widget ids across sessions.
#'
#' @inheritParams base::set.seed
#'
#' @export
setWidgetIdSeed <- function(seed, kind = NULL, normal.kind = NULL) {
  sysSeed <- .GlobalEnv$.Random.seed
  on.exit({
    .globals$idSeed <- .GlobalEnv$.Random.seed
    if (!is.null(sysSeed))
      .GlobalEnv$.Random.seed <- sysSeed
    else
      rm(".Random.seed", envir = .GlobalEnv)
  })
  set.seed(seed, kind = kind, normal.kind = normal.kind)
}

# create a new unique widget id
createWidgetId <- function(bytes = 10) {

  # Note what the system's random seed is before we start, so we can restore it after
  sysSeed <- .GlobalEnv$.Random.seed

  if (!is.null(.globals$idSeed)) {
    # Replace system seed with our own seed
    .GlobalEnv$.Random.seed <- .globals$idSeed
    on.exit({
      # Continue using our own seed for subsequent widget ids
      .globals$idSeed <- .GlobalEnv$.Random.seed
    })
  } else if (exists(".Random.seed", envir = .GlobalEnv)) {
    # or remove the seed for a fresh RNG if we don't have an internal RNG state
    rm(".Random.seed", envir = .GlobalEnv)
  }

  on.exit({
    # Restore the system seed--we were never here
    if (!is.null(sysSeed))
      .GlobalEnv$.Random.seed <- sysSeed
    else
      rm(".Random.seed", envir = .GlobalEnv)
  }, add = TRUE)

  paste(
    format(as.hexmode(sample(256, bytes, replace = TRUE)-1), width=2),
    collapse = "")
}

