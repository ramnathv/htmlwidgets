#' @export
getDependency <- function(name, package = name){
  config = sprintf("htmlwidgets/%s.yaml", name)
  jsfile = sprintf("htmlwidgets/%s.js", name)
  
  config = yaml::yaml.load_file(
    system.file(config, package = package)
  )
  widgetDep <- lapply(config$dependencies, function(l){
    l$src = system.file(l$src, package = package)
    do.call(htmlDependency, l)
  })
  
  # Create a dependency that will cause the jsfile and only the jsfile (rather
  # than all of its filesystem siblings) to be copied
  bindingDir <- tempfile("widgetbinding")
  dir.create(bindingDir, mode = "0700")
  file.copy(system.file(jsfile, package = package), bindingDir)
  
  bindingDep <- htmlDependency(paste0(name, "-binding"), packageVersion(package),
    bindingDir,
    script = basename(jsfile)
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

toJSON <- function(x) {
  convert <- attr(x, 'JSON_CONVERTER', exact = TRUE)
  if (!is.function(convert)) convert <- RJSONIO::toJSON
  convert(x)
}
