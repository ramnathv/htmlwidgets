#' @export
getDependency <- function(file, package){
  config = yaml::yaml.load_file(
    system.file(file, package = package)
  )
  lapply(config$dependencies, function(l){
    l$src = system.file(l$src, package = package)
    do.call(htmlDependency, l)
  })
}

#' @export
getScript <- function(x, file, package){
  payload = sprintf("var payload = %s", RJSONIO::toJSON(x, digits = 13))
  script_file = system.file(file, package = package)
  lines <- readLines(script_file, warn = FALSE, encoding = "UTF-8")
  tags$script(HTML(paste(c(payload, lines), collapse = "\r\n")))
}

`%||%` <- function(x, y){
  if (is.null(x)) y else x
}