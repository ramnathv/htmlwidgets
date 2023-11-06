### HTML Widgets for R

<!-- badges: start -->
[![R build status](https://github.com/ramnathv/htmlwidgets/workflows/R-CMD-check/badge.svg)](https://github.com/ramnathv/htmlwidgets/actions)
[![CRAN status](https://www.r-pkg.org/badges/version/htmlwidgets)](https://CRAN.R-project.org/package=htmlwidgets)
[![Lifecycle: stable](https://img.shields.io/badge/lifecycle-stable-brightgreen.svg)](https://lifecycle.r-lib.org/articles/stages.html)
<!-- badges: end -->

The **htmlwidgets** package provides a framework for easily creating R bindings to JavaScript libraries. Widgets created using the framework can be:

* Used at the R console for data analysis just like conventional R plots (via RStudio Viewer).
* Seamlessly embedded within [R Markdown](https://rmarkdown.rstudio.com/) documents and [Shiny](https://shiny.posit.co/) web applications.
* Saved as standalone web pages for ad-hoc sharing via email, Dropbox, etc.

There are already several R packages based on **htmlwidgets**, including:

* [leaflet](https://github.com/rstudio/leaflet) -- Interactive maps with OpenStreetMap
* [dygraphs](https://rstudio.github.io/dygraphs/) --- Interactive time series visualization
* [networkD3](https://christophergandrud.github.io/networkD3/) --- Network visualization with D3
* [sparkline](https://github.com/htmlwidgets/sparkline) --- Small inline charts
* [DT](https://rstudio.github.io/DT/) --- Tabular data via DataTables
* [rthreejs](https://github.com/bwlewis/rthreejs) -- Interactive 3D graphics

The package was created in collaboration by Ramnath Vaidyanathan, Joe Cheng, JJ Allaire, Yihui Xie, and Kenton Russell. We've all spent countless hours building bindings between R and the web, and were motivated to create a framework that made this as easy as possible for all R developers. 

### Getting Started

If you know R and a bit of JavaScript it's very straightforward to create your own widgets. You can install the **htmlwidgets** package from CRAN:

```r
install.packages("htmlwidgets")
```

You can alternatively install the development version of **htmlwidgets** from GitHub as follows:

```r
devtools::install_github('ramnathv/htmlwidgets')
```

There are several articles on the htmlwidgets website that will help you get you off the ground quickly and take advantage of all of the capabilities of the framework:

* [Introduction to HTML Widgets](http://www.htmlwidgets.org/develop_intro.html)

* [HTML Widget Sizing](http://www.htmlwidgets.org/develop_sizing.html)

* [HTML Widgets: Advanced Topics](http://www.htmlwidgets.org/develop_advanced.html)


