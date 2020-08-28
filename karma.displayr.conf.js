// Karma configuration
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'test/displayr_init.js',
      'inst/www/htmlwidgets.js',
      'test/src/mock_widget.js',
      'test/spec/displayrrender_spec.js'
    ],

    // start these browsers
    browsers: ['ChromeHeadless'],
  })
}
