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
#' @param knitrOptions A list of \pkg{knitr} chunk options.
#' @export
saveWidget <- function(widget, file, selfcontained = TRUE, libdir = NULL,
                       background = "white", knitrOptions = list()) {

  if(!dir.exists(dirname(file))){
    stop(paste0("Directory '", dirname(file), "' does not exist, create it before attempting to save widgets there"))
  }

  normalised.file.path <- file.path(normalizePath(dirname(file)),basename(file))

  # convert to HTML tags
  html <- toHTML(widget, standalone = TRUE, knitrOptions = knitrOptions)

  # form a path for dependenent files
  if (is.null(libdir)){
    libdir <- paste(tools::file_path_sans_ext(basename(normalised.file.path)), "_files",
                    sep = "")
  }

  # save the file
  htmltools::save_html(html, file = normalised.file.path, libdir = libdir, background=background)

  # make it self-contained if requested
  if (selfcontained) {

    if (!pandoc_available()) {
      stop("Saving a widget with selfcontained = TRUE requires pandoc. For details see:\n",
           "https://github.com/rstudio/rmarkdown/blob/master/PANDOC.md")
    }

    pandoc_self_contained_html(file, normalised.file.path)
    unlink(libdir, recursive = TRUE)
  }

  invisible(NULL)
}
