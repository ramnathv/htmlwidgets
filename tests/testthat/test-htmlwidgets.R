test_that("Legacy widget html methods work", {
  # Finds htmlwidgets:::widgetA_html()
  res <- widget_html("widgetA", "htmlwidgets", id = "id", style = NULL, class = NULL)
  expect_identical(res$name, "canvas")
})

test_that("Legacy widget html methods are warned on unexpected output type", {
  expect_warning(
    res <- widget_html("widgetB", "htmlwidgets", id = "id", style = NULL, class = NULL),
    "widgetB_html returned an object of class `logical` instead of a `shiny.tag`.",
    fixed = TRUE
  )
  expect_identical(res, TRUE)
})

test_that("New-style widget html method works, and is preferred", {
  # widgetC has both widgetC_html and widget_html.widgetC, and they return
  # differing results. Make sure that widget_html.widgetC is the one that's
  # actually called.
  res <- widget_html("widgetC", "htmlwidgets", id = "id", style = NULL, class = NULL)
  expect_identical(
    res,
    widget_html.widgetC("widgetC", "htmlwidgets", id = "id", style = NULL, class = NULL))
})

test_that("New-style widget html methods do not trigger warning on non-tag output", {
  expect_warning(
    res <- widget_html("widgetD", "htmlwidgets", id = "id", style = NULL, class = NULL),
    NA
  )
  expect_identical(res, TRUE)
})

test_that("Fallback logic still works", {
  res <- widget_html("does_not_exist", "htmlwidgets", id = "id", style = NULL, class = NULL)
  expect_identical(res, tags$div(id = "id"))
})

test_that("Legacy methods work with tagList() and HTML()", {
  expect_warning({
    widget_html("widgetE", "htmlwidgets", id = "id", style = NULL, class = NULL)
    widget_html("widgetF", "htmlwidgets", id = "id", style = NULL, class = NULL)
  }, NA)
})

test_that("The widget_html.default respects use_aria option", {
  res <- widget_html("does_not_exist", "htmlwidgets", id = "id", style = NULL, class = NULL, use_aria = TRUE)
  expect_identical(res, tags$div(id = "id", "aria-labelledby" = "id-aria"))
  res <- widget_html("does_not_exist", "htmlwidgets", id = "id", style = NULL, class = NULL, use_aria = FALSE)
  expect_identical(res, tags$div(id = "id"))
})
