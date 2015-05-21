'use strict';
/* jshint strict: true, node: true */

var path = require('path');

function here() {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(__dirname);
  return path.join.apply(path.join, args);
}

module.exports = function(grunt) {
  var pkg = grunt.file.readJSON(here('package.json'));

  grunt.task.loadNpmTasks('grunt-bower-task');
  grunt.task.loadNpmTasks('grunt-contrib-jshint');
  grunt.task.loadNpmTasks('grunt-contrib-requirejs');
  grunt.task.loadNpmTasks('grunt-contrib-uglify');
  grunt.task.loadNpmTasks('grunt-mocha-phantomjs');

  var paths = {
    jquery: '../../vendor/jquery',
    underscore: '../../vendor/underscore',
    utils: '../../vendor/utils',
    localstorage: '../../vendor/localstorage'
  };

  grunt.initConfig({
    pkg: pkg,
    jshint: {
      files: [
        'src/**/*.js',
        'Gruntfile.js'
      ],
      options: {
        strict: true,
        indent: 2,
        maxlen: 80
      }
    },
    bower: {
      install: {
        options: {
          targetDir: '',
          verbose: true,
          layout: function() {
            return 'vendor';
          }
        }
      }
    },
    requirejs: {
      dist: {
        options: {
          baseUrl: 'src/js',
          optimize: 'none',
          name: 'api',
          out: 'dist/api.js',
          exclude: ['underscore', 'jquery', 'utils', 'localstorage'],
          paths: paths
        }
      },
      'dist.full': {
        options: {
          baseUrl: 'src/js',
          optimize: 'none',
          name: 'api',
          out: 'dist/api.full.js',
          paths: paths
        }
      }
    },
    uglify: {
      options: {
        beautify: false
      },
      background: {
        src: here('dist', 'api.js'),
        dest: here('dist', 'api.min.js')
      }
    },
    mocha_phantomjs: {
      all: [
        'test/runner.html'
      ]
    }
  });

  grunt.registerTask('default', [
    'bower',
    'jshint',
    'mocha_phantomjs',
    'requirejs',
    'uglify'
  ]);
};
