
#' HTML Widgets for R
#'
#' The \pkg{htmlwidgets} package provides a framework for easily creating R
#' bindings to JavaScript libraries. Widgets created using the framework can
#' be: 
#' 
#'   * Used at the R console for data analysis just like conventional R plots (via RStudio Viewer)
#'   * Seamlessly embedded within [R Markdown](https://rmarkdown.rstudio.com/) documents and [Shiny](https://shiny.rstudio.com/) web applications.
#'   * Saved as standalone web pages for ad-hoc sharing via email, Dropbox, etc.
#'
#' To get started creating your own HTML widgets, see the documentation
#' available in the package vignettes:
#'
#' ```
#' vignette("develop_intro", package = "htmlwidgets")
#' vignette("develop_sizing", package = "htmlwidgets")
#' vignette("develop_advanced", package = "htmlwidgets")
#' ```
#'
#' Source code for the package is available on GitHub:
#'
#' <https://github.com/ramnathv/htmlwidgets>
#'
#' @md
#' @name htmlwidgets-package
#' @aliases htmlwidgets htmlwidgets-package
#' @docType package
#' @author Ramnath Vaidyanathan, Joe Cheng, JJ Allaire, and Yihui Xie
NULL


## usethis namespace: start
#' @import htmltools
#' @importFrom utils browseURL file.edit packageVersion
## usethis namespace: end
NULL


# For usethis::use_release_issue()
release_bullets <- function() {
  c(
    "Update static imports: `staticimports::import()`"
  )
}