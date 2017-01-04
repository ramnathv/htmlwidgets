HTMLWidgets.widget({

  name: 'highchart',

  type: 'output',

  initialize: function(el, width, height) {

    return {
      // TODO: add instance fields as required
    }

  },

  renderValue: function(el, x, instance) {
    
    if(x.debug) {
      window.xclone = JSON.parse(JSON.stringify(x));
      console.log(el);
      console.log("hc_opts", x.hc_opts);
      console.log("theme", x.theme);
      console.log("conf_opts", x.conf_opts);
    }

    if(x.fonts !== undefined) {
      
      x.fonts = ((typeof(x.fonts) == "string") ? [x.fonts] : x.fonts);
    
      x.fonts.forEach(function(s){
        var urlfont = 'https://fonts.googleapis.com/css?family=' + s;
        /* http://stackoverflow.com/questions/4724606 */
        if (!$("link[href='" + urlfont + "']").length) {
          $('<link href="' + urlfont + '" rel="stylesheet" type="">').appendTo("head");
        }
        
      });
      
    }
    
    ResetHighchartsOptions();
    
    if(x.theme !== null) {
      
      Highcharts.setOptions(x.theme);
      
      if(x.theme.chart.divBackgroundImage !== null){
        
        Highcharts.wrap(Highcharts.Chart.prototype, 'getContainer', function (proceed) {
          proceed.call(this);
          $("#" + el.id).css('background-image', 'url(' + x.theme.chart.divBackgroundImage + ')');
          
        });
        
      }
      
    }
    
    Highcharts.setOptions(x.conf_opts);
    
    if(x.type == "chart") {
      if(x.debug) console.log("charting CHART");
      $("#" + el.id).highcharts(x.hc_opts);
    } else if (x.type == "stock") {
      if(x.debug) console.log("charting STOCK");
      $("#" + el.id).highcharts('StockChart', x.hc_opts);  
    } else if (x.type == "map"){
      if(x.debug) console.log("charting MAP");
      
      /*
      x.hc_opts.series = _.each(x.hc_opts.series, function(e){
        if(!(e.type === undefined)) {
          e.data = Highcharts.geojson(e.data, e.type);
        }
        return e;
      });
      */
      
      x.hc_opts.series = x.hc_opts.series.map(function(e){
        if(!(e.type === undefined)) {
          e.data = Highcharts.geojson(e.data, e.type);
        }
        return e;
      });
      
      $("#" + el.id).highcharts('Map', x.hc_opts);  
      
      
      if(x.hc_opts.mapNavigation != undefined && x.hc_opts.mapNavigation.enabled === true){
        /* if have navigation option and enabled true */
        /* http://stackoverflow.com/questions/7600454 */
        $("#" + el.id).bind( 'mousewheel DOMMouseScroll', function ( e ) {
          var e0 = e.originalEvent,
          delta = e0.wheelDelta || -e0.detail;
          this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
          e.preventDefault();
          
        });
        
      }
      
    }
    
  },

  resize: function(el, width, height, instance) {
    
    /* http://stackoverflow.com/questions/18445784/ */
    var chart = $("#" +el.id).highcharts();
    var height = chart.renderTo.clientHeight; 
    var width = chart.renderTo.clientWidth; 
    chart.setSize(width, height); 

  }

});
