#' @export
getDependency <- function(package, lib, config, jsfile){
  config = yaml::yaml.load_file(
    system.file(config, package = package)
  )
  widgetDep <- lapply(config$dependencies, function(l){
    l$src = system.file(l$src, package = package)
    do.call(htmlDependency, l)
  })
  
  # TODO: The binding JS file should really be in its own directory to prevent
  # htmltools from picking up the entire package
  bindingDep <- htmlDependency(paste0(lib, "-binding"), packageVersion(package),
    system.file(package = package),
    script = jsfile
  )
  
  c(
    list(htmlDependency("htmlwidgets", packageVersion("htmlwidgets"),
      src = system.file("www", package="htmlwidgets"),
      script = "htmlwidgets.js"
    )),
    widgetDep,
    list(bindingDep)
  )
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