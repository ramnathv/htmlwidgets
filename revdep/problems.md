# apexcharter

<details>

* Version: 0.1.6
* GitHub: https://github.com/dreamRs/apexcharter
* Source code: https://github.com/cran/apexcharter
* Date/Publication: 2020-09-09 14:50:07 UTC
* Number of recursive dependencies: 73

Run `revdep_details(, "apexcharter")` for more info

</details>

## In both

*   checking data for non-ASCII characters ... NOTE
    ```
      Note: found 230 marked UTF-8 strings
    ```

# bea.R

<details>

* Version: 1.0.6
* GitHub: https://github.com/us-bea/bea.R
* Source code: https://github.com/cran/bea.R
* Date/Publication: 2018-02-23 19:30:19 UTC
* Number of recursive dependencies: 76

Run `revdep_details(, "bea.R")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespaces in Imports field not imported from:
      ‘Rcpp’ ‘chron’ ‘colorspace’ ‘gtable’ ‘htmltools’ ‘htmlwidgets’
      ‘httpuv’ ‘magrittr’ ‘munsell’ ‘plyr’ ‘scales’ ‘stringi’ ‘xtable’
      ‘yaml’
      All declared Imports should be used.
    ```

# bigPint

<details>

* Version: 1.4.0
* GitHub: https://github.com/lindsayrutter/bigPint
* Source code: https://github.com/cran/bigPint
* Date/Publication: 2020-04-27
* Number of recursive dependencies: 165

Run `revdep_details(, "bigPint")` for more info

</details>

## In both

*   checking examples ... ERROR
    ```
    ...
    > # blue parallel coordinate lines.
    > 
    > geneList = soybean_ir_sub_metrics[["N_P"]][1:10,]$ID
    > ret <- plotPCP(data = soybean_ir_sub, geneList = geneList, lineSize = 0.3, 
    +     lineColor = "blue", saveFile = FALSE)
    > ret[[1]]
    > 
    > # Example 4: Repeat this same procedure, only now set the hover parameter to 
    > # TRUE to allow us to hover over blue parallel coordinate lines and
    > # determine their individual IDs.
    > 
    > ret <- plotPCP(data = soybean_ir_sub, geneList = geneList, lineSize = 0.3, 
    +     lineColor = "blue", saveFile = FALSE, hover = TRUE)
    Error: .onLoad failed in loadNamespace() for 'Cairo', details:
      call: dyn.load(file, DLLpath = DLLpath, ...)
      error: unable to load shared object '/Library/Frameworks/R.framework/Versions/4.0/Resources/library/Cairo/libs/Cairo.so':
      dlopen(/Library/Frameworks/R.framework/Versions/4.0/Resources/library/Cairo/libs/Cairo.so, 6): Symbol not found: _EXTPTR_PTR
      Referenced from: /Library/Frameworks/R.framework/Versions/4.0/Resources/library/Cairo/libs/Cairo.so
      Expected in: /Library/Frameworks/R.framework/Versions/4.0/Resources/lib/libR.dylib
     in /Library/Frameworks/R.framework/Versions/4.0/Resources/library/Cairo/libs/Cairo.so
    Execution halted
    ```

*   checking installed package size ... NOTE
    ```
      installed size is  8.1Mb
      sub-directories of 1Mb or more:
        data             2.1Mb
        doc              2.7Mb
        shiny-examples   3.0Mb
    ```

# billboarder

<details>

* Version: 0.2.8
* GitHub: https://github.com/dreamRs/billboarder
* Source code: https://github.com/cran/billboarder
* Date/Publication: 2020-01-09 18:30:26 UTC
* Number of recursive dependencies: 77

Run `revdep_details(, "billboarder")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is  5.0Mb
      sub-directories of 1Mb or more:
        doc   3.4Mb
    ```

# bioCancer

<details>

* Version: 1.16.0
* GitHub: https://github.com/kmezhoud/bioCancer
* Source code: https://github.com/cran/bioCancer
* Date/Publication: 2020-04-27
* Number of recursive dependencies: 208

Run `revdep_details(, "bioCancer")` for more info

</details>

## In both

*   checking Rd files ... WARNING
    ```
    checkRd: (5) bioCancer.Rd:0-20: Must have a \description
    ```

*   checking installed package size ... NOTE
    ```
      installed size is  8.3Mb
      sub-directories of 1Mb or more:
        app       3.3Mb
        doc       2.8Mb
        extdata   1.6Mb
    ```

*   checking dependencies in R code ... NOTE
    ```
    Namespaces in Imports field not imported from:
      ‘AlgDesign’ ‘import’ ‘methods’ ‘shinythemes’
      All declared Imports should be used.
    ```

# BiocPkgTools

<details>

* Version: 1.6.0
* GitHub: https://github.com/seandavi/BiocPkgTools
* Source code: https://github.com/cran/BiocPkgTools
* Date/Publication: 2020-04-27
* Number of recursive dependencies: 116

Run `revdep_details(, "BiocPkgTools")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘rappdirs’
      All declared Imports should be used.
    Unexported object imported by a ':::' call: ‘BiocManager:::.repositories’
      See the note in ?`:::` about the use of this operator.
    ```

# cellscape

<details>

* Version: 1.12.0
* GitHub: NA
* Source code: https://github.com/cran/cellscape
* Date/Publication: 2020-04-27
* Number of recursive dependencies: 39

Run `revdep_details(, "cellscape")` for more info

</details>

## In both

