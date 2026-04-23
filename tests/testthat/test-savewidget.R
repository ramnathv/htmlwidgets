test_that("saveWidget errors if `selfcontained = TRUE` and `libdir` is not empty", {
  tmpdir <- tempfile()
  dir.create(tmpdir)
  on.exit(unlink(tmpdir, recursive = TRUE), add = TRUE)

  owd <- setwd(tmpdir)
  on.exit(setwd(owd), add = TRUE)

  # widget
  widget <- widget_html("widgetE", "htmlwidgets", id = "id", style = NULL, class = NULL)

  # Create a libdir with something in it
  dir.create("libdir")
  writeLines("not empty", file.path("libdir", "not-empty.txt"))

  expect_error(
    saveWidget(widget, "widget.html", selfcontained = TRUE, libdir = "libdir")
  )
})
