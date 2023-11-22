# canvasXpress

<details>

* Version: 1.46.9
* GitHub: https://github.com/neuhausi/canvasXpress
* Source code: https://github.com/cran/canvasXpress
* Date/Publication: 2023-11-03 20:30:05 UTC
* Number of recursive dependencies: 101

Run `revdepcheck::cloud_details(, "canvasXpress")` for more info

</details>

## Newly broken

*   checking tests ... ERROR
    ```
      Running ‘testthat.R’
    Running the tests in ‘tests/testthat.R’ failed.
    Complete output:
      > library(testthat)
      > library(canvasXpress)
      > require(canvasXpress.data)
      Loading required package: canvasXpress.data
      > 
      > test_check("canvasXpress")
      Loading required package: htmlwidgets
    ...
      x[1]: "<div class=\"canvasXpress html-widget html-widget-output shiny-report-siz
      x[1]: e html-fill-item\" id=\"test_id\" style=\"width:100%;height:400px;\"></div
      x[1]: >"
      y[1]: "<div class=\"canvasXpress html-widget html-widget-output shiny-report-siz
      y[1]: e html-fill-item-overflow-hidden html-fill-item\" id=\"test_id\" style=\"w
      y[1]: idth:100%;height:400px;\"></div>"
      
      [ FAIL 1 | WARN 0 | SKIP 456 | PASS 44 ]
      Error: Test failures
      Execution halted
    ```

