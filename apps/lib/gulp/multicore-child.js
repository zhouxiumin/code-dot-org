var Writable = require('stream').Writable;
var Readable = require('stream').Readable;
var File = require('vinyl');
var Promise2 = require('bluebird');
var concat = require('concat-stream');
var es = require('event-stream');
//var buffer = require('vinyl-buffer');

var readableCallback;
var readables = [];

var endReceived;
var plugin;
var result;
var finish, finish2;
var fileBuffer = [];

var flushData = [];

var abortCallback = null;

var transformJshint = function(data) {
  log('processing child');
  if(data.start) {
    plugin = require(data.start).apply(this, data.args);
    initializePlugin();
    return new Promise2(function(resolve, reject) {
      abortCallback = resolve;
    });
  }
  if(!data.file) {
    endReceived = true;
    if(readableCallback) { // If callback is available, then the readable buffer is already empty
      return new Promise2(function(resolve, reject) {
        finish = resolve;
        readableCallback(null);
      });
    }
    return new Promise2(function(resolve, reject) {
      // Need to finish processing readable buffer before finishing
      finish2 = resolve;
    });
  }

  var file = new File({
    cwd: data.file.cwd,
    base: data.file.base,
    path: data.file.path,
    contents: new Buffer(data.file.contents)
  });
  var writeFile = {file: file};
  var promise = new Promise2(function(resolve, reject) {
    writeFile.resolve = resolve;
  });
  fileBuffer.push(writeFile);
  readables.push(file);

  if(readableCallback) {
    var _callback = readableCallback;
    readableCallback = null;
    var myData = readables[0];
    readables.splice(0,1);
    _callback(myData);
  }

  function initializePlugin() {
    var myReadable = Readable({objectMode: true});
    myReadable._read = function() {
      var _readable = this;
      var callback = function(data) {
        _readable.push(data);
      };
      if(endReceived && readables.length === 0) {
        _readable.push(null);
        return new Promise2(function(resolve, reject) {
          finish = resolve;
        });
      }
      if (readables.length === 0) {
        // Not enough data in buffer, need to defer read until later
        readableCallback = callback;
      } else {
        var myData = readables[0];
        readables.splice(0, 1);
        callback(myData);
      }
    };
    myReadable.pipe(plugin);
    var ws = Writable({objectMode: true});
    ws._write = function (writeData, enc, next) {
      var writeFile = fileBuffer[0];

      fileBuffer.splice(0,1);
      var writeDataOut = writeData ? {
        file: {
          cwd: writeData.cwd,
          base: writeData.base,
          path: writeData.path,
          contents: writeData.contents
        }
      } : null;
      if(writeData.jshint) {
        log('jshint');
        writeDataOut.file.jshint = writeData.jshint;
      }
      log('writing: data = ' + JSON.stringify(writeData).substring(0,100));
      if(writeFile) {
        writeFile.resolve(writeDataOut);
      } else {
        flushData.push(writeDataOut);
      }
      next();
    };
    plugin.pipe(ws);
    ws.on('finish', function() {
      log('finishing writable stream ' + new Date().toISOString())
      if(finish || finish2) {
        finish(flushData);
        if(finish2) {
          finish2(flushData);
        }
      } else {
        log('no finish callback, abort');
        abortCallback(flushData);
      }
    });
    log('initialized plugin ' + new Date().toISOString())
  }

  return promise
};

module.exports = transformJshint;

function log(s) {
  //console.log(new Date().toISOString() + ': ' + s);
}
