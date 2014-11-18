var _ = require('lodash');
var path = require('path');
var localify = require('./src/dev/localify');

var config = {};

var APPS = process.env.MOOC_APP ? [process.env.MOOC_APP] : [
  'maze',
  'turtle',
  'bounce',
  'flappy',
  'studio',
  'jigsaw',
  'calc',
  'webapp',
  'eval'
];

var APPS_GROUPED = _.groupBy(APPS, function(item) {
  return APPS.indexOf(item) % 4;
});

var APPS_CHUNK = [
  {name: '1', apps: APPS_GROUPED[0]},
  {name: '2', apps: APPS_GROUPED[1]},
  {name: '3', apps: APPS_GROUPED[2]},
  {name: '4', apps: APPS_GROUPED[3]}
];

// Parse options from environment.
var MINIFY = (process.env.MOOC_MINIFY === '1');
var LOCALIZE = (process.env.MOOC_LOCALIZE === '1');
var DEV = (process.env.MOOC_DEV === '1');

var LOCALES = (LOCALIZE ? [
  'ar_sa',
  'az_az',
  'bg_bg',
  'bn_bd',
  'ca_es',
  'cs_cz',
  'da_dk',
  'de_de',
  'el_gr',
  'en_us',
  'en_ploc',
  'es_es',
  'eu_es',
  'fa_ir',
  'fi_fi',
  'fil_ph',
  'fr_fr',
  'he_il',
  'hi_in',
  'hr_hr',
  'hu_hu',
  'id_id',
  'is_is',
  'it_it',
  'ja_jp',
  'ko_kr',
  'lt_lt',
  'ms_my',
  'nl_nl',
  'no_no',
  'pl_pl',
  'pt_br',
  'pt_pt',
  'ro_ro',
  'ru_ru',
  'sk_sk',
  'sl_si',
  'sq_al',
  'sr_sp',
  'sv_se',
  'ta_in',
  'th_th',
  'tr_tr',
  'uk_ua',
  'ur_pk',
  'vi_vn',
  'zh_cn',
  'zh_tw'
] : [
  'en_us',
  'en_ploc'
]);

// if specified will, will build en_us, en_ploc, and specified locale
if (process.env.MOOC_LOCALE) {
  LOCALES.push(process.env.MOOC_LOCALE);
}

config.clean = {
  all: ['build']
};

var ace_suffix = DEV ? '' : '-min';
var droplet_suffix = DEV ? '' : '.min';
var requirejs_dir = DEV ? 'full' : 'min';

config.copy = {
  src: {
    files: [
      {
        expand: true,
        cwd: 'src/',
        src: ['**/*.js'],
        dest: 'build/js'
      }
    ]
  },
  browserified: {
    files: [
      {
        expand: true,
        cwd: 'build/browserified',
        src: ['**/*.js'],
        dest: 'build/package/js'
      }
    ]
  },
  static: {
    files: [
      {
        expand: true,
        cwd: 'static/',
        src: ['**'],
        dest: 'build/package/media'
      },
      {
        expand: true,
        cwd: 'lib/blockly/media',
        src: ['**'],
        //TODO: Would be preferrable to separate Blockly media.
        dest: 'build/package/media'
      }
    ]
  },
  lib: {
    files: [
      {
        expand: true,
        cwd: 'lib/ace/src' + ace_suffix + '-noconflict/',
        src: ['**/*.js'],
        dest: 'build/package/js/ace/'
      },
      {
        expand: true,
        cwd: 'lib/requirejs/' + requirejs_dir + '/',
        src: ['require.js'],
        dest: 'build/package/js/requirejs/'
      },
      {
        expand: true,
        cwd: 'lib/droplet',
        src: ['droplet-full' + droplet_suffix + '.js'],
        dest: 'build/package/js/droplet/'
      },
      {
        expand: true,
        cwd: 'lib/droplet',
        src: ['droplet.min.css'],
        dest: 'build/package/css/droplet/'
      },
      {
        expand: true,
        cwd: 'lib/jsinterpreter',
        src: ['acorn_interpreter.js'],
        dest: 'build/package/js/jsinterpreter/'
      }
    ]
  }
};

