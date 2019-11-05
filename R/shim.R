# Borrowed from pkgload::dev_meta, with some modifications.
devtools_loaded <- function(pkg) {
  ns <- .getNamespace(pkg)
  if (is.null(ns) || is.null(ns$.__DEVTOOLS__)) {
    return(FALSE)
  }

  TRUE
}


# Borrowed from pkgload::shim_system.file, with some modifications.
system.file <- function(..., package = "base", lib.loc = NULL,
                             mustWork = FALSE) {

  # If package wasn't loaded with devtools, pass through to base::system.file.
  # If package was loaded with devtools (the package loaded with load_all)
  # search for files a bit differently.
  if (devtools_loaded(package)) {
    pkg_path <- find.package(package)

    # First look in inst/
    files_inst <- file.path(pkg_path, "inst", ...)
    present_inst <- file.exists(files_inst)

    # For any files that weren't present in inst/, look in the base path
    files_top <- file.path(pkg_path, ...)
    present_top <- file.exists(files_top)

    # Merge them together. Here are the different possible conditions, and the
    # desired result. NULL means to drop that element from the result.
    #
    # files_inst:   /inst/A  /inst/B  /inst/C  /inst/D
    # present_inst:    T        T        F        F
    # files_top:      /A       /B       /C       /D
    # present_top:     T        F        T        F
    # result:       /inst/A  /inst/B    /C       NULL
    #
    files <- files_top
    files[present_inst] <- files_inst[present_inst]
    # Drop cases where not present in either location
    files <- files[present_inst | present_top]
    if (length(files) > 0) {
      # Make sure backslahses are replaced with slashes on Windows
      normalizePath(files, winslash = "/")
    } else {
      if (mustWork) {
        stop("No file found", call. = FALSE)
      } else {
        ""
      }
    }
    # Note that the behavior isn't exactly the same as base::system.file with an
    # installed package; in that case, C and D would not be installed and so
    # would not be found. Some other files (like DESCRIPTION, data/, etc) would
    # be installed. To fully duplicate R's package-building and installation
    # behavior would be complicated, so we'll just use this simple method.
  } else {
    base::system.file(..., package = package, lib.loc = lib.loc,
      mustWork = mustWork)
  }
}
