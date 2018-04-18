#' Save a widget to an HTML file
#'
#' Save a rendered widget to an HTML file (e.g. for sharing with others).
#'
#' @param widget Widget to save
#' @param file File to save HTML into
#' @param selfcontained Whether to save the HTML as a single self-contained file
#'   (with external resources base64 encoded) or a file with external resources
#'   placed in an adjacent directory.
#' @param libdir Directory to copy HTML dependencies into (defaults to
#'   filename_files).
#' @param background Text string giving the html background color of the widget.
#'   Defaults to white.
#' @param title Text to use as the title of the generated page.
#' @param knitrOptions A list of \pkg{knitr} chunk options.
#' @export
saveWidget <- function(widget, file, selfcontained = TRUE, libdir = NULL,
                       background = "white", title = class(widget)[[1]],
                       knitrOptions = list()) {

  # Transform #RRGGBB/#RRGGBBAA colors to rgba(r,g,b,a) form, because the
  # pound sign interferes with pandoc processing
  if (grepl("^#", background, perl = TRUE)) {
    bgcol <- grDevices::col2rgb(background, alpha = TRUE)
    background <- sprintf("rgba(%d,%d,%d,%f)", bgcol[1,1], bgcol[2,1], bgcol[3,1], bgcol[4,1]/255)
  }

  # convert to HTML tags
  html <- toHTML(widget, standalone = TRUE, knitrOptions = knitrOptions)

  # form a path for dependenent files
  if (is.null(libdir)){
    libdir <- paste(tools::file_path_sans_ext(basename(file)), "_files",
      sep = "")
  }

  # make it self-contained if requested
  if (selfcontained) {

    # Save the file
    # Include a title; pandoc 2.0 complains if you don't have one
    pandoc_save_markdown(html, file = file, libdir = libdir,
                         background = background, title = title)

    if (!pandoc_available()) {
      stop("Saving a widget with selfcontained = TRUE requires pandoc. For details see:\n",
           "https://github.com/rstudio/rmarkdown/blob/master/PANDOC.md")
    }

    pandoc_self_contained_html(file, file)
    unlink(libdir, recursive = TRUE)
  } else {
    # no pandoc needed if not selfcontained
    html <- tagList(tags$head(tags$title(title)), html)
    htmltools::save_html(html, file = file, libdir = libdir, background = background)
  }

  invisible(NULL)
}
