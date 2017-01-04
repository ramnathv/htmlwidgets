Highcharts.wrap(Highcharts.Fx.prototype, 'run', function (proceed) {
  var fx = this,
  args = arguments;
  setTimeout(function () {
    proceed.apply(fx, [].slice.call(args, 1));
  }, fx.options.delay || 0);
});
