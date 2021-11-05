.onLoad <- function(...) {
  register_s3_method("knitr", "knit_print", "htmlwidget")
  register_upgrade_message("shiny", "1.1", error = TRUE)
}

knit_print.htmlwidget <- function(x, ..., options = NULL) {
  knitr::knit_print(toHTML(x, standalone = FALSE, knitrOptions = options), options = options,  ...)
}
