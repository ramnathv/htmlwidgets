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

  write_md_for_pandoc(html, file, title = "test")
  pandoc_self_contained_html(file, file)
  lines <- readLines(file)
  expect_false(any(grepl("<pre", lines)))
})
