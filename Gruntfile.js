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
      }
    },
  });

  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('web', 'launch webserver and watch tasks', [
    'watch:web'
  ]);

  grunt.registerTask('default', ['web']);
};
