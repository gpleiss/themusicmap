module.exports = function (grunt) {
  grunt.initConfig({
    express: {
      options: { },
      web: {
        options: {
          script: 'app.js',
        }
      },
    },

    exec: {
      jasmine: {
        command: 'node_modules/jasmine/bin/jasmine.js'
      }
    },

    watch: {
      web: {
        files: [
          'config/*',
          'models/**/*.js',
          'routes/**/*.js',
          'views/**/*.js',
        ],
        tasks: [
          'express:web'
        ],
        options: {
          nospawn: true,
          atBegin: true,
        }
      },
      test: {
        files: [
          'spec/**/*.js',
          'api/**/*.js',
          'jakelib/**/*.js'
        ],
        tasks: [
          'exec:jasmine'
        ],
        options: {
          atBegin: true,
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('web', 'launch webserver and watch tasks', [
    'watch:web'
  ]);

  grunt.registerTask('spec', 'run specs continuously', [
    'watch:test'
  ]);

  grunt.registerTask('spec:ci', 'run specs once', [
    'exec:jasmine'
  ]);

  grunt.registerTask('default', ['web']);
};