config.lodash = {
  'build': {
    'dest': 'src/lodash.js',
    'options': {
      'include': [
        'debounce', 'reject', 'map', 'value', 'range', 'without', 'sample',
        'create', 'flatten', 'isEmpty', 'wrap']
    }
  }
};

config.sass = {
  all: {
    options: {
      outputStyle: (MINIFY ? 'compressed' : 'nested')
    },
    files: {
      'build/package/css/common.css': 'style/common.scss'
    }
  }
};
APPS.filter(function (app) { return app != 'none'; }).forEach(function(app) {
  var src = 'style/' + app + '/style.scss';
  var dest = 'build/package/css/' + app + '.css';
  config.sass.all.files[dest] = src;
});

config.pseudoloc = {
  all: {
    srcBase: 'i18n',
    srcLocale: 'en_us',
    destBase: 'build/i18n',
    pseudoLocale: 'en_ploc'
  }
};

config.messages = {
  all: {
    locales: LOCALES,
    srcBases: ['i18n', 'build/i18n'],
    destBase: 'build/locale'
  }
};

config.symlink = {
  locale: {
    src: 'build/locale/en_us',
    dest: 'build/locale/current'
  }
};

config.ejs = {
  all: {
    srcBase: 'src',
    destBase: 'build/js'
  }
};

config.browserify = {};
APPS.forEach(function(app) {
  LOCALES.forEach(function(locale) {
    var src = 'build/js/' + app + '/main.js';
    var dest = 'build/browserified/' + locale + '/' + app + '.js';
    var files = {};
    files[dest] = [src];
    config.browserify[app + '_' + locale] = {
      files: files,
      options: {
        transform: [localify(locale)],
        watch: true
      }
    };
  });
});

APPS_CHUNK.forEach(function(chunk) {
  var files = {};
  chunk.apps.forEach(function(app) {
    files = _.merge(files, config.browserify[app + '_en_us'].files)
  });
  config.browserify['chunk_'+chunk.name] = {
    files: files,
    options: {
      transform: [localify('en_us')],
      watch: true
    }
  };
});

LOCALES.forEach(function(locale) {
  var files = {};
  APPS.forEach(function(app) {
    files = _.merge(files, config.browserify[app + '_' + locale].files)
  });
  config.browserify[locale] = {
    files: files,
    options: {
      transform: [localify(locale)],
      watch: true
    }
  };
});


config.concat = {};
LOCALES.forEach(function(locale) {
  var ext = DEV ? 'uncompressed' : 'compressed';
  config.concat['vendor_' + locale] = {
    nonull: true,
    src: [
      'lib/blockly/blockly_' + ext + '.js',
      'lib/blockly/blocks_' + ext + '.js',
      'lib/blockly/javascript_' + ext + '.js',
      'lib/blockly/' + locale + '.js'
    ],
    dest: 'build/package/js/' + locale + '/vendor.js'
  };
});

config.express = {
  server: {
    options: {
      port: 8000,
      bases: path.resolve(__dirname, 'build/package'),
      server: path.resolve(__dirname, './src/dev/server.js'),
      livereload: true
    }
  }
};

var uglifiedFiles = {};
config.uglify = {
  browserified: {
    files: uglifiedFiles
  }
};

APPS_CHUNK.forEach(function(chunk) {
  var chunkUglifiedFiles = {};
  chunk.apps.forEach(function(app) {
    var relname = 'en_us' + '/' + app;
    var src = 'build/browserified/' + relname + '.js';
    var dest = 'build/package/js/' + relname + '.min.js';
    chunkUglifiedFiles[dest] = [src];
  });
  config.uglify['chunk_'+chunk.name] = { files: chunkUglifiedFiles };
});

LOCALES.forEach(function(locale) {
  var localeUglifiedFiles = {};
  APPS.forEach(function(app) {
      var relname = locale + '/' + app;
      var src = 'build/browserified/' + relname + '.js';
      var dest = 'build/package/js/' + relname + '.min.js';
      uglifiedFiles[dest] = [src];
      localeUglifiedFiles[dest] = [src];
  });
  config.uglify[locale] = { files: localeUglifiedFiles };
});

