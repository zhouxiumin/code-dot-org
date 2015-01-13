/**
 * Multicore transform stream processing
 */
var parallel = require('parallel-transform');
var master = require('slave/master');
var temp = require('temp');
var gutil = require('gulp-util');
var File = gutil.File;
var through2 = require('through2');

function plugin(moduleName, options) {
  log('begin')
  options = options || {};
  var concurrency = options.concurrency;
  return function() {
    var slice = [].slice
    var args = slice.call(arguments);
    return transform(moduleName, {
      concurrency: concurrency,
      input: function(data) {
        return {
          file: {
            cwd: data.cwd,
            base: data.base,
            path: data.path,
            contents: data.contents
          }
        };
      },
      output: function(origData, inputData, data) {
        if(data && data.file) {
          var file = new File({
            cwd: data.file.cwd,
            base: data.file.base,
            path: data.file.path,
            contents: data.file.contents ? new Buffer(data.file.contents) : null
          });
          if(data.file.jshint) {
            log('jshint');
            file.jshint = data.file.jshint;
          }
          return file;
        } else {
          return data;
        }
      },
      args: args
    });
  };
}

function transform(moduleName, options) {
  log('starting transform: ' + moduleName);
  options = options || {};

  var format = null;
  var concurrency = options.concurrency || require('os').cpus().length;

  function process(data, callback) {
    if(data && data.passThrough) {
      var file = new File({
        cwd: data.file.cwd,
        base: data.file.base,
        path: data.file.path,
        contents: data.file.contents ? new Buffer(data.file.contents) : null
      });
      if(data.file.jshint) {
        log('jshint');
        file.jshint = data.file.jshint;
      }
      return callback(null, file);
    }
    var inputData = data;
    if(typeof options.input == 'function') {
      inputData = options.input(data);
    }
    format(inputData).then(function (outputData) {
      if(typeof options.output == 'function') {
        outputData = options.output(data, inputData, outputData);
      }
      return callback(null, outputData);
    });
  }

  if (!format) {
    var tempFile = temp.openSync();
    var fs = require('fs');
    fs.writeSync(tempFile.fd, "require('" + __dirname + "/../../node_modules/slave/slave')(require('" + require.resolve('./multicore-child') + "'));");
    format = master(require.resolve(tempFile.path));
    for (var i = 0; i < concurrency; i++) {
      format.fork();
    }
    log('Forking: ' + require.resolve(moduleName));
    format.all({start: require.resolve(moduleName), args: options.args}).then(function(finishedData) {
      log('Finished');
      format.kill();
      format = null;
      for(var i = 0; i < finishedData.length; i++) {
        fd = finishedData[i];
        for(var j = 0; j < fd.length; j++) {
          fd2 = fd[j];
          t.push({passThrough: true, file: fd2.file});
        }
      }
      t.push(null);
      log('destroyed');
    });
  }

  var stream = parallel(options.maxParallel || 10*concurrency, process);
  stream.on('end', function () {
    log('end input stream, flushing');
    if (format) {
      format.all({file: null}).then(function(data) {
        log('Flush data: ' + data);
        format.kill();
        format = null;
      });
    }
  });

  var t = through2.obj(function(file, enc, callback) {
    log('input:' + JSON.stringify(file.path));
    callback(null, file);
  }, function (callback) {
    callback();
  });

  t.on('end', function() {
    log('Flushing!');
  });
  t.pipe(stream);
  return stream;
}

module.exports = plugin;

function log(s) {
  //console.log(new Date().toISOString() + ': ' + s);
}
