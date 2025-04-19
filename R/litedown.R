record_print.htmlwidget <- function(x, ...) {
  saveopt <- options(knitr.in.progress = TRUE)
  on.exit(options(saveopt))

  # Build knitr options from litedown options
  options <- as.list(litedown::reactor())
  if (!is.null(options$fig.dim)) {
    options$fig.width <- options$fig.dim[1]
    options$fig.height <- options$fig.dim[2]
  }
  if (is.null(options$out.width.px))
    options$out.width.px <- options$fig.width*84
  if (is.null(options$out.height.px))
    options$out.height.px <- options$fig.height*84

  html <- toHTML(x, standalone = FALSE, knitrOptions = options)
  output <- knitr::knit_print(html, options = options,  ...)
  meta <- attr(output, "knit_meta")
  meta <- htmltools::resolveDependencies(meta)
  head <- css <- js <- character()
  metatag <- list()
  for (i in seq_along(meta)) {
    dep <- meta[[i]]
    if (!is.null(dep$stylesheet))
      css <- c(css, file.path(dep$src$file, dep$stylesheet))
    if (!is.null(dep$script))
      js <- c(js, file.path(dep$src$file, dep$script))
    if (!is.null(dep$meta))
      metatag <- c(metatag, list(dep$meta))
    if (!is.null(dep$head))
      head <- c(head, dep$head)
  }
  metatag <- unlist(lapply(metatag, function(x)
    paste0("<meta name=\"", htmltools::htmlEscape(names(x)), "\" content=\"",
  htmlEscape(x), "\">")))
  head <- c(head, metatag)
  meta <- litedown::reactor("meta")
  if (length(css))
    meta$css <- unique(c(meta$css, css))
  if (length(js))
    meta$js <- unique(c(meta$js, js))
  if (length(head))
    meta$"header-includes" <- c(meta$"header-includes", head)
  litedown::reactor(meta = meta)
  xfun::new_record(output, "asis")
}
