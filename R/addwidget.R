#' @export
addNewWidget <- function(name, package){
  if (!file.exists('DESCRIPTION')){
    stop("You need to create a package to house your widget first!", call. = F)
  }
  addWidgetConstructor(name, package)
  addWidgetYAML(name)
  addWidgetJS(name)
}

addWidgetConstructor <- function(name, package = name){
  tpl <- "#' <Add Title>
#'
#' <Add Description>
#' @import htmltools
#' @import htmlwidgets
#' @export
%s <- function(..., width, height){
  params = list(...)
  createWidget(
   name = %s,
   params,
   package = %s
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
}

addWidgetYAML <- function(name){
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
  if (!file.exists(file_ <- sprintf('inst/htmlwidgets/%s.yaml', name))){
    cat(tpl, file = file_)
    message('Created boilerplate for widget dependencies at ', 
      sprintf('inst/htmlwidgets/%s.yaml', name)
    )
  } else {
    message(file_, " already exists")
  }
}

addWidgetJS <- function(name){
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
    message('Created boilerplate for widget javascript bindings at', 
      sprintf('inst/htmlwidgets/%s.js', name)
    )
  } else {
    message(file_, " already exists")
  }
}
