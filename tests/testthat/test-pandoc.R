test_that("Fix for issue #358 works", {
  skip_if_not(
    rmarkdown::pandoc_available(),
    "Test requires pandoc to be installed"
  )

  file <- tempfile(fileext = ".html")
  html <- div(
    div(
      div(
        div(
          div(
            "Hello"
          )
        )
      )
    )
  )

  get_pandoc_html <- function(html, file, title = "test", ...) {
    write_md_for_pandoc(html, file, title = title, ...)
    pandoc_self_contained_html(file, file)
    readLines(file)
  }

  lines <- get_pandoc_html(html, file)
  expect_false(any(grepl("<pre", lines)))

  lines <- get_pandoc_html(html, file, use_raw_attr = FALSE)
  expect_false(any(grepl("<pre", lines)))
})
