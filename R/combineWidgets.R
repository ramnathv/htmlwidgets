#' Combine several interactive plots
#'
#' This function combines different htmlwidgets in a unique view.
#'
#' @param ...
#'   htmlwidgets to combine.
#' @param nrow
#'   Number of rows of the layout. If \code{NULL}, the function will automatically
#'   take a value such that are at least as many cells in the layout as the number
#'   of htmlwidgets.
#' @param ncol
#'   Number of columns of the layout.If \code{NULL}, the function will automatically
#'   take a value such that are at least as many cells in the layout as the number
#'   of htmlwidgets.
#' @param title
#'   Title of the view.
#' @param rowsize
#'   This argument controls the relative size of each row. For instance, if
#'   the layout has two rows and \code{rowsize = c(2,1)}, then the width of the
#'   first row will be twice the one of the second one. This argument is recycled
#'   to fit the number of rows.
#' @param colsize
#'   Same as rowsize but for the height of the columns of the layout.
#' @param byrow
#'   If \code{TRUE}, then the layout is filled by row. Else it is filled by
#'   column.
#' @param titleCSS
#'   A character containing css properties to modify the appearance of the title
#'   of the view.
#' @param width
#'   Total width of the layout (optional, defaults to automatic sizing)
#' @param height
#'   Total height of the layout (optional, defaults to automatic sizing)
#' @return
#'   A HTML widget.
#'
#' @details
#' The function only allows table like layout : each row has the same number of
#' columns and reciprocally. But it is possible to create more complex layout
#' by nesting combined htmlwidgets. (see examples)
#'
#' @examples
#' if (require(plotly)) {
#'   data(iris)
#'
#'   combineWidgets(title = "The Iris dataset",
#'     plot_ly(iris, x = ~Sepal.Length, type = "histogram", nbinsx = 20),
#'     plot_ly(iris, x = ~Sepal.Width, type = "histogram", nbinsx = 20),
#'     plot_ly(iris, x = ~Petal.Length, type = "histogram", nbinsx = 20),
#'     plot_ly(iris, x = ~Petal.Width, type = "histogram", nbinsx = 20)
#'   )
#'
#'   # Create a more complex layout by nesting combinedWidgets
#'   combineWidgets(title = "The iris data set: sepals", ncol = 2, colsize = c(2,1),
#'     plot_ly(iris, x = ~Sepal.Length, y = ~Sepal.Width, type = "scatter",
#'             mode = "markers", color = ~Species),
#'     combineWidgets(
#'       plot_ly(iris, x = ~Sepal.Length, type = "histogram", nbinsx = 20),
#'       plot_ly(iris, x = ~Sepal.Width, type = "histogram", nbinsx = 20)
#'     )
#'   )
#' }
#'
#' @export
combineWidgets <- function(..., nrow = NULL, ncol = NULL, title = NULL,
                           rowsize = 1, colsize = 1, byrow = TRUE,
                           titleCSS = "",
                           width = NULL, height = NULL) {
  widgets <- lapply(list(...), function(x) {
    if (is.null(x$preRenderHook)) return(x)
    x$preRenderHook(x)
  })
  nwidgets <- length(widgets)

  # Get number of rows and cols
  if (!is.null(nrow) && !is.null(ncol) && nrow * ncol < nwidgets) {
    stop("There are too much widgets compared to the number of rows and columns")
  } else if (is.null(nrow) && !is.null(ncol)) {
    nrow <- ceiling(nwidgets / ncol)
  } else if (!is.null(nrow) && is.null(ncol)) {
    ncol <- ceiling(nwidgets / nrow)
  } else if (is.null(nrow) && is.null(ncol)) {
    nrow <- ceiling(sqrt(nwidgets))
    ncol <- ceiling(nwidgets / nrow)
  }

  ncells <- nrow * ncol

  # Relative size of rows and cols
  rowsize <- rep(rowsize, length.out=nrow)
  colsize <- rep(colsize, length.out = ncol)

  # Get the html ID of each widget
  elementId <- sapply(widgets[1:ncells], function(x) {
    if (is.null(x)) res <- NULL
    else res <- x$elementId

    if (is.null(res)) res <- paste0("widget", floor(runif(1, max = 1e9)))

    res
  })

  # Construct the html of the combined widget
  dirClass <- ifelse(byrow, "cw-by-row", "cw-by-col")

  widgetEL <- mapply(
    function(id, size) {
      sprintf('<div class="cw-col" style="flex:%s;-webkit-flex:%s">
                 <div id="%s" class="cw-widget" style="width:100%%;height:100%%"></div>
               </div>',
              size, size, id)
    },
    id = elementId,
    size = rep(colsize, length.out = ncells)
  )

  rowsEl <- lapply(1:nrow, function(i) {
    content <- widgetEL[((i-1) * ncol + 1):(i * ncol)]
    sprintf('<div class="cw-row %s" style="flex:%s;-webkit-flex:%s">%s</div>',
            dirClass, rowsize[i], rowsize[i], paste(content, collapse = ""))
  })

  content <- sprintf('<div class="cw-content %s">%s</div>',
                     dirClass, paste(rowsEl, collapse = ""))

  if(!is.null(title) && !title == "") {
    titleEl <- sprintf('<div><h2 class="cw-title" style="%s">%s</h2></div>',
                       titleCSS, title)
  } else {
    titleEl <- ""
  }

  html <- sprintf('<div class="cw-container">%s%s</div>', titleEl, content)

  data <- lapply(widgets, function(x) x$x)
  widgetType <- sapply(widgets, function(x) class(x)[1])


  x <- list(data = data, widgetType = widgetType, elementId = elementId, html = html);

  # create widget
  combinedWidget <- htmlwidgets::createWidget(
    name = 'combineWidgets',
    x,
    width = width,
    height = height,
    package = 'htmlwidgets'
  )

  deps <- lapply(widgets, function(x) {
    append(getDependency(class(x)[1], attr(x, "package")), x$dependencies)
  })
  deps <- do.call(c, deps)

  combinedWidget$dependencies <- deps

  combinedWidget
}

#' Shiny bindings for combineWidgets
#'
#' Output and render functions for using combineWidgets within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a combineWidgets
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name combineWidgets-shiny
#'
#' @export
combineWidgetsOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'combineWidgets', width, height, package = 'htmlwidgets')
}

#' @rdname combineWidgets-shiny
#' @export
renderCombineWidgets <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, combineWidgetsOutput, env, quoted = TRUE)
}
