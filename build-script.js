'use strict';

var path = require('path')
var fs = require('fs')
var browserify = require('browserify')
var distRoot = path.join(__dirname, 'dist')
var bundlePath = path.join(distRoot, 'time-slotter.js')

browserify({ debug: true }, {standalone: 'timeSlotter'})
  .require(require.resolve('./src/time-slotter.js'), { entry: true })
  .bundle()
  .on('error', function (err) { console.error(err); })
  .pipe(fs.createWriteStream(bundlePath));

