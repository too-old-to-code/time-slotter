'use strict';

var path = require('path')
var fs = require('fs')
var browserify = require('browserify')
var distRoot = path.join(__dirname, 'dist')
var bundlePath = path.join(distRoot, 'time-slot.js')

browserify({ debug: true }, {standalone: 'timeSlot'})
  .require(require.resolve('./src/time-slot.js'), { entry: true })
  .bundle()
  .on('error', function (err) { console.error(err); })
  .pipe(fs.createWriteStream(bundlePath));

