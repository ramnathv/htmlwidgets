\docType{package}
\name{htmlwidgets-package}
\alias{htmlwidgets}
\alias{htmlwidgets-package}
\title{HTML Widgets for R}
\description{
The \pkg{htmlwidgets} package provides a framework for easily creating R bindings to JavaScript libraries. Widgets created using the framework can be:
\enumerate{
\item Used at the R console for data analysis just like conventional R plots (via RStudio Viewer)
\item Seamlessly embedded within \href{http://rmarkdown.rstudio.com}{R Markdown} documents and \href{https://shiny.rstudio.com/}{Shiny} web applications.
\item Saved as standalone web pages for ad-hoc sharing via email, Dropbox, etc.
}

To get started creating your own HTML widgets, see the documentation available in the package vignettes:

\preformatted{
   vignette("develop_intro", package = "htmlwidgets")
   vignette("develop_sizing", package = "htmlwidgets")
   vignette("develop_advanced", package = "htmlwidgets")
}

Source code for the package is available on GitHub:

\href{https://github.com/ramnathv/htmlwidgets}{https://github.com/ramnathv/htmlwidgets}

}
\author{
Ramnath Vaidyanathan, Joe Cheng, JJ Allaire, and Yihui Xie
}

