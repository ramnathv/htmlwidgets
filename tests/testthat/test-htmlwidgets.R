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

dep_names <- function(deps) {
  deps <- Filter(Negate(is.null), deps)
  vapply(deps, function(d) d$name, character(1))
}

test_that("widgetDependencies.character returns YAML + binding deps", {
  deps <- widgetDependencies("nonexistent_widget", package = "htmlwidgets")
  expect_true("htmlwidgets" %in% dep_names(deps))
})

test_that("widgetDependencies.htmlwidget returns YAML + binding + runtime deps", {
  extra_dep <- htmltools::htmlDependency(
    name = "extra-dep", version = "1.0", src = ".",
    script = "extra.js"
  )
  w <- createWidget(
    name = "nonexistent_widget",
    x = list(),
    package = "htmlwidgets",
    dependencies = list(extra_dep)
  )
  deps <- widgetDependencies(w)
  expect_true("htmlwidgets" %in% dep_names(deps))
  expect_true("extra-dep" %in% dep_names(deps))
})

test_that("widgetDependencies.htmlwidget works with NULL dependencies", {
  w <- createWidget(
    name = "nonexistent_widget",
    x = list(),
    package = "htmlwidgets"
  )
  deps <- widgetDependencies(w)
  expect_true("htmlwidgets" %in% dep_names(deps))
})
