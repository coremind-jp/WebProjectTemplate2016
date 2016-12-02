// Karma configuration
// Generated on Fri Dec 02 2016 18:08:45 GMT+0900 (東京 (標準時))

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [
      'workspace/src/script_test/*.{ts,tsx}'
    ],

    plugins: [
        'karma-chrome-launcher',
        'karma-mocha',
        'karma-webpack'
    ],

    // list of files to exclude
    exclude: [
    ],

    webpack: require(__dirname + '/webpack-test.config.js'),

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'workspace/src/script_test/**/*.{ts,tsx}': ['webpack'],
    },
    
    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
