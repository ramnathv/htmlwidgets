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

prop <- function(x, path) {
  tryCatch({
    for (i in strsplit(path, "$", fixed = TRUE)[[1]]) {
      if (is.null(x))
        return(NULL)
      x <- x[[i]]
    }
    return(x)
  }, error = function(e) {
    return(NULL)
  })
}

any_prop <- function(scopes, path) {
  for (scope in scopes) {
    result <- prop(scope, path)
    if (!is.null(result))
      return(result)
  }
  return(NULL)
}