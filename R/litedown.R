#' @importFrom utils file_test
record_print.htmlwidget <- local({
  fignum <- 0L

  function(x, ...) {
    saveopt <- options(knitr.in.progress = TRUE)
    on.exit(options(saveopt))

    # Build knitr options from litedown options
    options <- as.list(litedown::reactor())
    if (!is.null(options$fig.dim)) {
      options$fig.width <- options$fig.dim[1]
      options$fig.height <- options$fig.dim[2]
    }
    if (is.null(options$dpi))
      options$dpi <- 84
    if (is.null(options$fig.retina))
      options$fig.retina <- 1
    if (is.null(options$out.width.px))
      options$out.width.px <- with(options, fig.width*dpi/fig.retina)
    if (is.null(options$out.height.px))
      options$out.height.px <- with(options, fig.height*dpi/fig.retina)

    doSnapshot <- litedown::get_context("format") != "html"
    if (doSnapshot && requireNamespace("webshot2")) {
      f1 <- tempfile(fileext = ".html")
      fignum <<- fignum + 1L
      f2 <- file.path(options$fig.path, sprintf("%s-%d.png", options$label, fignum))
      if (!file_test("-d", dirname(f2)))
        dir.create(dirname(f2), recursive = TRUE)
      saveWidget(x, f1, knitrOptions = options)
      do.call(webshot2::webshot,
              c(list(url = f1, file = f2, quiet = TRUE,
                     vwidth = options$out.width.px,
                     vheight = options$out.width.px),
                options$screenshot.opts))
      alt <- options$fig.alt
      if (is.null(alt))
        alt <- options$fig.cap
      if (is.null(alt))
        alt <- ""
      xfun::new_record(sprintf("![%s](%s)", alt, f2), "asis")
    } else {
      html <- toHTML(x, standalone = FALSE, knitrOptions = options)
      output <- knitr::knit_print(html, options = options)
      meta <- attr(output, "knit_meta")
      meta <- resolveDependencies(meta)
      head <- css <- js <- character()
      metatag <- list()
      for (i in seq_along(meta)) {
        dep <- meta[[i]]
        src <- dep$src$file
        if (is.null(src))
          src <- dep$src$href
        if (is.null(src)) {
          warning("dependency '", dep$name, "' has neither `file` nor `href` source, so will be ignored.")
          next
        }
        if (!is.null(dep$stylesheet))
          css <- c(css, file.path(src, dep$stylesheet))
        if (!is.null(dep$script))
          js <- c(js, file.path(src, dep$script))
        if (!is.null(dep$meta))
          metatag <- c(metatag, list(dep$meta))
        if (!is.null(dep$head))
          head <- c(head, dep$head)
      }
      metatag <- unlist(lapply(metatag, function(x)
        paste0("<meta name=\"", htmlEscape(names(x)), "\" content=\"",
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
  }
})