// Run specified Grunt tasks in parallel
config.concurrent = {
  uglify: [],
  browserify: [],
  uglify_chunk: _.map(APPS_CHUNK, function(x){return 'uglify:chunk_' + x.name}),
  browserify_chunk: _.map(APPS_CHUNK, function(x){return 'browserify:chunk_' + x.name})
};

LOCALES.forEach(function(locale) {
  config.concurrent['uglify'].push('uglify:'+locale);
  config.concurrent['browserify'].push('browserify:'+locale);
});

config.watch = {
  js: {
    files: ['src/**/*.js'],
    tasks: ['newer:copy:src']
  },
  browserify: {
    files: ['build/browserified/**/*.js'],
    tasks: ['newer:copy:browserified']
  },
  style: {
    files: ['style/**/*.scss', 'style/**/*.sass'],
    tasks: ['newer:sass']
  },
  content: {
    files: ['static/**/*'],
    tasks: ['newer:copy']
  },
  vendor_js: {
    files: ['lib/**/*.js'],
    tasks: ['newer:concat', 'newer:copy:lib']
  },
  ejs: {
    files: ['src/**/*.ejs'],
    tasks: ['newer:ejs', 'concurrent:browserify_chunk', 'concurrent:uglify_chunk', 'newer:copy:browserified']
  },
  messages: {
    files: ['i18n/**/*.json'],
    tasks: ['pseudoloc', 'messages', 'concurrent:browserify_chunk', 'concurrent:uglify_chunk', 'newer:copy:browserified']
  },
  dist: {
    files: ['build/package/**/*'],
    options: {
      livereload: true
    }
  }
};

config.jshint = {
  options: {
    node: true,
    browser: true,
    globals: {
      Blockly: true,
      //TODO: Eliminate the globals below here.
      BlocklyApps: true,
      Maze: true,
      Turtle: true,
      Bounce: true
    }
  },
  all: [
    'Gruntfile.js',
    'tasks/**/*.js',
    'src/**/*.js',
    'test/**/*.js',
    '!src/hammer.js',
    '!src/lodash.js',
    '!src/lodash.min.js',
    '!src/canvg/*.js'
  ]
};

config.mochaTest = {
  all: {
    options: {
      reporter: 'spec',
      timeout: 10000
    },
    src: ['test/*.js']
  }
};

config.strip_code = {
  options: {
    start_comment: 'start-test-block',
    end_comment: 'end-test-block'
  },
  all: {
    src: ['build/js/*.js']
  }
};

module.exports = function(grunt) {
  // Autoload grunt tasks
  require('load-grunt-tasks')(grunt, {pattern: ['grunt-*', '!grunt-lib-contrib']});

  grunt.initConfig(config);
  grunt.loadTasks('tasks');
  grunt.registerTask('noop', function(){});

  // grunt-contrib-symlink doesn't support overwrite option, so we need to create the symlink manually
  grunt.registerTask('dashboard_link', function(){
    var fs = require('fs');
    fs.unlinkSync('../dashboard/public/blockly');
    fs.symlinkSync('../../blockly/build/package', '../dashboard/public/blockly', 'dir');
  });

  grunt.registerTask('prebuild', [
    'pseudoloc',
    'messages',
    'symlink:locale',
    DEV ? 'dashboard_link' : 'noop',
    'newer:copy:src',
    'newer:strip_code',
    'newer:ejs'
  ]);

  grunt.registerTask('postbuild', [
    'newer:copy:browserified',
    'newer:copy:static',
    'newer:copy:lib',
    'newer:concat',
    'newer:sass'
  ]);

  grunt.registerTask('build', [
    'prebuild',
    'concurrent:browserify' + (LOCALIZE ? '' : '_chunk'),
    // Skip minification in development environment.
    DEV ? 'noop': ('concurrent:uglify' + (LOCALIZE ? '' : '_chunk')),
    'postbuild'
  ]);

  grunt.registerTask('rebuild', ['clean', 'build']);
  grunt.registerTask('dev', [
    'prebuild',
    'browserify:en_us',
    'postbuild',
    'watch'
  ]);
  grunt.registerTask('test', ['jshint', 'mochaTest']);
  grunt.registerTask('default', ['rebuild', 'test']);

  config.mochaTest.all.options.grep = new RegExp(grunt.option('grep'));
};
