projectTemplate <- function(path, ...) {
  project_name <- tolower(basename(path))

  htmlwidgets_path <- file.path(path, "inst/htmlwidgets")
  htmlwidgets_lib_path <- file.path(path, "inst/htmlwidgets/lib")

  r_path <- file.path(path, "R")

  dependencies_yaml <- c(
    "dependencies:",
    paste("  - name: ", project_name, sep = ""),
    "    version: 1.0.0",
    "    src: htmlwidgets/lib",
    "    script:",
    "      - empty.js"
  )

  main_r <- c(
    "#' @import htmlwidgets",
    "#' @export",
    paste(project_name, " <- function(width = NULL, height = NULL) {", sep = ""),
    "  # pass the data and settings using 'x'",
    "  x <- list(",
    "    data = \"1 2 3\"",
    "  )",
    "",
    paste("  htmlwidgets::createWidget(\"", project_name, "\", x, width = width, height = height)", sep = ""),
    "}",
    "",
    "#' @export",
    paste(project_name, "Output <- function(outputId, width = \"100%\", height = \"400px\") {", sep = ""),
    paste("  shinyWidgetOutput(outputId, \"", project_name, "\", width, height, package = \"", project_name, "\")", sep = ""),
    "}",
    "",
    "#' @export",
    paste(
      "render",
      toupper(substr(project_name, 1, 1)),
      substr(project_name, 2, nchar(project_name)),
      " <- function(expr, env = parent.frame(), quoted = FALSE) {",
      sep = ""
    ),
    "  if (!quoted) { expr <- substitute(expr) } # force quoted",
    paste("  shinyRenderWidget(expr, ", project_name, "Output, env, quoted = TRUE)", sep = ""),
    "}"
  )

  main_js <- c(
    "HTMLWidgets.widget({",
    paste("  name: \"", project_name, "\",", sep = ""),
    "  type: \"output\",",
    "  factory: function(el, width, height) {",
    "    var div = document.createElement(\"div\");",
    "    el.appendChild(div);",
    "",
    "    return {",
    "      renderValue: function(x) {",
    "        div.innerText = x.data;",
    "      },",
    "      resize: function(width, heigh) {",
    "      },",
    "      // make the object available as a property on the widget",
    "      div: div",
    "    };",
    "  }",
    "});"
  )

  description_file <- c(
    paste("Package: ", project_name, sep = ""),
    "Type: Package",
    "Title: What the Package Does (Title Case)",
    "Version: 0.1.0",
    "Author: Who wrote it",
    "Maintainer: The package maintainer <yourself@somewhere.net>",
    "Description: More about what it does (maybe more than one line)",
    "  Use four spaces when indenting paragraphs within the Description.",
    "License: What license is it under?",
    "Encoding: UTF-8",
    "LazyData: true",
    "Depends:",
    "  R (>= 3.1.2)",
    "Imports:",
    "  htmlwidgets"
  )

  namespace_file <- c(
    paste("export(", project_name, ")", sep = ""),
    "import(sparklyr)"
  )

  readme_file <- c(
    "---",
    "title: \"What the Package Does (Title Case)\"",
    "output:",
    "  github_document:",
    "    fig_width: 9",
    "    fig_height: 5",
    "---",
    "",
    "## Getting Started",
    "",
    "Build the package then launch this `htmlwidget` as follows:",
    "",
    "```{r}",
    paste("library(", project_name, ")", sep = ""),
    paste(project_name, "()", sep = ""),
    "```"
  )

  dir.create(htmlwidgets_path, recursive = TRUE, showWarnings = FALSE)
  dir.create(htmlwidgets_lib_path, recursive = TRUE, showWarnings = FALSE)

  dir.create(r_path, recursive = TRUE, showWarnings = FALSE)

  writeLines(dependencies_yaml, con = file.path(htmlwidgets_path, paste(project_name, "yaml", sep = ".")))
  writeLines("", con = file.path(htmlwidgets_lib_path, "empty.js"))

  writeLines(main_r, con = file.path(r_path, paste(project_name, "R", sep = ".")))
  writeLines(main_js, con = file.path(htmlwidgets_path, paste(project_name, "js", sep = ".")))

  writeLines(description_file, con = file.path(path, "DESCRIPTION"))
  writeLines(namespace_file, con = file.path(path, "NAMESPACE"))
  writeLines(readme_file, con = file.path(path, "README.Rmd"))

  TRUE
}
