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

knit_print.htmlwidget <- function(x, ..., options = NULL) {
  knitr::knit_print(toHTML(x, standalone = FALSE, knitrOptions = options), options = options,  ...)
}

