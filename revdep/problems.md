# clinUtils

<details>

* Version: 0.1.3
* GitHub: https://github.com/openanalytics/clinUtils
* Source code: https://github.com/cran/clinUtils
* Date/Publication: 2022-10-24 16:25:08 UTC
* Number of recursive dependencies: 104

Run `revdepcheck::cloud_details(, "clinUtils")` for more info

</details>

## Newly broken

*   checking tests ... ERROR
    ```
      Running ‘testthat.R’
    Running the tests in ‘tests/testthat.R’ failed.
    Last 13 lines of output:
      > test_check("clinUtils")
      [ FAIL 2 | WARN 0 | SKIP 2 | PASS 300 ]
      
      ══ Skipped tests ═══════════════════════════════════════════════════════════════
      • On CRAN (2)
      
      ══ Failed tests ════════════════════════════════════════════════════════════════
      ── Failure ('test_knitPrintListPlots.R:151'): A list of interactive plots (plotly) is correctly included ──
      grep("class=\"plotly html-widget\"", outputHTMLPlots) has length 0, not length 2.
      ── Failure ('test_knitPrintListPlots.R:169'): A list of interactive objects (plotly) is correctly included ──
      grep("class=\"plotly html-widget\"", outputHTMLObjects) has length 0, not length 2.
      
      [ FAIL 2 | WARN 0 | SKIP 2 | PASS 300 ]
      Error: Test failures
      Execution halted
    ```

## In both

*   checking installed package size ... NOTE
    ```
      installed size is  6.5Mb
      sub-directories of 1Mb or more:
        doc   5.4Mb
    ```

# connectwidgets

<details>

* Version: 0.1.1
* GitHub: https://github.com/rstudio/connectwidgets
* Source code: https://github.com/cran/connectwidgets
* Date/Publication: 2021-07-23 09:40:02 UTC
* Number of recursive dependencies: 79

Run `revdepcheck::cloud_details(, "connectwidgets")` for more info

</details>

## Newly broken

*   checking tests ... ERROR
    ```
      Running ‘testthat.R’
    Running the tests in ‘tests/testthat.R’ failed.
    Last 13 lines of output:
      output[[1]][[4]]$attribs$class not equal to "rsc_grid html-widget html-widget-output".
      1/1 mismatches
      x[1]: "rsc_grid html-widget html-widget-output shiny-report-size html-fill-item-
      x[1]: overflow-hidden"
      y[1]: "rsc_grid html-widget html-widget-output"
      ── Failure ('test-rsc_search.R:89'): rscsearchOutput ───────────────────────────
      output[[1]][[4]]$attribs$class not equal to "rsc_search html-widget html-widget-output".
      1/1 mismatches
      x[1]: "rsc_search html-widget html-widget-output shiny-report-size html-fill-ite
      x[1]: m-overflow-hidden"
      y[1]: "rsc_search html-widget html-widget-output"
      
      [ FAIL 4 | WARN 4 | SKIP 0 | PASS 114 ]
      Error: Test failures
      Execution halted
    ```

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespaces in Imports field not imported from:
      ‘R6’ ‘httr’ ‘jsonlite’
      All declared Imports should be used.
    ```

# slickR

<details>

* Version: 0.5.0
* GitHub: https://github.com/yonicd/slickR
* Source code: https://github.com/cran/slickR
* Date/Publication: 2020-12-18 16:10:02 UTC
* Number of recursive dependencies: 91

Run `revdepcheck::cloud_details(, "slickR")` for more info

</details>

## Newly broken

*   checking tests ... ERROR
    ```
      Running ‘testthat.R’
    Running the tests in ‘tests/testthat.R’ failed.
    Last 13 lines of output:
      ── Failure ('test-widget.R:80'): slickR settings: add dots ─────────────────────
      w1 + settings(dots = TRUE) not equal to readRDS("../assets/widget_settings.Rds").
      Component "sizingPolicy": Names: 3 string mismatches
      Component "sizingPolicy": Length mismatch: comparison on first 6 components
      Component "sizingPolicy": Component 4: target is NULL, current is list
      Component "sizingPolicy": Component 5: Names: 1 string mismatch
      Component "sizingPolicy": Component 5: Length mismatch: comparison on first 5 components
      Component "sizingPolicy": Component 5: Component "fill": 1 element mismatch
      Component "sizingPolicy": Component 6: Names: 1 string mismatch
      Component "sizingPolicy": Component 6: Length mismatch: comparison on first 3 components
      Component "sizingPolicy": Component 6: Component 3: target is NULL, current is logical
      
      [ FAIL 8 | WARN 0 | SKIP 0 | PASS 19 ]
      Error: Test failures
      Execution halted
    ```

