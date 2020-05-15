
pandoc_available <- function(version = NULL) {

  # ensure we've scanned for pandoc
  find_pandoc()

  # check availability
  if (!is.null(.pandoc$dir))
    if (!is.null(version))
      .pandoc$version >= version
  else
    TRUE
  else
    FALSE
}

pandoc_save_markdown <- function(html, file, background = "white", title, libdir = "lib") {
  # Forked from htmltools::save_html to work better with pandoc_self_contained_html

  # ensure that the paths to dependencies are relative to the base
  # directory where the webpage is being built.
  dir <- dirname(file)
  oldwd <- setwd(dir)
  on.exit(setwd(oldwd), add = TRUE)

  rendered <- renderTags(html)

  deps <- lapply(rendered$dependencies, function(dep) {
    dep <- htmltools::copyDependencyToDir(dep, libdir, FALSE)
    dep <- htmltools::makeDependencyRelative(dep, dir, FALSE)
    dep
  })

  # Build the markdown page. Anything that goes into the eventual <head> goes in
  # the yaml header, and will be rendered using the pandoc template.
  html <- c(
    "---",
    yaml::as.yaml(list(
      title = htmltools::htmlEscape(title),
      "header-include" = renderDependencies(deps, c("href", "file")),
      "head" = rendered$head,
      "background-color" = htmltools::htmlEscape(background, attribute = TRUE)
    )),
    "---",
    rendered$html
  )

  # write it
  writeLines(html, file, useBytes = TRUE)
}

# The input should be the path to a file that was created using pandoc_save_markdown
pandoc_self_contained_html <- function(input, output) {

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
  pandoc_convert(
    input = input,
    from = "markdown",
    output = output,
    options = c(
      "--self-contained",
      "--template", template
    )
  )

  invisible(output)
}


pandoc_convert <- function(input,
                           to = NULL,
                           from = NULL,
                           output = NULL,
                           citeproc = FALSE,
                           options = NULL,
                           verbose = FALSE,
                           wd = NULL) {

  # ensure we've scanned for pandoc
  find_pandoc()

  # execute in specified working directory
  if (is.null(wd)) {
    wd <- base_dir(input)
  }
  oldwd <- setwd(wd)
  on.exit(setwd(oldwd), add = TRUE)


  # input file and formats
  args <- c(input)
  if (!is.null(to))
    args <- c(args, "--to", to)
  if (!is.null(from))
    args <- c(args, "--from", from)

  #  output file
  if (!is.null(output))
    args <- c(args, "--output", output)

  # additional command line options
  args <- c(args, options)

  # set pandoc stack size
  stack_size <- getOption("pandoc.stack.size", default = "512m")
  args <- c(c("+RTS", paste0("-K", stack_size), "-RTS"), args)

  # build the conversion command
  command <- paste(quoted(pandoc()), paste(quoted(args), collapse = " "))

  # show it in verbose mode
  if (verbose)
    cat(command, "\n")

  # run the conversion
  with_pandoc_safe_environment({
    result <- system(command)
  })
  if (result != 0)
    stop("pandoc document conversion failed with error ", result, call. = FALSE)

  invisible(NULL)
}

# get the path to the pandoc binary
pandoc <- function() {
  find_pandoc()
  file.path(.pandoc$dir, "pandoc")
}

# Scan for a copy of pandoc and set the internal cache if it's found.
find_pandoc <- function() {

  if (is.null(.pandoc$dir)) {

    # define potential sources
    sys_pandoc <- Sys.which("pandoc")
    sources <- c(Sys.getenv("RSTUDIO_PANDOC"),
                 ifelse(nzchar(sys_pandoc), dirname(sys_pandoc), ""))
    if (!is_windows())
      sources <- c(sources, path.expand("~/opt/pandoc"))

    # determine the versions of the sources
    versions <- lapply(sources, function(src) {
      if (dir.exists(src))
        get_pandoc_version(src)
      else
        numeric_version("0")
    })

    # find the maximum version
    found_src <- NULL
    found_ver <- numeric_version("0")
    for (i in 1:length(sources)) {
      ver <- versions[[i]]
      if (ver > found_ver) {
        found_ver <- ver
        found_src <- sources[[i]]
      }
    }

    # did we find a version?
    if (!is.null(found_src)) {
      .pandoc$dir <- found_src
      .pandoc$version <- found_ver
    }
  }
}

