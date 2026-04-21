test_that("pandoc_self_contained_html() errors if rmarkdown is not installed", {
  local_mocked_bindings(
    check_installed = function(pkg, ...) stop(sprintf("Package '%s' is required.", pkg)),
    .package = "rlang"
  )
  expect_error(
    pandoc_self_contained_html("input.html", "output.html"),
    "rmarkdown"
  )
})

test_that("write_md_for_pandoc() errors if rmarkdown is not installed", {
  local_mocked_bindings(
    check_installed = function(pkg, ...) stop(sprintf("Package '%s' is required.", pkg)),
    .package = "rlang"
  )
  expect_error(
    write_md_for_pandoc(htmltools::div("test"), file = tempfile(), title = "test"),
    "rmarkdown"
  )
})
