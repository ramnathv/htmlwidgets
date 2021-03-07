# These methods allow htmlwidget displays to appear in pkgdown
# web sites.

replay_html.htmlwidget <- function(x, ...) {
  rendered <- htmltools::renderTags(x)
  structure(rendered$html, dependencies = rendered$dependencies)
}

pkgdown_print.htmlwidget <- function(x, visible = TRUE) {
  if (visible)
    x
  else
    invisible(NULL)
}