# wrap a system call to pandoc so that LC_ALL is not set
# see: https://github.com/rstudio/rmarkdown/issues/31
# see: https://ghc.haskell.org/trac/ghc/ticket/7344
with_pandoc_safe_environment <- function(code) {
  lc_all <- Sys.getenv("LC_ALL", unset = NA)
  if (!is.na(lc_all)) {
    Sys.unsetenv("LC_ALL")
    on.exit(Sys.setenv(LC_ALL = lc_all), add = TRUE)
  }
  lc_ctype <- Sys.getenv("LC_CTYPE", unset = NA)
  if (!is.na(lc_ctype)) {
    Sys.unsetenv("LC_CTYPE")
    on.exit(Sys.setenv(LC_CTYPE = lc_ctype), add = TRUE)
  }
  if (Sys.info()['sysname'] == "Linux" &&
      is.na(Sys.getenv("HOME", unset = NA))) {
    stop("The 'HOME' environment variable must be set before running Pandoc.")
  }
  if (Sys.info()['sysname'] == "Linux" &&
      is.na(Sys.getenv("LANG", unset = NA))) {
    # fill in a the LANG environment variable if it doesn't exist
    Sys.setenv(LANG=detect_generic_lang())
    on.exit(Sys.unsetenv("LANG"), add = TRUE)
  }
  if (Sys.info()['sysname'] == "Linux" &&
      identical(Sys.getenv("LANG"), "en_US")) {
    Sys.setenv(LANG="en_US.UTF-8")
    on.exit(Sys.setenv(LANG="en_US"), add = TRUE)
  }
  force(code)
}


# if there is no LANG environment variable set pandoc is going to hang so
# we need to specify a "generic" lang setting. With glibc >= 2.13 you can
# specify C.UTF-8 so we prefer that. If we can't find that then we fall back
# to en_US.UTF-8.
detect_generic_lang <- function() {

  locale_util <- Sys.which("locale")

  if (nzchar(locale_util)) {
    locales <- system(paste(locale_util, "-a"), intern = TRUE)
    locales <- suppressWarnings(
      strsplit(locales, split = "\n", fixed = TRUE)
    )
    if ("C.UTF-8" %in% locales)
      return ("C.UTF-8")
  }

  # default to en_US.UTF-8
  "en_US.UTF-8"
}

# quote args if they need it
quoted <- function(args) {
  spaces <- grepl(' ', args, fixed=TRUE)
  args[spaces] <- shQuote(args[spaces])
  args
}

# Find common base directory, throw error if it doesn't exist
base_dir <- function(x) {
  abs <- vapply(x, tools::file_path_as_absolute, character(1))

  base <- unique(dirname(abs))
  if (length(base) > 1) {
    stop("Input files not all in same directory, please supply explicit wd",
         call. = FALSE)
  }

  base
}

# Get an S3 numeric_version for the pandoc utility at the specified path
get_pandoc_version <- function(pandoc_dir) {
  pandoc_path <- file.path(pandoc_dir, "pandoc")
  with_pandoc_safe_environment({
    version_info <- system(paste(shQuote(pandoc_path), "--version"),
                           intern = TRUE)
  })
  version <- strsplit(version_info, "\n")[[1]][1]
  version <- strsplit(version, " ")[[1]][2]
  numeric_version(version)
}

is_windows <- function() {
  identical(.Platform$OS.type, "windows")
}

# Environment used to cache the current pandoc directory and version
.pandoc <- new.env()
.pandoc$dir <- NULL
.pandoc$version <- NULL

