#' Scaffold simple widgets
#'
#' @export
scaffoldSimpleWidget <- function(name, bowerPkg = NULL, edit = interactive(), dir_){
  if (!file.exists(dir_)){
    dir.create(dir_)
    dir.create(file.path(dir_, 'htmlwidgets'))
  }
  package = normalizePath(dir_)
  tpl <- paste(readLines(
  	system.file('templates/widget_r.txt', package = 'htmlwidgets')
  ), collapse = "\n")

  capName = function(name){
    paste0(toupper(substring(name, 1, 1)), substring(name, 2))
  }
  if (!file.exists(file_ <- file.path(dir_, paste0(name, '.R')))){
    cat(
      sprintf(tpl, name, name, package, name, name, name, name, name, name,
              package, name, capName(name), name),
      file = file_
    )
    message('Created boilerplate for widget constructor ', file_)
  } else {
    message(file_, " already exists")
  }
  if (edit) file.edit(file_)
  tpl <- "# (uncomment to add a dependency)
  # dependencies:
  #  - name:
  #    version:
  #    src:
  #    script:
  #    stylesheet:

  "
  if (!file.exists(file_ <- sprintf('%s/htmlwidgets/%s.yaml', dir_, name))){
    cat(tpl, file = file_)
    message('Created boilerplate for widget dependencies at ',
            sprintf('%s/htmlwidgets/%s.yaml', dir_, name)
    )
  } else {
    message(file_, " already exists")
  }
  if (edit) file.edit(file_)

  tpl <- paste(readLines(
  	system.file('templates/widget_js_new.txt', package = 'htmlwidgets')
  ), collapse = "\n")

  if (!file.exists(file_ <- sprintf('%s/htmlwidgets/%s.js', dir_, name))){
    cat(sprintf(tpl, name), file = file_)
    message('Created boilerplate for widget dependencies at ',
      sprintf('%s/htmlwidgets/%s.js', dir_, name)
    )
  } else {
    message(file_, " already exists")
  }

  if (!file.exists('index.R')){
  	cat("source('hello.R')\nhtml <- hello('World')", file = file.path(dir_, "index.R"))
  }
  if (!file.exists("Makefile")){
  	f <- system.file('templates/Makefile', package = 'htmlwidgets')
  	file.copy(f, dir_)
  }
  if (edit) file.edit(file_)

}

#' Save simple widget html
#'
#' @export
save_html2 <- function (html, file = 'index.html', background = "white", libdir = "."){
  options(htmlwidgets.copybindingdir = FALSE)
  on.exit(options(htmlwidgets.copybindingdir = TRUE))
  rendered <- renderTags(html)
  deps <- lapply(rendered$dependencies, function(dep) {
    dep <- if (dep$name == 'htmlwidgets'){
      dep <- copyDependencyToDir(dep, file.path(libdir, 'htmlwidgets'), FALSE)
      dep <- makeDependencyRelative(dep, libdir, FALSE)
    } else {
      dep <- makeDependencyRelative(dep, libdir, FALSE)
    }
    dep
  })
  html <- c("<!DOCTYPE html>", "<html>", "<head>", "<meta charset=\"utf-8\"/>",
    renderDependencies(deps, c("href", "file")), rendered$head,
    "</head>", sprintf("<body style=\"background-color:%s;\">",
    htmlEscape(background)), rendered$html, "</body>",
    "</html>"
  )
  writeLines(html, file, useBytes = TRUE)
}
