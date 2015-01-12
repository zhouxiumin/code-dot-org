var Writable = require('stream').Writable;
var Readable = require('stream').Readable;
var gutil = require('gulp-util');
var File = gutil.File;
var jshint = require('gulp-jshint');
var Promise2 = require('bluebird');
var concat = require('concat-stream');
var es = require('event-stream');
var pluginInstance;
var readable, readableCallback;
var readables = [];

var callback;

var endReceived;
var readableEnd;

var transformJshint = function(data) {
  if(!data.file) {
    console.log('end received');
    endReceived = true;
    if(readable) {
      console.log('resolving immediately');
      return null;
    }
    return new Promise2(function(resolve, reject) {
      readableEnd = function() {
        console.log('resolving');
        resolve(null);
      };
    });
  }
  var file = new File({
    cwd: data.file.cwd,
    base: data.file.base,
    path: data.file.path,
    contents: new Buffer(data.file.contents)
  });
  readables.push(file);
  if(readable) {
    readable.emit('data', readables[0]);
    readables.splice(0,1);
    readableCallback();
    readable = null;
    readableCallback = null;
  }
  if(!pluginInstance) {
    pluginInstance = jshint(data.options);
    pluginInstance
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jshint.reporter('fail'));

    es.readable(function (count, callback) {
      if(endReceived && readables.length === 0) {
        readableEnd();
        return this.emit('end');
      }
      if (readables.length === 0) {
        readable = this;
        readableCallback = callback;
        //readable.push(null);
      } else {
        var obj = readables[0];
        this.emit('data', readables[0]);
        readables.splice(0, 1);
        callback();
      }
    }).pipe(pluginInstance);
    pluginInstance.pipe(concat(function(data) {
      console.log('finished');
    }));
  }
  return new Promise2(function(resolve, reject) {
    resolve(null);
  });
};

module.exports = transformJshint;
