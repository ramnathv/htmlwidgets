#' @export
widgetScaffold <- function(name, bower_pkg = NULL, edit = interactive()){
  if (!file.exists('DESCRIPTION')){
    stop(
      "You need to create a package to house your widget first!",
      call. = F
    )
  }
  if (!file.exists('inst')){
    dir.create('inst')
  }
  package = read.dcf('DESCRIPTION')[[1,"Package"]]
  addWidgetConstructor(name, package, edit)
  addWidgetYAML(name, bower_pkg, edit)
  addWidgetJS(name, edit)
}

addWidgetConstructor <- function(name, package, edit){
  tpl <- "#' <Add Title>
#'
#' <Add Description>
#' @import htmltools
#' @import htmlwidgets
#' @export
%s <- function(..., width, height){
  params = list(...)
  createWidget(
   name = '%s',
   params,
   package = '%s'
  )
}

#' Widget output function for use in Shiny App
#'
#' <TODO: Add default width and height for widget>
#' @export
%sOutput <- function(outputId, width, height){
  shinyWidgetOutput(outputId, '%s', width, height, package = '%s')
}

#' Widget render function for use in Shiny App
#' @export
render%s <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, %sOutput, env, quoted = TRUE)
}"

  capName = function(name){
    paste0(toupper(substring(name, 1, 1)), substring(name, 2))
  }
  if (!file.exists(file_ <- sprintf("R/%s.R", name))){
    cat(
      sprintf(tpl, name, name, package, name, name, package,
              capName(name), name),
      file = file_
    )
    message('Created boilerplate for widget constructor ', file_)
  } else {
    message(file_, " already exists")
  }
  if (edit) file.edit(file_)
}

addWidgetYAML <- function(name, bower_pkg, edit){
  tpl <- "# widget dependencies
dependencies:
  - name:
    version:
    src:
    script:
    stylesheet:
"
  if (!file.exists('inst/htmlwidgets')){
    dir.create('inst/htmlwidgets')
  }
  if (!is.null(bower_pkg)){
    install_bower_pkg(bower_pkg)
    tpl <- get_config(bower_pkg)
  }
  if (!file.exists(file_ <- sprintf('inst/htmlwidgets/%s.yaml', name))){
    cat(tpl, file = file_)
    message('Created boilerplate for widget dependencies at ',
      sprintf('inst/htmlwidgets/%s.yaml', name)
    )
  } else {
    message(file_, " already exists")
  }
  if (edit) file.edit(file_)
}

addWidgetJS <- function(name, edit){
  tpl <- "// widget binding
HTMLWidgets.widget({
  name: '%s',
  type: 'output',
  initialize: function(el, width, height){

  },
  renderValue: function(el, data){

  }
})
"
  if (!file.exists(file_ <- sprintf('inst/htmlwidgets/%s.js', name))){
    cat(sprintf(tpl, name), file = file_)
    message('Created boilerplate for widget javascript bindings at ',
      sprintf('inst/htmlwidgets/%s.js', name)
    )
  } else {
    message(file_, " already exists")
  }
  if (edit) file.edit(file_)
}

# Install bower package to inst/htmlwidgets/lib
#
# This function uses bower to install a javascript package along with
# its dependencies.
install_bower_pkg <- function(pkg){
  # check if bower is installed
  if (Sys.which('bower') == ""){
    stop(
      "Please install bower from http://bower.io",
      call. = FALSE
    )
  }

   #check if we are in the root directory of a package
   if (!file.exists('DESCRIPTION')){
    stop("You need to be in a package directory to run this!",
      call. = F)
   }

  # set up .bowerrc to install packages to correct directory
  if (!file.exists('.bowerrc')){
    x = '{"directory": "inst/htmlwidgets/lib"}'
    cat(x, file = '.bowerrc')
  }

  # Install package
  message("Installing ", pkg, " using bower...", "\n\n")
  cmd <- sprintf("bower install %s", pkg)
  system(cmd)
  message("... Done! installing ", pkg)
}

# Read the bower.json file
read_bower <- function(pkg, src = "inst/htmlwidgets/lib"){
  bower = RJSONIO::fromJSON(
    file.path(src, pkg, 'bower.json')
  )
  spec = list(
    name = bower$name,
    version = bower$version,
    src = paste0('htmlwidgets/lib/', pkg),
    script = bower$main[grepl('^.*\\.js$', bower$main)],
    style = bower$main[grepl('^.*\\.css$', bower$main)]
  )
  deps = bower$dependencies
  spec = Filter(function(x) length(x) != 0, spec)
  list(spec = spec, deps = deps)
}

# Get YAML configuration for widget
get_config <- function(pkg, src = "inst/htmlwidgets/lib"){
  deps = read_bower(pkg, src)$deps
  all = c(pkg, names(deps))
  config = lapply(all, function(pkg){
    read_bower(pkg, src = src)$spec
  })
  yaml::as.yaml(config)
}
