

#' @export
saveWidget <- function(widget, file, selfcontained = FALSE) {
   
  # convert to HTML tags
  html <- toHTML(widget, standalone = TRUE)
  
  # form a path for dependenent files
  libdir <- paste(tools::file_path_sans_ext(basename(file)), "_files", sep = "")
  
  # save the file
  htmltools::save_html(html, file = file, libdir = libdir)
  
  # make it self-contained if requested
  if (selfcontained) {
    
    if (!pandoc_available()) {
      stop("selfContained requires the installation of pandoc. For details see:\n",
           "https://github.com/rstudio/rmarkdown/blob/master/PANDOC.md")
    }
    
    pandoc_self_contained_html(file, file)
    unlink(libdir, recursive = TRUE)
  }
  
  invisible(NULL)
}

