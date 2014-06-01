var glob = require('glob'),
    exec = require('child_process').exec;

(function() {
  module.exports = function(grunt) {
    'use strict';
    // The `time-grunt` module provides a handy output of the run time of each
    // grunt task
    require('time-grunt')(grunt);
    var path, _;
    _ = grunt.util._;
    path = require('path');
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      coffeelint: {
        lib: {
          src: ['*.coffee', 'lib/*.coffee'],
        },
        options: {
          'no_trailing_whitespace': {
            level: 'error'
          },
          'max_line_length': {
            level: 'ignore'
          }
        }
      },
      jshint: {
        options: {
          jshintrc: '.jshintrc',
          reporter: require('jshint-stylish')
        },
        gruntfile: {
          src: 'Gruntfile.js'
        }
      },
      coffee: {
        all: {
          expand: true,
          cwd: './',
          src: ['*.coffee', 'lib/*.coffee'],
          dest: path.resolve(__dirname, 'dist'),
          ext: '.js'
        },
      },
      copy: {
        all: {
          files: [
            {
              src: 'package.json',
              dest: 'dist/'
            },
            {
              src: 'config.json',
              dest: 'dist/'
            },
            {
              src: 'rbn-pi.js',
              dest: 'dist/'
            },
            {
              src: 'start.sh',
              dest: 'dist/'
            },
            {
              src: 'cron/**',
              dest: 'dist/'
            }
          ]
        }
      },
      clean: ['out/'],
      rsync: {
        pi: {
          files: 'dist/',
          options: {
            host: '',
            user: 'pi',
            remoteBase: '/home/pi/bifrost'
          }
        }
      },
      watch: {
        coffee: {
          files: ['**/*.coffee'],
          tasks: ['coffee', 'copy']
        }
      }
    });
    grunt.loadNpmTasks('grunt-coffeelint');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-rsync-2');
    grunt.registerTask('lint', ['coffeelint']);
    grunt.registerTask('for-modules', function (command) {
      var options = {
            cwd: __dirname
          },
          modulesPath = path.resolve(__dirname, 'lib/modules/*/'),
          done = this.async();
      glob(modulesPath, options, function (err, modules) {
        var counter = 0;
        modules.forEach(function (module, index, modules) {
          console.log('Running `' + command + '` for: ' + module);
          exec('cd ' + module + '&&' + command, function (error, stdout, stderr) {
            if (error) {
              throw new Error(error);
            }
            console.log('Finished running `' + command + '` for: ' + module);
            console.log(stdout);
            counter++;
            if (counter === modules.length) {
              done();
            }
          });
        }.bind(this));
      }.bind(this));
    });
    grunt.registerTask('build-modules', ['for-modules:npm install -- production']);
    grunt.registerTask('update-modules', ['for-modules:npm update']);
    grunt.registerTask('compile', [
      'coffeelint',
      'coffee',
      'copy'
    ]);
    grunt.registerTask('rsync_pi', 'rsync code to the raspberry pi', function (n) {
      var hostArr, hosts;
      hosts = grunt.option('hosts');
      if (hosts === undefined) {
        console.log('*** Submit this with the \'--hosts\' option, ' +
          'which is a comma separated list of base station hostnames or ' +
          'ip addresses ***');
        return false;
      }
      else {
        hostArr = hosts.split(',');
        for (var i in hostArr) {
          var host = hostArr[i];
          grunt.config.set('rsync.pi.options.host', host);
          grunt.task.run(['rsync:pi']);
        }
      }

      // 'rsync:pi'
    });
    var defaultTasks = ['compile'];
    grunt.registerTask('default', defaultTasks);
    return grunt.registerTask('pi', ['compile', 'rsync_pi']);
  };

}).call(this);
