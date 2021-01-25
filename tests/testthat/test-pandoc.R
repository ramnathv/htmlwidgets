test_358 <- function() {
  file <- tempfile(fileext = ".html")
  html <- htmltools::withTags(
    div(
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
  )

  pandoc_save_markdown(html, file, title = "test")
  pandoc_self_contained_html(file, file)
  browseURL(file)
  lines <- readLines(file)
  expect_false(any(grepl("<pre", lines)))
}

test_that("Fix for issue #358 works", {
  test_358()

  orig_version <- .pandoc$version
  on.exit(.pandoc$version <- orig_version, add = TRUE)
  .pandoc$version <- "1.9"
  test_358()
})
