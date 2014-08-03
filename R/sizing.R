DEFAULT_WIDTH <- 960
DEFAULT_HEIGHT <- 500
DEFAULT_PADDING <- 40
DEFAULT_WIDTH_VIEWER <- 450
DEFAULT_HEIGHT_VIEWER <- 350
DEFAULT_PADDING_VIEWER <- 15

#' @export
sizingPolicy <- function(
  defaultWidth = NULL, defaultHeight = NULL, padding = NULL,
  viewer.defaultWidth = NULL, viewer.defaultHeight = NULL,
  viewer.padding = NULL, viewer.fill = TRUE,
  browser.defaultWidth = NULL, browser.defaultHeight = NULL,
  browser.padding = NULL, browser.fill = FALSE,
  knitr.defaultWidth = NULL, knitr.defaultHeight = NULL,
  knitr.figure = TRUE) {
  
  list(
    defaultWidth = defaultWidth,
    defaultHeight = defaultHeight,
    padding = padding,
    viewer = list(
      defaultWidth = viewer.defaultWidth,
      defaultHeight = viewer.defaultHeight,
      padding = viewer.padding,
      fill = viewer.fill
    ),
    browser = list(
      defaultWidth = browser.defaultWidth,
      defaultHeight = browser.defaultHeight,
      padding = browser.padding,
      fill = browser.fill
    ),
    knitr = list(
      defaultWidth = knitr.defaultWidth,
      defaultHeight = knitr.defaultHeight,
      figure = knitr.figure
    )
  )
}

#' Resolve widget sizing policy
#' 
#' Take a widget object and sizing policy, and some other contextual details, 
#' and figure out what width/height to use, if possible. Some decisions may need
#' to be deferred until runtime; include any metadata that's needed for that
#' decision in the result as well.
#' 
#' @param x The widget object whose size is to be determined. It may have $width
#'   and $height directly on it, which means we should obey those.
#' @param sp The sizing policy to use.
#' @param standalone Logical value indicating whether the widget is being
#'   rendered in a standalone context (where it's the only thing on the page;
#'   this is usually via `print.htmlwidget()`).
#' @param knitrOptions Object representing the knitr options passed to us via 
#'   `knit_print`. If we're not doing a `knit_print` right now, then the value 
#'   should be `NULL`.
#' @return A list that is guaranteed to have `width` and `height` values, each of
#'   which is either a number or CSS unit string. If `standalone=TRUE` then the
#'   list will also have a `runtime` value that is a list, that contains two
#'   nested lists `viewer` and `browser`. Each of those in turn has `width`,
#'   `height`, `padding` (between 1 and 4 numbers), and `fill` (`TRUE`/`FALSE`).
#' @keywords internal
#' @examples
#' x <- list(
#'   sizingPolicy = list(
#'     defaultWidth = 800,
#'     defaultHeight = 500,
#'     padding = 15,
#'     viewer = list(
#'       fill = TRUE,
#'       padding = 0
#'     ),
#'     browser = list(
#'       fill = FALSE,
#'       defaultWidth = 960,
#'       defaultHeight = 600,
#'       padding = 20
#'     ),
#'     knitr = list(
#'       # Actually knitr$defaultWidth and knitr$defaultHeight
#'       # are ignored if figure = TRUE
#'       defaultWidth = 800,
#'       defaultHeight = 600,
#'       figure = TRUE
#'     )
#'   )
#' )
#' 
#' # Sizing for standalone mode
#' str(resolveSizing(x, x$sizingPolicy, TRUE, NULL))
#' # Sizing for knitr
#' str(resolveSizing(x, x$sizingPolicy, FALSE,
#'   list(out.width.px = 150, out.height.px = 100)))
#' 
#' # Explicit width/height provided by user--overrides any
#' # default width/height
#' x$width <- 300
#' x$height <- 250
#' str(resolveSizing(x, x$sizingPolicy, FALSE,
#'   list(out.width.px = 150, out.height.px = 100)))
#' @export
resolveSizing <- function(x, sp, standalone, knitrOptions = NULL) {  
  if (isTRUE(standalone)) {
    userSized <- !is.null(x$width) || !is.null(x$height)
    viewerScopes <- list(sp$viewer, sp)
    browserScopes <- list(sp$browser, sp)
    # Precompute the width, height, padding, and fill for each scenario.
    return(list(
      runtime = list(
        viewer = list(
          width = x$width %||% any_prop(viewerScopes, "defaultWidth") %||% DEFAULT_WIDTH_VIEWER,
          height = x$height %||% any_prop(viewerScopes, "defaultHeight") %||% DEFAULT_HEIGHT_VIEWER,
          padding = any_prop(viewerScopes, "padding") %||% DEFAULT_PADDING_VIEWER,
          fill = !userSized && any_prop(viewerScopes, "fill") %||% TRUE
        ),
        browser = list(
          width = x$width %||% any_prop(browserScopes, "defaultWidth") %||% DEFAULT_WIDTH,
          height = x$height %||% any_prop(browserScopes, "defaultHeight") %||% DEFAULT_HEIGHT,
          padding = any_prop(browserScopes, "padding") %||% DEFAULT_PADDING,
          fill = !userSized && any_prop(browserScopes, "fill") %||% FALSE
        )
      ),
      width = x$width %||% prop(sp, "defaultWidth") %||% DEFAULT_WIDTH,
      height = x$height %||% prop(sp, "defaultHeight") %||% DEFAULT_HEIGHT
    ))
  } else if (!is.null(knitrOptions)) {
    knitrScopes <- list(sp$knitr, sp)
    isFigure <- any_prop(knitrScopes, "figure")
    figWidth <- if (isFigure) knitrOptions$out.width.px else NULL
    figHeight <- if (isFigure) knitrOptions$out.height.px else NULL
    # Compute the width and height
    return(list(
      width = x$width %||% figWidth %||% any_prop(knitrScopes, "defaultWidth") %||% DEFAULT_WIDTH,
      height = x$height %||% figHeight %||% any_prop(knitrScopes, "defaultHeight") %||% DEFAULT_HEIGHT
    ))
  } else {
    # Some non-knitr, non-print scenario.
    # Just resolve the width/height vs. defaultWidth/defaultHeight
    return(list(
      width = x$width %||% prop(sp, "defaultWidth") %||% DEFAULT_WIDTH,
      height = x$height %||% prop(sp, "defaultHeight") %||% DEFAULT_HEIGHT
    ))
  }
}