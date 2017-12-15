projectTemplate <- function(path, ...) {
  project_name <- tolower(basename(path))

  dots <- list(...)
  bower <- if (nchar(dots$bower) == 0) NULL else dots$bower

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
    paste("export(", project_name, ")", sep = "")
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
    "```{r eval=FALSE}",
    paste("library(", project_name, ")", sep = ""),
    paste(project_name, "(\"Hello World\")", sep = ""),
    "```"
  )

  dir.create(path, recursive = TRUE)
  dir.create(file.path(path, "R"), recursive = TRUE)

  writeLines(description_file, con = file.path(path, "DESCRIPTION"))
  writeLines(namespace_file, con = file.path(path, "NAMESPACE"))
  writeLines(readme_file, con = file.path(path, "README.Rmd"))

  setwd(project_name)
  scaffoldWidget(name = project_name, edit = FALSE, bowerPkg = bower)

  TRUE
}
