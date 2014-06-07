// Karma configuration
module.exports = function(config) {

config.set( {
// base path, that will be used to resolve files and exclude
basePath: "",

// frameworks to use
frameworks: ['jasmine'],

// list of files / patterns to load in the browser
files: [
//  JASMINE,
//  JASMINE_ADAPTER,
  //ANGULAR_SCENARIO,
  //ANGULAR_SCENARIO_ADAPTER,
  'bower_components/angular/angular.js',
  'bower_components/angular-cookies/angular-cookies.js',
  'bower_components/angular-resource/angular-resource.js',
  'bower_components/angular-mocks/angular-mocks.js',
  'bower_components/angular-logging/dist/angular-logging.js',
  'bower_components/lodash/dist/lodash.min.js',
  'bower_components/angular-http-auth/src/http-auth-interceptor.js',
  'src/authManager/*.js',
  'src/*.js',
  'src/example/scripts/*.js',
  'test/unit/*.js'
],

// list of files to exclude
exclude: [],

// test results reporter to use
// possible values: dots || progress || growl
reporters: ['progress'],

// web server port
port: 8080,

// cli runner port
runnerPort: 9100,

// enable / disable colors in the output (reporters and logs)
colors: true,

// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel: config.LOG_DEBUG,

// enable / disable watching file and executing tests whenever any file changes
autoWatch: false,

// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers:  ['Chrome'],

plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-script-launcher',
            'karma-jasmine'
            ],

// If browser does not capture in given timeout [ms], kill it
captureTimeout: 5000,

// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun: false,


proxies : {
    "/": "http://localhost:3000/",
    "/api": "http://localhost:3000/api",
    "/api/": "http://localhost:3000/api/"
},

urlRoot: "/__karma/"

} ) };
