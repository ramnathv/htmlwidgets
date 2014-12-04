### HTML Widgets for R

`htmlwidgets` is a framework for creating HTML widgets that render in various contexts including the R console, [R Markdown](http://rmarkdown.rstudio.com) documents, and [Shiny](http://shiny.rstudio.com) web applications. Widgets can include arbitrary HTML and JavaScript and are an ideal way to bridge the gap between R and JavaScript data visualization libraries. 

Some examples of packages that use `htmlwidgets` are:

* [dygraphs](http://rstudio.github.io/dygraphs/) --- Interactive time series visualization
* [networkD3](http://christophergandrud.github.io/networkD3/) --- Network visualization with D3
* [sparkline](https://github.com/htmlwidgets/sparkline) --- Small inline charts
* [DT](http://rstudio.github.io/DT/) --- Tabular data via DataTables
* [rthreejs](https://github.com/bwlewis/rthreejs) -- Interactive 3D graphics

### Getting Started

You can install the **htmlwidgets** package from GitHub:

```r
devtools::install_github('ramnathv/htmlwidgets')
```

To learn more about developing your own widgets see the package vignettes:

* [Introduction to HTML Widgets](vignettes/htmlwidgets-intro.Rmd)

* [HTML Widget Sizing](vignettes/htmlwidgets-sizing.Rmd)

* [HTML Widgets: Advanced Topics](vignettes/htmlwidgets-advanced.Rmd)


