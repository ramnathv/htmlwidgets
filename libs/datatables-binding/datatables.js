HTMLWidgets.widget({
  name: "datatables",
  type: "output",
  renderValue: function(el, data) {
    var $el = $(el), cells = data.data;
    if (data.isDF === true) cells = HTMLWidgets.transposeArray2D(cells);
    $el.append(data.container);
    var options = {};
    if (cells !== null) options = {
      data: cells
    };
    var table = $el.find('table').DataTable($.extend(options, data.options || {}));
    if (typeof data.callback === 'string') {
      var callback = eval('(' + data.callback + ')');
      if (typeof callback === 'function') callback(table);
    }
  }
})
