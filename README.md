### HTML Widgets for R

The **htmlwidgets** package provides a framework for easily creating R bindings to JavaScript libraries. Widgets created using the framework can be:

* Used at the R console for data analysis just like conventional R plots (via RStudio Viewer).
* Seamlessly embedded within [R Markdown](http://rmarkdown.rstudio.com) documents and [Shiny](http://shiny.rstudio.com) web applications.
* Saved as standalone web pages for ad-hoc sharing via email, Dropbox, etc.

There are already several R packages based on **htmlwidgets**, including:

* [leaflet](https://github.com/rstudio/leaflet) -- Interactive maps with OpenStreetMap
* [dygraphs](http://rstudio.github.io/dygraphs/) --- Interactive time series visualization
* [networkD3](http://christophergandrud.github.io/networkD3/) --- Network visualization with D3
* [sparkline](https://github.com/htmlwidgets/sparkline) --- Small inline charts
* [DT](http://rstudio.github.io/DT/) --- Tabular data via DataTables
* [rthreejs](https://github.com/bwlewis/rthreejs) -- Interactive 3D graphics
* [cofeewheel](https://github.com/bwlewis/rthreejs) -- Interactive hierarchical data visualization with D3 Sunburst

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

There are several package vignettes that will help you get you off the ground quickly and take advantage of all of the capabilities of the framework:

* [Introduction to HTML Widgets](vignettes/htmlwidgets-intro.Rmd)

* [HTML Widget Sizing](vignettes/htmlwidgets-sizing.Rmd)

* [HTML Widgets: Advanced Topics](vignettes/htmlwidgets-advanced.Rmd)


