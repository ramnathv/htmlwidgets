<!--html_preserve-->

</div> <!--page-body-->
</div> <!--container-fluid main-container-->

<style type="text/css">
  .benefits {
    z-index: 1;
  }
  .benefits ul {
    margin-bottom: 24px;
  }
  .benefits li {
    margin-bottom: 12px;
  }
  .benefits li strong {
    font-weight: 600;
  }

  /* Phones only */
  img.main-screenshot {
    position: relative;
    width: 100%;
  }
  @media (min-width: @screen-sm-min) {
    /* Everything else */
    img.main-screenshot {
      top: -16px;
      left: 16px;
      margin-bottom: -36px;
    }
  }

  .showcase-teaser img {
    width: 100%;
    border: 1px solid #CCC;
    margin-bottom: 16px;
  }
  h3, .benefits h3 {
    font-size: 16pt;
    font-weight: 600;
  }
  .below-lead h3 {
    margin-top: 24pt;
  }
  p {
    font-size: 14pt;
    font-weight: 200;
  }
</style>

<div class="jumbotron">
  <div class="container-fluid main-container">
    <div class="row">

      <div class="col-sm-4 benefits">
        <h3>Bring the best of JavaScript data visualization to R</h3>
        <ul>
          <li>Use JavaScript visualization libraries <strong>at the R console</strong>, just like plots.</li>
          <li>Embed widgets in <strong>R Markdown</strong> documents and <strong>Shiny</strong> web applications.</li>
          <li><strong>Develop new widgets</strong> using a framework that seamlessly bridges R and JavaScript.</li>
        </ul>
      </div>

      <div class="col-sm-8">

        <img class="main-screenshot" src="images/rconsole.2x.png"/>

        <div class="hide">
          <div id="widget-carousel" class="carousel slide" data-ride="carousel">
            <!-- Indicators -->
            <ol class="carousel-indicators">
              <li data-target="#widget-carousel" data-slide-to="0" class="active"></li>
              <li data-target="#widget-carousel" data-slide-to="1"></li>
              <li data-target="#widget-carousel" data-slide-to="2"></li>
            </ol>

            <!-- Wrapper for slides -->
            <div class="carousel-inner" role="listbox">
              <div class="item active">
                <img src="images/carousel-leaflet.png">
                <div class="carousel-caption">
                </div>
              </div>
              <div class="item">
                <img src="images/carousel-dygraphs.png">
                <div class="carousel-caption">
                </div>
              </div>
              <div class="item">
                <img src="images/carousel-networkD3.png">
                <div class="carousel-caption">
                </div>
              </div>
            </div>

            <!-- Controls -->
            <a class="left carousel-control" href="#widget-carousel" role="button" data-slide="prev">
              <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
            </a>
            <a class="right carousel-control" href="#widget-carousel" role="button" data-slide="next">
              <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
            </a>
          </div>
        </div>

      </div>


    </div> <!-- row -->
  </div> <!-- container-fluid main-container -->
</div> <!-- jumbotron -->

<div class="container-fluid main-container below-lead">
  <h3>Widgets in Action</h3>
  <div class="row">
    <div class="col-sm-8">
      <div class="row showcase-teaser">
        <div class="col-xs-6 col-sm-3">
          <a href="showcase_leaflet.html"><img src="images/carousel-leaflet.png"/></a>
        </div>
        <div class="col-xs-6 col-sm-3">
          <a href="showcase_dygraphs.html"><img src="images/carousel-dygraphs.png"/></a>
        </div>
        <div class="col-xs-6 col-sm-3">
          <a href="showcase_networkD3.html"><img src="images/carousel-networkD3.png"/></a>
        </div>
        <div class="col-xs-6 col-sm-3">
          <a href="showcase_threejs.html"><img src="images/carousel-leaflet.png"/></a>
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-sm-8">
      <p>See how just a line or two of R code can be used to create interactive visualization with   Leafet (mapping), Dygraphs (time-series), networkD3 (graph visualization), and much more.</p>
    </div>
    <div class="col-sm-4">
      <p><a class="btn btn-info" href="showcase_leaflet.html" role="button">See the Showcase &raquo;</a></p>
    </div>
  </div>
  <hr/>
  <h3>Creating Widgets</h3>
  <div class="row">
    <div class="col-sm-8">
      <p>Learn how to create an R binding for your favorite JavaScript library and enable use of it in the R console, in R Markdown documents, and in Shiny web applications.</p>
    </div>
    <div class="col-sm-4">
      <p><a class="btn btn-success" href="#" role="button">Develop a Widget &raquo;</a></p>
    </div>
  </div>
</div>

<!--/html_preserve-->
