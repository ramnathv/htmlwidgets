#' Create implementation scaffolding for an HTML widget
#'
#' Add the minimal code required to implement an HTML widget to an R package.
#'
#' @param name Name of widget
#' @param bowerPkg Optional name of \href{http://bower.io/}{Bower} package upon
#'   which this widget is based. If you specify this parameter then bower will
#'   be used to automatically download the widget's source code and dependencies
#'   and add them to the widget's YAML.
#' @param edit Automatically open the widget's JavaScript source file after
#'   creating the scaffolding.
#'
#' @note This function must be executed from the root directory of the package
#'   you wish to add the widget to.
#'
#' @export
scaffoldWidget <- function(name, bowerPkg = NULL, edit = interactive()){
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
  addWidgetYAML(name, bowerPkg, edit)
  addWidgetJS(name, edit)
}

addWidgetConstructor <- function(name, package, edit){
  tpl <- "#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
%s <- function(message, width = NULL, height = NULL) {

  # forward options using x
  x = list(
    message = message
  )

  # create widget
  htmlwidgets::createWidget(
    name = '%s',
    x,
    width = width,
    height = height,
    package = '%s'
  )
}

#' Widget output function for use in Shiny
#'
#' @export
%sOutput <- function(outputId, width = '100%%', height = '400px'){
  shinyWidgetOutput(outputId, '%s', width, height, package = '%s')
}

#' Widget render function for use in Shiny
#'
#' @export
render%s <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, %sOutput, env, quoted = TRUE)
}
"

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

addWidgetYAML <- function(name, bowerPkg, edit){
  tpl <- "# (uncomment to add a dependency)
# dependencies:
#  - name:
#    version:
#    src:
#    script:
#    stylesheet:
"
  if (!file.exists('inst/htmlwidgets')){
    dir.create('inst/htmlwidgets')
  }
  if (!is.null(bowerPkg)){
    installBowerPkg(bowerPkg)
    tpl <- getConfig(bowerPkg)
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
  tpl <- "HTMLWidgets.widget({

  name: '%s',

  type: 'output',

  initialize: function(el, width, height) {

    return {
      // TODO: add instance fields as required
    }

  },

  renderValue: function(el, x, instance) {

    el.innerText = x.message;

  },

  resize: function(el, width, height, instance) {

  }

});
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
installBowerPkg <- function(pkg){
  # check if bower is installed
  if (findBower() == ""){
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
  cmd <- sprintf('%s install %s', findBower(), pkg)
  system(cmd)
  message("... Done! installing ", pkg)
}

# Try really hard to find bower in Windows
findBower <- function(){
  # a slightly more robust finder of bower for windows
  # which does not require PATH environment variable to be set
  bowerPath = if(Sys.which("bower") == "") {
    # if it does not find Sys.which('bower')
    # also check APPDATA to see if found there
    if(identical(.Platform$OS.type,"windows")) {
      Sys.which(file.path(Sys.getenv("APPDATA"),"npm","bower."))
    }
  } else {
    Sys.which("bower")
  }
  return(bowerPath)
}

# Read the bower.json file
readBower <- function(pkg, src = "inst/htmlwidgets/lib"){
  bower = RJSONIO::fromJSON(
    file.path(src, pkg, 'bower.json')
  )
  spec = list(
    name = basename(bower$name),
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
getConfig <- function(pkg, src = "inst/htmlwidgets/lib"){
  deps = readBower(pkg, src)$deps
  all = c(names(deps),pkg)
  config = lapply(all, function(pkg){
    readBower(pkg, src = src)$spec
  })
  yaml::as.yaml(list(dependencies = config))
}
