write_md_for_pandoc <- function(html, file, background = "white", title, libdir = "lib", use_raw_attr = rmarkdown::pandoc_available("2.0")) {
  # Forked from htmltools::save_html to work better with pandoc_self_contained_html

  # ensure that the paths to dependencies are relative to the base
  # directory where the webpage is being built.
  if (is.character(file)) {
    dir <- normalizePath(dirname(file), mustWork = TRUE)
    file <- file.path(dir, basename(file))
    owd <- setwd(dir)
    on.exit(setwd(owd), add = TRUE)
  }

  # Fix for https://github.com/ramnathv/htmlwidgets/issues/358: HTML indented by
  # 4 characters or more was being interpreted by pandoc_self_contained_html as
  # markdown code blocks. We have two strategies for dealing with this, but the
  # better one only works with pandoc >=2.0.
  if (use_raw_attr) {
    # Preferred strategy is to keep indenting the HTML (indent = 0 doesn't turn
    # off indentation, it just means the indentation level starts at 0), and use
    # a raw block (```{=html}...```) to protect the HTML from markdown parser.
    indent <- 0
  } else {
    # Legacy pandoc doesn't support raw blocks, so just turn off indentation
    indent <- FALSE
  }

  rendered <- renderTags(html, indent = indent)

  deps <- lapply(rendered$dependencies, function(dep) {
    dep <- htmltools::copyDependencyToDir(dep, libdir, FALSE)
    dep <- htmltools::makeDependencyRelative(dep, dir, FALSE)
    dep
  })

  deps_html <- renderDependencies(deps, c("href", "file"))

  # Build the markdown page. Anything that goes into the eventual <head> goes in
  # the yaml header, and will be rendered using the pandoc template.
  html <- c(
    "---",
    yaml::as.yaml(list(
      title = htmltools::htmlEscape(title),
      # Append a newline to prevent pandoc from treating as inline
      # (which inserts a pilcrow between blocks)
      # https://github.com/jgm/pandoc/issues/8475
      "header-include" = paste0(deps_html, "\n"),
      "head" = paste0(rendered$head, "\n"),
      "background-color" = htmltools::htmlEscape(background, attribute = TRUE)
    )),
    "---",
    if (use_raw_attr) "``````````{=html}",
    rendered$html,
    if (use_raw_attr) "``````````"
  )

  # write it
  writeLines(html, file, useBytes = TRUE)
}

# The input should be the path to a file that was created using pandoc_save_markdown
pandoc_self_contained_html <- function(input, output) {

  if (!is_installed("rmarkdown")) {
    stop(
      "Saving a widget with selfcontained = TRUE requires the rmarkdown package. ",
      "Install it with `install.packages('rmarkdown')`"
    )
  }

  if (!rmarkdown::pandoc_available()) {
    stop(
      "Saving a widget with selfcontained = TRUE requires pandoc. ",
      "See here to learn more https://bookdown.org/yihui/rmarkdown-cookbook/install-pandoc.html"
    )
  }

  # make input file path absolute
  input <- normalizePath(input)

  # ensure output file exists and make it's path absolute
  if (!file.exists(output))
    file.create(output)
  output <- normalizePath(output)

  # create a template
  template <- tempfile(fileext = ".html")
  writeLines(c(
    "<!DOCTYPE html>",
    "<html>",
    "<head>",
    "<meta charset=\"utf-8\"/>",
    "<title>$title$</title>",
    "$for(header-include)$",
    "$header-include$",
    "$endfor$",
    "$for(head)$",
    "$head$",
    "$endfor$",
    "</head>",
    "<body style=\"background-color: $background-color$;\">",
    "$body$",
    "</body>",
    "</html>"
  ), template)

  # convert from markdown to html to get base64 encoding
  # (note there is no markdown in the source document but
  # we still need to do this "conversion" to get the
  # base64 encoding)
  rmarkdown::pandoc_convert(
    input = input,
    from = "markdown",
    output = output,
    options = c("--self-contained", "--template", template)
  )

  invisible(output)
}