*   checking Rd \usage sections ... WARNING
    ```
    Duplicated \argument entries in documentation object 'dfs_tree':
      ‘chrom_bounds’ ‘ncols’ ‘chrom_bounds’ ‘cnv_data’ ‘chrom_bounds’
      ‘n_bp_per_pixel’ ‘mut_data’ ‘width’ ‘height’ ‘mutations’ ‘height’
      ‘width’ ‘clonal_prev’ ‘tree_edges’ ‘alpha’ ‘clonal_prev’ ‘tree_edges’
      ‘genotype_position’ ‘clone_colours’ ‘perturbations’ ‘mutations’
      ‘tree_edges’ ‘clonal_prev’ ‘clonal_prev’ ‘tree_edges’ ‘clone_colours’
      ‘mutations’
    
    Functions with \usage entries need to have the appropriate \alias
    entries, and all their arguments documented.
    The \usage entries must correspond to syntactically valid R code.
    See chapter ‘Writing R documentation files’ in the ‘Writing R
    Extensions’ manual.
    ```

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘plyr’
      All declared Imports should be used.
    ```

*   checking R code for possible problems ... NOTE
    ```
    ...
    getMutOrder: no visible binding for global variable ‘VAF’
    getMutOrder: no visible global function definition for ‘lm’
    getMutOrder: no visible binding for global variable ‘na.omit’
    getMutOrder: no visible global function definition for ‘coef’
    getMutationsData: no visible binding for global variable
      ‘show_warnings’
    getTargetedHeatmapForEachSC: no visible binding for global variable
      ‘single_cell_id’
    getTargetedHeatmapForEachSC: no visible binding for global variable
      ‘chr’
    getTargetedHeatmapForEachSC: no visible binding for global variable
      ‘coord’
    Undefined global functions or variables:
      VAF chr chrom_index coef combn coord copy_number cumsum_values dist
      genotype hclust lm melt mode_cnv n n_gt na.omit px px_width sc_id
      setNames show_warnings single_cell_id site timepoint
    Consider adding
      importFrom("stats", "coef", "dist", "hclust", "lm", "na.omit",
                 "setNames")
      importFrom("utils", "combn")
    to your NAMESPACE file.
    ```

*   checking for unstated dependencies in vignettes ... NOTE
    ```
    '::' or ':::' import not declared from: ‘BiocManager’
    'library' or 'require' calls not declared from:
      ‘BiocManager’ ‘devtools’
    ```

# chromoMap

<details>

* Version: 0.2
* GitHub: NA
* Source code: https://github.com/cran/chromoMap
* Date/Publication: 2019-04-10 19:27:11 UTC
* Number of recursive dependencies: 32

Run `revdep_details(, "chromoMap")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘htmltools’
      All declared Imports should be used.
    ```

# D3partitionR

<details>

* Version: 0.5.0
* GitHub: NA
* Source code: https://github.com/cran/D3partitionR
* Date/Publication: 2017-10-07 14:36:03 UTC
* Number of recursive dependencies: 12

Run `revdep_details(, "D3partitionR")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘titanic’
      All declared Imports should be used.
    ```

# d3Tree

<details>

* Version: 0.2.0
* GitHub: https://github.com/metrumresearchgroup/d3Tree
* Source code: https://github.com/cran/d3Tree
* Date/Publication: 2017-06-13 20:35:10 UTC
* Number of recursive dependencies: 50

Run `revdep_details(, "d3Tree")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘magrittr’
      All declared Imports should be used.
    ```

# datadigest

<details>

* Version: 1.0.2
* GitHub: https://github.com/RhoInc/datadigest
* Source code: https://github.com/cran/datadigest
* Date/Publication: 2018-09-03 11:10:06 UTC
* Number of recursive dependencies: 92

Run `revdep_details(, "datadigest")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘miniUI’
      All declared Imports should be used.
    ```

# DataVisualizations

<details>

* Version: 1.2.0
* GitHub: https://github.com/Mthrun/DataVisualizations
* Source code: https://github.com/cran/DataVisualizations
* Date/Publication: 2020-08-04 16:34:11 UTC
* Number of recursive dependencies: 160

Run `revdep_details(, "DataVisualizations")` for more info

</details>

## In both

*   checking Rd cross-references ... NOTE
    ```
    Package unavailable to check Rd xrefs: ‘FCPS’
    ```

# DiagrammeR

<details>

* Version: 1.0.6.1
* GitHub: https://github.com/rich-iannone/DiagrammeR
* Source code: https://github.com/cran/DiagrammeR
* Date/Publication: 2020-05-08 21:40:02 UTC
* Number of recursive dependencies: 87

Run `revdep_details(, "DiagrammeR")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is 14.1Mb
      sub-directories of 1Mb or more:
        doc           9.7Mb
        htmlwidgets   2.8Mb
    ```

*   checking data for non-ASCII characters ... NOTE
    ```
      Note: found 1 marked UTF-8 string
    ```

# dsa

<details>

* Version: 0.74.18
* GitHub: NA
* Source code: https://github.com/cran/dsa
* Date/Publication: 2020-04-15 14:40:02 UTC
* Number of recursive dependencies: 78

Run `revdep_details(, "dsa")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespaces in Imports field not imported from:
      ‘rJava’ ‘tools’ ‘xtable’
      All declared Imports should be used.
    ```

# EBImage

<details>

* Version: 4.30.0
* GitHub: https://github.com/aoles/EBImage
* Source code: https://github.com/cran/EBImage
* Date/Publication: 2020-04-27
* Number of recursive dependencies: 45

Run `revdep_details(, "EBImage")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is  7.6Mb
      sub-directories of 1Mb or more:
        doc      5.1Mb
        images   1.7Mb
    ```

# EGSEA

<details>

* Version: 1.16.0
* GitHub: NA
* Source code: https://github.com/cran/EGSEA
* Date/Publication: 2020-04-27
* Number of recursive dependencies: 184

Run `revdep_details(, "EGSEA")` for more info

</details>

## In both

*   checking R code for possible problems ... NOTE
    ```
    buildGeneSetDBIdx: no visible binding for global variable ‘GOTERM’
    buildMSigDBIdx: no visible binding for global variable ‘msigdb’
    generateSummaryPlots: no visible binding for global variable ‘x.data’
    generateSummaryPlots: no visible binding for global variable ‘y.data’
    generateSummaryPlots: no visible binding for global variable ‘gsSize’
    generateSummaryPlots: no visible binding for global variable ‘id’
    generateSummaryPlots: no visible binding for global variable ‘sig’
    loadKeggData: no visible binding for global variable ‘kegg.pathways’
    Undefined global functions or variables:
      GOTERM gsSize id kegg.pathways msigdb sig x.data y.data
    ```

# EML

<details>

* Version: 2.0.3
* GitHub: https://github.com/ropensci/EML
* Source code: https://github.com/cran/EML
* Date/Publication: 2020-07-23 04:43:06 UTC
* Number of recursive dependencies: 94

Run `revdep_details(, "EML")` for more info

</details>

## In both

*   checking package dependencies ... NOTE
    ```
    Package suggested but not available for checking: ‘EML’
    ```

# epiflows

<details>

* Version: 0.2.0
* GitHub: https://github.com/reconhub/epiflows
* Source code: https://github.com/cran/epiflows
* Date/Publication: 2018-08-14 12:40:03 UTC
* Number of recursive dependencies: 130

Run `revdep_details(, "epiflows")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘htmlwidgets’
      All declared Imports should be used.
    ```

# g3viz

<details>

* Version: 1.1.3
* GitHub: https://github.com/G3viz/g3viz
* Source code: https://github.com/cran/g3viz
* Date/Publication: 2020-08-27 04:00:03 UTC
* Number of recursive dependencies: 57

Run `revdep_details(, "g3viz")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is 10.6Mb
      sub-directories of 1Mb or more:
        doc   9.3Mb
    ```

# GeneNetworkBuilder

<details>

* Version: 1.30.0
* GitHub: NA
* Source code: https://github.com/cran/GeneNetworkBuilder
* Date/Publication: 2020-04-27
* Number of recursive dependencies: 74

Run `revdep_details(, "GeneNetworkBuilder")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is 11.6Mb
      sub-directories of 1Mb or more:
        data          2.8Mb
        doc           6.5Mb
        htmlwidgets   1.8Mb
    ```

# GenEst

<details>

* Version: 1.4.4
* GitHub: NA
* Source code: https://github.com/cran/GenEst
* Date/Publication: 2020-06-08 18:20:03 UTC
* Number of recursive dependencies: 84

Run `revdep_details(, "GenEst")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘htmlwidgets’
      All declared Imports should be used.
    ```

# hchinamap

<details>

* Version: 0.1.0
* GitHub: https://github.com/czxa/hchinamap
* Source code: https://github.com/cran/hchinamap
* Date/Publication: 2019-08-23 08:50:02 UTC
* Number of recursive dependencies: 76

Run `revdep_details(, "hchinamap")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is  5.5Mb
      sub-directories of 1Mb or more:
        doc           2.7Mb
        htmlwidgets   2.8Mb
    ```

# heatmaply

<details>

* Version: 1.1.1
* GitHub: https://github.com/talgalili/heatmaply
* Source code: https://github.com/cran/heatmaply
* Date/Publication: 2020-08-25 06:40:12 UTC
* Number of recursive dependencies: 102

Run `revdep_details(, "heatmaply")` for more info

</details>

## In both

*   checking tests ...
    ```
     ERROR
    Running the tests in ‘tests/testthat.R’ failed.
    Last 13 lines of output:
      ══ testthat results  ═══════════════════════════════════════════════════════════
      [ OK: 189 | SKIPPED: 0 | WARNINGS: 0 | FAILED: 56 ]
      1. Error: heatmaply mtcars (both dend) (@test_heatmaply.R#6) 
      2. Error: heatmaply mtcars (no dend) (@test_heatmaply.R#14) 
      3. Error: heatmaply mtcars (coldend only) (@test_heatmaply.R#22) 
      4. Error: heatmaply mtcars (rowdend only) (@test_heatmaply.R#30) 
      5. Error: heatmaply mtcars (rscols, both dend) (@test_heatmaply.R#39) 
      6. Error: heatmaply mtcars (rscols, row dend) (@test_heatmaply.R#49) 
      7. Error: heatmaply mtcars (rscols, row dend) (@test_heatmaply.R#59) 
      8. Error: heatmaply mtcars (rscols, no dends) (@test_heatmaply.R#69) 
      9. Error: heatmaply mtcars (cscols, both dend) (@test_heatmaply.R#78) 
      1. ...
      
      Error: testthat unit tests failed
      Execution halted
    ```

*   checking installed package size ... NOTE
    ```
      installed size is  5.4Mb
      sub-directories of 1Mb or more:
        doc   5.0Mb
    ```

# hwordcloud

<details>

* Version: 0.1.0
* GitHub: https://github.com/czxa/hwordcloud
* Source code: https://github.com/cran/hwordcloud
* Date/Publication: 2019-08-07 04:50:02 UTC
* Number of recursive dependencies: 73

Run `revdep_details(, "hwordcloud")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespaces in Imports field not imported from:
      ‘colourpicker’ ‘shiny’ ‘wordcloud2’
      All declared Imports should be used.
    ```

# INDperform

<details>

* Version: 0.2.2
* GitHub: https://github.com/SaskiaAOtto/INDperform
* Source code: https://github.com/cran/INDperform
* Date/Publication: 2020-01-09 12:30:14 UTC
* Number of recursive dependencies: 86

Run `revdep_details(, "INDperform")` for more info

</details>

## In both

*   checking examples ... ERROR
    ```
    Running examples in ‘INDperform-Ex.R’ failed
    The error most likely occurred in:
    
    > ### Name: merge_models
    > ### Title: Merging two model output tibbles.
    > ### Aliases: merge_models
    > 
    > ### ** Examples
    > 
    > # Using some models of the Baltic Sea demo data:
    > # Merging GAM and GAMM tibbles
    > test_ids <- 47:50 # choose subset
    > gam_tbl <- model_gam_ex[test_ids,]
    > gamm_tbl <- model_gamm(ind_init_ex[test_ids,], filter= gam_tbl$tac)
    Error in model_gamm(ind_init_ex[test_ids, ], filter = gam_tbl$tac) : 
      No IND~pressure GAMM could be fitted! Check if you chose the correct error distribution (default is gaussian()).
    Execution halted
    ```

*   checking tests ...
    ```
     ERROR
    Running the tests in ‘tests/testthat.R’ failed.
    Last 13 lines of output:
      Assigned data `"x < 0.3"` must be compatible with existing data.
      ℹ Error occurred for column `condition`.
      ✖ Can't convert <character> to <list>.
      Backtrace:
      
      ══ testthat results  ═══════════════════════════════════════════════════════════
      [ OK: 474 | SKIPPED: 0 | WARNINGS: 10 | FAILED: 5 ]
      1. Error: (unknown) (@test_calc_deriv.R#6) 
      2. Error: (unknown) (@test_cond_boot.R#112) 
      3. Failure: test class and value of get_sum_output (@test_get_sum_output.R#24) 
      4. Error: (unknown) (@test_model_gamm.R#4) 
      5. Error: (unknown) (@test_scoring.R#15) 
      
      Error: testthat unit tests failed
      Execution halted
    ```

*   checking installed package size ... NOTE
    ```
      installed size is  5.1Mb
      sub-directories of 1Mb or more:
        data   3.1Mb
        help   1.6Mb
    ```

# KDViz

<details>

* Version: 1.3.1
* GitHub: NA
* Source code: https://github.com/cran/KDViz
* Date/Publication: 2019-01-13 17:00:03 UTC
* Number of recursive dependencies: 43

Run `revdep_details(, "KDViz")` for more info

</details>

## In both

*   checking data for non-ASCII characters ... NOTE
    ```
      Note: found 11 marked UTF-8 strings
    ```

# leaflet.extras2

<details>

* Version: 1.0.0
* GitHub: https://github.com/trafficonese/leaflet.extras2
* Source code: https://github.com/cran/leaflet.extras2
* Date/Publication: 2020-05-18 15:10:06 UTC
* Number of recursive dependencies: 90

Run `revdep_details(, "leaflet.extras2")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘htmlwidgets’
      All declared Imports should be used.
    ```

# leafpm

<details>

* Version: 0.1.0
* GitHub: https://github.com/r-spatial/leafpm
* Source code: https://github.com/cran/leafpm
* Date/Publication: 2019-03-13 12:10:03 UTC
* Number of recursive dependencies: 74

Run `revdep_details(, "leafpm")` for more info

</details>

## In both

*   checking package dependencies ... NOTE
    ```
    Packages which this enhances but not available for checking:
      'geojsonio', 'mapedit', 'mapview'
    ```

*   checking dependencies in R code ... NOTE
    ```
    Namespaces in Imports field not imported from:
      ‘dplyr’ ‘htmlwidgets’ ‘jsonlite’ ‘sf’
      All declared Imports should be used.
    ```

# leafsync

<details>

* Version: 0.1.0
* GitHub: https://github.com/r-spatial/leafsync
* Source code: https://github.com/cran/leafsync
* Date/Publication: 2019-03-05 15:10:03 UTC
* Number of recursive dependencies: 63

Run `revdep_details(, "leafsync")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘leaflet’
      All declared Imports should be used.
    ```

# mapdeck

<details>

* Version: 0.3.4
* GitHub: https://github.com/SymbolixAU/mapdeck
* Source code: https://github.com/cran/mapdeck
* Date/Publication: 2020-09-04 05:22:10 UTC
* Number of recursive dependencies: 75

Run `revdep_details(, "mapdeck")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is  8.4Mb
      sub-directories of 1Mb or more:
        data          1.3Mb
        doc           1.6Mb
        htmlwidgets   2.2Mb
        libs          2.9Mb
    ```

# mapedit

<details>

* Version: 0.6.0
* GitHub: https://github.com/r-spatial/mapedit
* Source code: https://github.com/cran/mapedit
* Date/Publication: 2020-02-02 17:20:02 UTC
* Number of recursive dependencies: 100

Run `revdep_details(, "mapedit")` for more info

</details>

## In both

*   checking package dependencies ... NOTE
    ```
    Package which this enhances but not available for checking: ‘geojsonio’
    ```

# mapscape

<details>

* Version: 1.12.0
* GitHub: NA
* Source code: https://github.com/cran/mapscape
* Date/Publication: 2020-04-27
* Number of recursive dependencies: 19

Run `revdep_details(, "mapscape")` for more info

</details>

## In both

*   checking Rd files ... WARNING
    ```
    man/mapscape.Rd: non-ASCII input and no declared encoding
    problem found in ‘mapscape.Rd’
    ```

*   checking installed package size ... NOTE
    ```
      installed size is  6.6Mb
      sub-directories of 1Mb or more:
        doc       4.0Mb
        extdata   1.6Mb
    ```

# mdsr

<details>

* Version: 0.2.0
* GitHub: https://github.com/beanumber/mdsr
* Source code: https://github.com/cran/mdsr
* Date/Publication: 2020-09-03 22:32:09 UTC
* Number of recursive dependencies: 129

Run `revdep_details(, "mdsr")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is  6.7Mb
      sub-directories of 1Mb or more:
        data   6.5Mb
    ```

*   checking data for non-ASCII characters ... NOTE
    ```
      Note: found 2866 marked UTF-8 strings
    ```

# MetaVolcanoR

<details>

* Version: 1.2.0
* GitHub: NA
* Source code: https://github.com/cran/MetaVolcanoR
* Date/Publication: 2020-04-27
* Number of recursive dependencies: 108

Run `revdep_details(, "MetaVolcanoR")` for more info

</details>

## In both

*   checking examples ... ERROR
    ```
    ...
    Warning in metap::sumlog(value) : Must have at least two valid p values
    Warning in metap::sumlog(value) : Must have at least two valid p values
    Warning in metap::sumlog(value) : Must have at least two valid p values
    Warning in metap::sumlog(value) : Must have at least two valid p values
    Warning in metap::sumlog(value) : Must have at least two valid p values
    Warning in metap::sumlog(value) : Must have at least two valid p values
    Warning in metap::sumlog(value) : Must have at least two valid p values
    Warning in metap::sumlog(value) : Must have at least two valid p values
    Warning in metap::sumlog(value) : Must have at least two valid p values
    Warning in metap::sumlog(value) : Must have at least two valid p values
    Warning in metap::sumlog(value) : Must have at least two valid p values
    Warning in metap::sumlog(value) : Must have at least two valid p values
    Warning in metap::sumlog(value) : Must have at least two valid p values
    Error: .onLoad failed in loadNamespace() for 'Cairo', details:
      call: dyn.load(file, DLLpath = DLLpath, ...)
      error: unable to load shared object '/Library/Frameworks/R.framework/Versions/4.0/Resources/library/Cairo/libs/Cairo.so':
      dlopen(/Library/Frameworks/R.framework/Versions/4.0/Resources/library/Cairo/libs/Cairo.so, 6): Symbol not found: _EXTPTR_PTR
      Referenced from: /Library/Frameworks/R.framework/Versions/4.0/Resources/library/Cairo/libs/Cairo.so
      Expected in: /Library/Frameworks/R.framework/Versions/4.0/Resources/lib/libR.dylib
     in /Library/Frameworks/R.framework/Versions/4.0/Resources/library/Cairo/libs/Cairo.so
    Execution halted
    ```

*   checking tests ...
    ```
     ERROR
    Running the tests in ‘tests/testthat.R’ failed.
    Last 13 lines of output:
        7. plotly:::ggplotly.ggplot(gg)
        8. plotly::gg2list(...)
        9. Cairo::Cairo
       10. base::getExportedValue(pkg, name)
       11. base::asNamespace(ns)
       12. base::getNamespace(ns)
       13. base::loadNamespace(name)
       14. base:::runHook(".onLoad", env, package.lib, package)
      
      ══ testthat results  ═══════════════════════════════════════════════════════════
      [ OK: 0 | SKIPPED: 0 | WARNINGS: 2 | FAILED: 1 ]
      1. Error: MetaVolcano outputs are MetaVolcano valid objects (@test_mv.R#7) 
      
      Error: testthat unit tests failed
      Execution halted
    ```

*   checking R code for possible problems ... NOTE
    ```
    ...
    plot_rem: no visible binding for global variable ‘randomCi.lb’
    plot_rem: no visible binding for global variable ‘randomSummary’
    plot_rem: no visible binding for global variable ‘randomP’
    plot_rem: no visible binding for global variable ‘signcon2’
    plot_rem: no visible binding for global variable ‘Ci.ub’
    plot_rem: no visible binding for global variable ‘Ci.lb’
    rem_mv: no visible binding for global variable ‘error’
    rem_mv: no visible binding for global variable ‘randomCi.ub’
    rem_mv: no visible binding for global variable ‘randomCi.lb’
    rem_mv: no visible binding for global variable ‘index’
    rem_mv: no visible global function definition for ‘head’
    votecount_mv: no visible binding for global variable ‘ddeg’
    votecount_mv: no visible binding for global variable ‘ndeg’
    votecount_mv: no visible binding for global variable ‘idx’
    Undefined global functions or variables:
      Ci.lb Ci.ub DEGs Regulation dataset ddeg degcomb degvcount error
      group head idx index metap ndatasets ndeg randomCi.lb randomCi.ub
      randomP randomSummary signcon signcon2 study value
    Consider adding
      importFrom("utils", "head")
    to your NAMESPACE file.
    ```

*   checking for unstated dependencies in vignettes ... NOTE
    ```
    '::' or ':::' import not declared from: ‘BiocManager’
    ```

# motifStack

<details>

* Version: 1.32.1
* GitHub: NA
* Source code: https://github.com/cran/motifStack
* Date/Publication: 2020-08-03
* Number of recursive dependencies: 108

Run `revdep_details(, "motifStack")` for more info

</details>

## In both

*   checking package dependencies ... ERROR
    ```
    Package required but not available: ‘MotIV’
    
    See section ‘The DESCRIPTION file’ in the ‘Writing R Extensions’
    manual.
    ```

# pairsD3

<details>

* Version: 0.1.0
* GitHub: https://github.com/garthtarr/pairsD3
* Source code: https://github.com/cran/pairsD3
* Date/Publication: 2015-04-28 06:58:01
* Number of recursive dependencies: 30

Run `revdep_details(, "pairsD3")` for more info

</details>

## In both

*   checking R code for possible problems ... NOTE
    ```
    pairsD3: no visible global function definition for ‘gray.colors’
    Undefined global functions or variables:
      gray.colors
    Consider adding
      importFrom("grDevices", "gray.colors")
    to your NAMESPACE file.
    ```

# parcats

<details>

* Version: 0.0.2
* GitHub: NA
* Source code: https://github.com/cran/parcats
* Date/Publication: 2020-09-09 06:50:02 UTC
* Number of recursive dependencies: 110

Run `revdep_details(, "parcats")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespaces in Imports field not imported from:
      ‘magrittr’ ‘tibble’
      All declared Imports should be used.
    ```

# parlitools

<details>

* Version: 0.4.1
* GitHub: https://github.com/EvanOdell/parlitools
* Source code: https://github.com/cran/parlitools
* Date/Publication: 2020-01-12 22:00:02 UTC
* Number of recursive dependencies: 122

Run `revdep_details(, "parlitools")` for more info

</details>

## In both

*   checking data for non-ASCII characters ... NOTE
    ```
      Note: found 16 marked UTF-8 strings
    ```

# PathwaySplice

<details>

* Version: 1.11.0
* GitHub: NA
* Source code: https://github.com/cran/PathwaySplice
* Date/Publication: 2019-10-29
* Number of recursive dependencies: 202

Run `revdep_details(, "PathwaySplice")` for more info

</details>

## In both

*   checking package dependencies ... ERROR
    ```
    Package required but not available: ‘JunctionSeq’
    
    See section ‘The DESCRIPTION file’ in the ‘Writing R Extensions’
    manual.
    ```

# piano

<details>

* Version: 2.4.0
* GitHub: https://github.com/varemo/piano
* Source code: https://github.com/cran/piano
* Date/Publication: 2020-04-27
* Number of recursive dependencies: 143

Run `revdep_details(, "piano")` for more info

</details>

## In both

*   checking package dependencies ... NOTE
    ```
    Package suggested but not available for checking: ‘rsbml’
    ```

*   checking Rd cross-references ... NOTE
    ```
    Packages unavailable to check Rd xrefs: ‘PGSEA’, ‘samr’, ‘GSA’
    Unknown package ‘HTSanalyzeR’ in Rd xrefs
    ```

# pivottabler

<details>

* Version: 1.5.0
* GitHub: https://github.com/cbailiss/pivottabler
* Source code: https://github.com/cran/pivottabler
* Date/Publication: 2020-06-16 16:20:03 UTC
* Number of recursive dependencies: 79

Run `revdep_details(, "pivottabler")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is  5.2Mb
      sub-directories of 1Mb or more:
        R      2.0Mb
        data   2.0Mb
    ```

# pkgdown

<details>

* Version: 1.6.1
* GitHub: https://github.com/r-lib/pkgdown
* Source code: https://github.com/cran/pkgdown
* Date/Publication: 2020-09-12 05:50:26 UTC
* Number of recursive dependencies: 90

Run `revdep_details(, "pkgdown")` for more info

</details>

## In both

*   checking tests ...
    ```
     ERROR
    Running the tests in ‘tests/testthat.R’ failed.
    Last 13 lines of output:
      nrow(out) not equal to 1.
      1/1 mismatches
      [1] 0 - 1 == -1
      
      ── 2. Failure: can autodetect published tutorials (@test-tutorials.R#31)  ──────
      out$name not equal to "test-1".
      Lengths differ: 0 is not 1
      
      ══ testthat results  ═══════════════════════════════════════════════════════════
      [ OK: 364 | SKIPPED: 19 | WARNINGS: 0 | FAILED: 2 ]
      1. Failure: can autodetect published tutorials (@test-tutorials.R#30) 
      2. Failure: can autodetect published tutorials (@test-tutorials.R#31) 
      
      Error: testthat unit tests failed
      Execution halted
    ```

# Plasmidprofiler

<details>

* Version: 0.1.6
* GitHub: NA
* Source code: https://github.com/cran/Plasmidprofiler
* Date/Publication: 2017-01-06 01:10:47
* Number of recursive dependencies: 91

Run `revdep_details(, "Plasmidprofiler")` for more info

</details>

## In both

*   checking examples ... ERROR
    ```
    ...
    + length.filter=10000,
    + main.title="Example Results")
    Selecting by pident
    Warning: `data_frame()` is deprecated as of tibble 1.1.0.
    Please use `tibble()` instead.
    This warning is displayed once every 8 hours.
    Call `lifecycle::last_warnings()` to see where this warning was generated.
    Warning: Vectorized input to `element_text()` is not officially supported.
    Results may be unexpected or may change in future versions of ggplot2.
    Saving 12 x 7 in image
    Warning: Vectorized input to `element_text()` is not officially supported.
    Results may be unexpected or may change in future versions of ggplot2.
    Warning: Ignoring unknown aesthetics: label, text
    Error: .onLoad failed in loadNamespace() for 'Cairo', details:
      call: dyn.load(file, DLLpath = DLLpath, ...)
      error: unable to load shared object '/Library/Frameworks/R.framework/Versions/4.0/Resources/library/Cairo/libs/Cairo.so':
      dlopen(/Library/Frameworks/R.framework/Versions/4.0/Resources/library/Cairo/libs/Cairo.so, 6): Symbol not found: _EXTPTR_PTR
      Referenced from: /Library/Frameworks/R.framework/Versions/4.0/Resources/library/Cairo/libs/Cairo.so
      Expected in: /Library/Frameworks/R.framework/Versions/4.0/Resources/lib/libR.dylib
     in /Library/Frameworks/R.framework/Versions/4.0/Resources/library/Cairo/libs/Cairo.so
    Execution halted
    ```

# plotly

<details>

* Version: 4.9.2.1
* GitHub: https://github.com/ropensci/plotly
* Source code: https://github.com/cran/plotly
* Date/Publication: 2020-04-04 19:50:02 UTC
* Number of recursive dependencies: 150

Run `revdep_details(, "plotly")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is  6.6Mb
      sub-directories of 1Mb or more:
        htmlwidgets   3.7Mb
    ```

# processanimateR

<details>

* Version: 1.0.3
* GitHub: https://github.com/bupaverse/processanimateR
* Source code: https://github.com/cran/processanimateR
* Date/Publication: 2020-03-13 21:30:02 UTC
* Number of recursive dependencies: 105

Run `revdep_details(, "processanimateR")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is 11.5Mb
      sub-directories of 1Mb or more:
        doc           8.8Mb
        htmlwidgets   2.5Mb
    ```

# RagGrid

<details>

* Version: 0.2.0
* GitHub: https://github.com/no-types/RagGrid
* Source code: https://github.com/cran/RagGrid
* Date/Publication: 2018-08-12 09:30:03 UTC
* Number of recursive dependencies: 34

Run `revdep_details(, "RagGrid")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘knitr’
      All declared Imports should be used.
    ```

# rAmCharts

<details>

* Version: 2.1.13
* GitHub: https://github.com/datastorm-open/rAmCharts
* Source code: https://github.com/cran/rAmCharts
* Date/Publication: 2019-12-06 15:50:05 UTC
* Number of recursive dependencies: 53

Run `revdep_details(, "rAmCharts")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is 11.8Mb
      sub-directories of 1Mb or more:
        api           3.1Mb
        htmlwidgets   7.0Mb
    ```

# rAmCharts4

<details>

* Version: 0.1.0
* GitHub: https://github.com/stla/rAmCharts4
* Source code: https://github.com/cran/rAmCharts4
* Date/Publication: 2020-08-24 15:40:03 UTC
* Number of recursive dependencies: 32

Run `revdep_details(, "rAmCharts4")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is 10.8Mb
      sub-directories of 1Mb or more:
        htmlwidgets        9.4Mb
        super-tiny-icons   1.0Mb
    ```

# rbokeh

<details>

* Version: 0.5.1
* GitHub: https://github.com/bokeh/rbokeh
* Source code: https://github.com/cran/rbokeh
* Date/Publication: 2020-05-26 20:10:08 UTC
* Number of recursive dependencies: 92

Run `revdep_details(, "rbokeh")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘ggplot2’
      All declared Imports should be used.
    ```

# rgeoprofile

<details>

* Version: 0.2.0
* GitHub: NA
* Source code: https://github.com/cran/rgeoprofile
* Date/Publication: 2020-05-28 19:20:06 UTC
* Number of recursive dependencies: 100

Run `revdep_details(, "rgeoprofile")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespaces in Imports field not imported from:
      ‘leaflet’ ‘pals’ ‘raster’ ‘sp’
      All declared Imports should be used.
    ```

# rgl

<details>

* Version: 0.100.54
* GitHub: NA
* Source code: https://github.com/cran/rgl
* Date/Publication: 2020-04-14 14:40:02 UTC
* Number of recursive dependencies: 61

Run `revdep_details(, "rgl")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is  7.7Mb
      sub-directories of 1Mb or more:
        doc     3.6Mb
        fonts   1.5Mb
    ```

*   checking Rd cross-references ... NOTE
    ```
    Package unavailable to check Rd xrefs: ‘heplots’
    ```

# rhandsontable

<details>

* Version: 0.3.7
* GitHub: https://github.com/jrowen/rhandsontable
* Source code: https://github.com/cran/rhandsontable
* Date/Publication: 2018-11-20 05:50:03 UTC
* Number of recursive dependencies: 34

Run `revdep_details(, "rhandsontable")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is 11.5Mb
      sub-directories of 1Mb or more:
        doc          10.2Mb
        htmlwidgets   1.2Mb
    ```

# RKorAPClient

<details>

* Version: 0.5.9
* GitHub: NA
* Source code: https://github.com/cran/RKorAPClient
* Date/Publication: 2020-06-07 23:10:02 UTC
* Number of recursive dependencies: 115

Run `revdep_details(, "RKorAPClient")` for more info

</details>

## In both

*   checking examples ... ERROR
    ```
    ...
    > ## End(Don't show)
    > condition <- c("textDomain = /Wirtschaft.*/")
    > ## End(Don't show)
    > g <- expand_grid(condition, year) %>%
    +   cbind(frequencyQuery(kco, "[tt/l=Heuschrecke]",
    +                        paste0(.$condition," & pubDate in ", .$year)))  %>%
    +   ipm() %>%
    +   ggplot(aes(year, ipm, fill = condition, color = condition)) +
    +   ##  theme_light(base_size = 20) +
    +   geom_freq_by_year_ci()
    Searching "[tt/l=Heuschrecke]" in "textDomain = /Wirtschaft.*/ & pubDate in 2005" took 4.794922901 s
    Getting size of virtual corpus "textDomain = /Wirtschaft.*/ & pubDate in 2005": 35980430 tokens
    > p <- ggplotly(g)
    Error: .onLoad failed in loadNamespace() for 'Cairo', details:
      call: dyn.load(file, DLLpath = DLLpath, ...)
      error: unable to load shared object '/Library/Frameworks/R.framework/Versions/4.0/Resources/library/Cairo/libs/Cairo.so':
      dlopen(/Library/Frameworks/R.framework/Versions/4.0/Resources/library/Cairo/libs/Cairo.so, 6): Symbol not found: _EXTPTR_PTR
      Referenced from: /Library/Frameworks/R.framework/Versions/4.0/Resources/library/Cairo/libs/Cairo.so
      Expected in: /Library/Frameworks/R.framework/Versions/4.0/Resources/lib/libR.dylib
     in /Library/Frameworks/R.framework/Versions/4.0/Resources/library/Cairo/libs/Cairo.so
    Execution halted
    ```

*   checking tests ...
    ```
     ERROR
    Running the tests in ‘tests/testthat.R’ failed.
    Last 13 lines of output:
        3. plotly:::ggplotly.ggplot(p = p, tooltip = tooltip, ...)
        4. plotly::gg2list(...)
        5. Cairo::Cairo
        6. base::getExportedValue(pkg, name)
        7. base::asNamespace(ns)
        8. base::getNamespace(ns)
        9. base::loadNamespace(name)
       10. base:::runHook(".onLoad", env, package.lib, package)
      
      ══ testthat results  ═══════════════════════════════════════════════════════════
      [ OK: 30 | SKIPPED: 0 | WARNINGS: 0 | FAILED: 1 ]
      1. Error: Conditions over time ggplotly example works (@test-demos.R#140) 
      
      Error: testthat unit tests failed
      Execution halted
    ```

# rosr

<details>

* Version: 0.0.10
* GitHub: https://github.com/pzhaonet/rosr
* Source code: https://github.com/cran/rosr
* Date/Publication: 2020-05-11 11:10:02 UTC
* Number of recursive dependencies: 91

Run `revdep_details(, "rosr")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespaces in Imports field not imported from:
      ‘bookdown’ ‘rstudioapi’ ‘tinytex’
      All declared Imports should be used.
    ```

# safetyGraphics

<details>

* Version: 1.1.0
* GitHub: https://github.com/SafetyGraphics/safetyGraphics
* Source code: https://github.com/cran/safetyGraphics
* Date/Publication: 2020-01-15 22:50:05 UTC
* Number of recursive dependencies: 103

Run `revdep_details(, "safetyGraphics")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘shinybusy’
      All declared Imports should be used.
    ```

# shiny.semantic

<details>

* Version: 0.4.0
* GitHub: https://github.com/Appsilon/shiny.semantic
* Source code: https://github.com/cran/shiny.semantic
* Date/Publication: 2020-09-07 12:30:03 UTC
* Number of recursive dependencies: 72

Run `revdep_details(, "shiny.semantic")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is 10.7Mb
      sub-directories of 1Mb or more:
        help   2.5Mb
        www    8.0Mb
    ```

# shinyaframe

<details>

* Version: 1.0.1
* GitHub: NA
* Source code: https://github.com/cran/shinyaframe
* Date/Publication: 2017-11-26 15:29:43 UTC
* Number of recursive dependencies: 53

Run `revdep_details(, "shinyaframe")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘shiny’
      All declared Imports should be used.
    ```

# sigmajs

<details>

* Version: 0.1.5
* GitHub: https://github.com/JohnCoene/sigmajs
* Source code: https://github.com/cran/sigmajs
* Date/Publication: 2020-06-18 18:10:02 UTC
* Number of recursive dependencies: 62

Run `revdep_details(, "sigmajs")` for more info

</details>

## In both

*   checking data for non-ASCII characters ... NOTE
    ```
      Note: found 28 marked UTF-8 strings
    ```

# slickR

<details>

* Version: 0.4.9
* GitHub: https://github.com/metrumresearchgroup/slickR
* Source code: https://github.com/cran/slickR
* Date/Publication: 2020-02-14 13:30:02 UTC
* Number of recursive dependencies: 84

Run `revdep_details(, "slickR")` for more info

</details>

## In both

*   checking tests ...
    ```
     ERROR
    Running the tests in ‘tests/testthat.R’ failed.
    Last 13 lines of output:
      > library(slickR)
      > 
      > test_check("slickR")
      ── 1. Failure: slick div method: widget (@test-div_method.R#44)  ───────────────
      {
          ...
      } not equal to readRDS("../assets/slick_div_widget.Rds").
      Component "attribs": Component "srcdoc": 1 string mismatch
      
      ══ testthat results  ═══════════════════════════════════════════════════════════
      [ OK: 27 | SKIPPED: 0 | WARNINGS: 0 | FAILED: 1 ]
      1. Failure: slick div method: widget (@test-div_method.R#44) 
      
      Error: testthat unit tests failed
      Execution halted
    ```

# slideview

<details>

* Version: 0.1.0
* GitHub: NA
* Source code: https://github.com/cran/slideview
* Date/Publication: 2019-03-06 15:00:03 UTC
* Number of recursive dependencies: 13

Run `revdep_details(, "slideview")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘viridisLite’
      All declared Imports should be used.
    ```

# SpatialEpiApp

<details>

* Version: 0.3
* GitHub: https://github.com/Paula-Moraga/SpatialEpiApp
* Source code: https://github.com/cran/SpatialEpiApp
* Date/Publication: 2017-08-28 22:10:33 UTC
* Number of recursive dependencies: 117

Run `revdep_details(, "SpatialEpiApp")` for more info

</details>

## In both

*   checking package dependencies ... NOTE
    ```
    Package suggested but not available for checking: ‘INLA’
    ```

*   checking dependencies in R code ... NOTE
    ```
    Namespaces in Imports field not imported from:
      ‘RColorBrewer’ ‘SpatialEpi’ ‘dplyr’ ‘dygraphs’ ‘ggplot2’
      ‘htmlwidgets’ ‘knitr’ ‘leaflet’ ‘mapproj’ ‘maptools’ ‘rgdal’ ‘rgeos’
      ‘rmarkdown’ ‘shinyjs’ ‘spdep’ ‘xts’
      All declared Imports should be used.
    ```

# spinifex

<details>

* Version: 0.2.5
* GitHub: https://github.com/nspyrison/spinifex
* Source code: https://github.com/cran/spinifex
* Date/Publication: 2020-07-14 13:10:06 UTC
* Number of recursive dependencies: 95

Run `revdep_details(, "spinifex")` for more info

</details>

## In both

*   checking tests ...
    ```
     ERROR
    Running the tests in ‘tests/testthat.R’ failed.
    Last 13 lines of output:
        6. base::getExportedValue(pkg, name)
        7. base::asNamespace(ns)
        8. base::getNamespace(ns)
        9. base::loadNamespace(name)
       10. base:::runHook(".onLoad", env, package.lib, package)
      
      ══ testthat results  ═══════════════════════════════════════════════════════════
      [ OK: 38 | SKIPPED: 0 | WARNINGS: 0 | FAILED: 4 ]
      1. Error: (unknown) (@test-play_manual_tour.R#6) 
      2. Error: (unknown) (@test-play_tour_path.R#6) 
      3. Error: (unknown) (@test-render_gganimate.R#8) 
      4. Error: (unknown) (@test-render_plotly.R#8) 
      
      Error: testthat unit tests failed
      Execution halted
    ```

# sRACIPE

<details>

* Version: 1.4.0
* GitHub: https://github.com/vivekkohar/sRACIPE
* Source code: https://github.com/cran/sRACIPE
* Date/Publication: 2020-04-27
* Number of recursive dependencies: 101

Run `revdep_details(, "sRACIPE")` for more info

</details>

## In both

*   checking R code for possible problems ... NOTE
    ```
    sracipeSimulate: no visible global function definition for
      ‘registerDoFuture’
    sracipeSimulate: no visible global function definition for ‘plan’
    sracipeSimulate: no visible global function definition for ‘%dopar%’
    sracipeSimulate: no visible global function definition for ‘foreach’
    sracipeSimulate: no visible binding for global variable
      ‘configurationTmp’
    sracipeSimulate: no visible binding for global variable ‘outFileGETmp’
    sracipeSimulate: no visible binding for global variable
      ‘outFileParamsTmp’
    sracipeSimulate: no visible binding for global variable ‘outFileICTmp’
    Undefined global functions or variables:
      %dopar% configurationTmp foreach outFileGETmp outFileICTmp
      outFileParamsTmp plan registerDoFuture
    ```

# stringr

<details>

* Version: 1.4.0
* GitHub: https://github.com/tidyverse/stringr
* Source code: https://github.com/cran/stringr
* Date/Publication: 2019-02-10 03:40:03 UTC
* Number of recursive dependencies: 45

Run `revdep_details(, "stringr")` for more info

</details>

## In both

*   checking data for non-ASCII characters ... NOTE
    ```
      Note: found 3 marked UTF-8 strings
    ```

# svgPanZoom

<details>

* Version: 0.3.4
* GitHub: https://github.com/timelyportfolio/svgPanZoom
* Source code: https://github.com/cran/svgPanZoom
* Date/Publication: 2020-02-15 21:20:02 UTC
* Number of recursive dependencies: 13

Run `revdep_details(, "svgPanZoom")` for more info

</details>

## In both

*   checking package dependencies ... NOTE
    ```
    Package which this enhances but not available for checking: ‘gridSVG’
    ```

# timescape

<details>

* Version: 1.8.0
* GitHub: NA
* Source code: https://github.com/cran/timescape
* Date/Publication: 2019-05-02
* Number of recursive dependencies: 36

Run `revdep_details(, "timescape")` for more info

</details>

## In both

*   checking Rd \usage sections ... WARNING
    ```
    Duplicated \argument entries in documentation object 'timescapeOutput':
      ‘width’ ‘height’ ‘mutations’ ‘height’ ‘width’ ‘clonal_prev’
      ‘tree_edges’ ‘alpha’ ‘clonal_prev’ ‘tree_edges’ ‘genotype_position’
      ‘clone_colours’ ‘perturbations’ ‘mutations’ ‘tree_edges’
      ‘clonal_prev’ ‘clonal_prev’ ‘tree_edges’ ‘clone_colours’ ‘mutations’
    
    Functions with \usage entries need to have the appropriate \alias
    entries, and all their arguments documented.
    The \usage entries must correspond to syntactically valid R code.
    See chapter ‘Writing R documentation files’ in the ‘Writing R
    Extensions’ manual.
    ```

*   checking for hidden files and directories ... NOTE
    ```
    Found the following hidden files and directories:
      .vscode
    These were most likely included in error. See section ‘Package
    structure’ in the ‘Writing R Extensions’ manual.
    ```

*   checking dependencies in R code ... NOTE
    ```
    Namespaces in Imports field not imported from:
      ‘dplyr’ ‘gtools’
      All declared Imports should be used.
    ```

*   checking R code for possible problems ... NOTE
    ```
    getMutationsData: no visible binding for global variable
      ‘show_warnings’
    Undefined global functions or variables:
      show_warnings
    ```

# timevis

<details>

* Version: 1.0.0
* GitHub: https://github.com/daattali/timevis
* Source code: https://github.com/cran/timevis
* Date/Publication: 2020-09-16 08:10:02 UTC
* Number of recursive dependencies: 58

Run `revdep_details(, "timevis")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘lubridate’
      All declared Imports should be used.
    ```

# trackViewer

<details>

* Version: 1.24.2
* GitHub: NA
* Source code: https://github.com/cran/trackViewer
* Date/Publication: 2020-08-27
* Number of recursive dependencies: 146

Run `revdep_details(, "trackViewer")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is  9.7Mb
      sub-directories of 1Mb or more:
        doc   7.8Mb
    ```

*   checking R code for possible problems ... NOTE
    ```
    plotGInteractions: no visible global function definition for
      'plot.default'
    Undefined global functions or variables:
      plot.default
    Consider adding
      importFrom("graphics", "plot.default")
    to your NAMESPACE file.
    ```

# treespace

<details>

* Version: 1.1.3.2
* GitHub: https://github.com/thibautjombart/treespace
* Source code: https://github.com/cran/treespace
* Date/Publication: 2019-12-08 22:40:02 UTC
* Number of recursive dependencies: 174

Run `revdep_details(, "treespace")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is  5.9Mb
      sub-directories of 1Mb or more:
        doc   4.3Mb
    ```

# trelliscopejs

<details>

* Version: 0.2.5
* GitHub: https://github.com/hafen/trelliscopejs
* Source code: https://github.com/cran/trelliscopejs
* Date/Publication: 2020-05-28 11:20:03 UTC
* Number of recursive dependencies: 91

Run `revdep_details(, "trelliscopejs")` for more info

</details>

## In both

*   checking tests ...
    ```
     ERROR
    Running the tests in ‘tests/testthat.R’ failed.
    Last 13 lines of output:
       15. plotly:::ggplotly.ggplot(...)
       16. plotly::gg2list(...)
       17. Cairo::Cairo
       18. base::getExportedValue(pkg, name)
       19. base::asNamespace(ns)
       20. base::getNamespace(ns)
       21. base::loadNamespace(name)
       22. base:::runHook(".onLoad", env, package.lib, package)
      
      ══ testthat results  ═══════════════════════════════════════════════════════════
      [ OK: 0 | SKIPPED: 0 | WARNINGS: 4 | FAILED: 1 ]
      1. Error: examples run without barfing (@test-trelliscope.R#161) 
      
      Error: testthat unit tests failed
      Execution halted
    ```

# uavRmp

<details>

* Version: 0.5.7
* GitHub: https://github.com/gisma/uavRmp
* Source code: https://github.com/cran/uavRmp
* Date/Publication: 2020-07-03 16:40:03 UTC
* Number of recursive dependencies: 134

Run `revdep_details(, "uavRmp")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘rlang’
      All declared Imports should be used.
    ```

# ursa

<details>

* Version: 3.8.20
* GitHub: https://github.com/nplatonov/ursa
* Source code: https://github.com/cran/ursa
* Date/Publication: 2020-06-12 09:10:06 UTC
* Number of recursive dependencies: 109

Run `revdep_details(, "ursa")` for more info

</details>

## In both

*   checking Rd cross-references ... NOTE
    ```
    Package unavailable to check Rd xrefs: ‘rje’
    ```

# vdiffr

<details>

* Version: 0.3.2.2
* GitHub: https://github.com/r-lib/vdiffr
* Source code: https://github.com/cran/vdiffr
* Date/Publication: 2020-07-07 06:11:10 UTC
* Number of recursive dependencies: 104

Run `revdep_details(, "vdiffr")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespace in Imports field not imported from: ‘freetypeharfbuzz’
      All declared Imports should be used.
    ```

# ViSEAGO

<details>

* Version: 1.2.0
* GitHub: NA
* Source code: https://github.com/cran/ViSEAGO
* Date/Publication: 2020-04-27
* Number of recursive dependencies: 149

Run `revdep_details(, "ViSEAGO")` for more info

</details>

## In both

*   checking dependencies in R code ... WARNING
    ```
    'library' or 'require' call not declared from: ‘topGO’
    'library' or 'require' call to ‘topGO’ in package code.
      Please use :: or requireNamespace() instead.
      See section 'Suggested packages' in the 'Writing R Extensions' manual.
    ```

*   checking installed package size ... NOTE
    ```
      installed size is  7.1Mb
      sub-directories of 1Mb or more:
        doc       3.9Mb
        extdata   2.0Mb
    ```

*   checking R code for possible problems ... NOTE
    ```
    ...
      variable ‘ENTREZID’
    annotate,character-genomic_ressource: no visible binding for global
      variable ‘GO’
    annotate,character-genomic_ressource: no visible binding for global
      variable ‘EVIDENCE’
    annotate,character-genomic_ressource: no visible binding for global
      variable ‘ONTOLOGY’
    compute_SS_distances,ANY-character: no visible binding for global
      variable ‘N’
    compute_SS_distances,ANY-character: no visible binding for global
      variable ‘IC’
    merge_enrich_terms,list : <anonymous> : esummary : <anonymous>: no
      visible binding for global variable ‘start’
    merge_enrich_terms,list : <anonymous> : esummary : <anonymous>: no
      visible binding for global variable ‘end’
    Undefined global functions or variables:
      . ENTREZID EVIDENCE GO GO.ID IC N ONTOLOGY end start text
    Consider adding
      importFrom("graphics", "text")
      importFrom("stats", "end", "start")
    to your NAMESPACE file.
    ```

# visNetwork

<details>

* Version: 2.0.9
* GitHub: https://github.com/datastorm-open/visNetwork
* Source code: https://github.com/cran/visNetwork
* Date/Publication: 2019-12-06 08:50:02 UTC
* Number of recursive dependencies: 95

Run `revdep_details(, "visNetwork")` for more info

</details>

## In both

*   checking installed package size ... NOTE
    ```
      installed size is 11.1Mb
      sub-directories of 1Mb or more:
        doc           4.3Mb
        docjs         1.4Mb
        htmlwidgets   3.9Mb
    ```

# vizdraws

<details>

* Version: 1.0.0
* GitHub: https://github.com/ignacio82/vizdraws
* Source code: https://github.com/cran/vizdraws
* Date/Publication: 2020-04-28 08:50:02 UTC
* Number of recursive dependencies: 37

Run `revdep_details(, "vizdraws")` for more info

</details>

## In both

*   checking dependencies in R code ... NOTE
    ```
    Namespaces in Imports field not imported from:
      ‘glue’ ‘tidyr’
      All declared Imports should be used.
    ```

# wordcloud2

<details>

* Version: 0.2.1
* GitHub: https://github.com/lchiffon/wordcloud2
* Source code: https://github.com/cran/wordcloud2
* Date/Publication: 2018-01-03 15:20:37 UTC
* Number of recursive dependencies: 24

Run `revdep_details(, "wordcloud2")` for more info

</details>

## In both

*   checking data for non-ASCII characters ... NOTE
    ```
      Note: found 933 marked UTF-8 strings
    ```

