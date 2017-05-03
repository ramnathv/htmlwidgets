# Reusable function for registering a set of methods with S3 manually. The
# methods argument is a list of character vectors, each of which has the form
# c(package, genname, class).
registerMethods <- function(methods) {
  lapply(methods, function(method) {
    pkg <- method[[1]]
    generic <- method[[2]]
    class <- method[[3]]
    func <- get(paste(generic, class, sep="."))
    if (pkg %in% loadedNamespaces()) {
      registerS3method(generic, class, func, envir = asNamespace(pkg))
    }
    setHook(
      packageEvent(pkg, "onLoad"),
      function(...) {
        registerS3method(generic, class, func, envir = asNamespace(pkg))
      }
    )
  })
}

.onLoad <- function(...) {
  # htmlwidgets provides methods for knitr::knit_print, but knitr isn't a Depends or
  # Imports of htmltools, only an Enhances. Therefore, the NAMESPACE file has to
  # declare it as an export, not an S3method. That means that R will only know to
  # use our methods if htmlwidgets is actually attached, i.e., you have to use
  # library(htmlwidgets) in a knitr document or else you'll get escaped HTML in your
  # document. This code snippet manually registers our method(s) with S3 once both
  # htmlwidgets and knitr are loaded.
  registerMethods(list(
    # c(package, genname, class)
    c("knitr", "knit_print", "htmlwidget")
  ))
}

.onAttach <- function(...) {
  # warn if the version of shiny is lower than what was specified in DESCRIPTION
  checkShinyVersion(error = FALSE)
}

knit_print.htmlwidget <- function (x, ..., options = NULL)
{
  as.iframe <- rmarkdown::metadata$output[[1]]$as.iframe
  if (!is.null(as.iframe) && as.iframe) {
    file <- basename(tempfile(fileext = ".html"))
    selfcontained <- if (is.null(rmarkdown::metadata$self_contained)) TRUE else rmarkdown::metadata$self_contained

    # widget.width and widget.height can be specified as chunk options
    width  <- if(is.null(options$widget.width)) "100%" else options$widget.width
    height <- if(is.null(options$widget.height)) 500 else options$widget.height

    # widget.styles can be specified as a chunk option
    # widget.styles must be a list of pairs of style name and value
    styles <- options$widget.styles
    if(is.null(styles)) styles <- list(`border-width` = '0px')
    if(!is.list(styles)) stop("widget.styles must be a list!")
    if(!any(grepl("^border", names(styles)))) styles$`border-width` <- '0px'
    style = paste(
      paste(paste(names(styles), styles, sep = ':'), collapse = ';'),
      ";"
    )

    htmlwidgets::saveWidget(x, file = file, selfcontained = selfcontained)

    content <- if (selfcontained) {
      on.exit(unlink(file), add = TRUE)
      list(
        srcdoc = paste(readLines(file), collapse = "\n"),
        width = width, height = height, style = style
      )
    } else {
      list(
        src = file,
        width = width, height = height, style = style
      )
    }

    html <- htmltools::tag("iframe", content)

  } else {
    html <- toHTML(x, standalone = FALSE, knitrOptions = options)
  }

  knitr::knit_print(html, options = options, ...)
}

