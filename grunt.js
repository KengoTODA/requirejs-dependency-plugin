module.exports = function(grunt) {
  grunt.initConfig({
    qunit: {
      index: 'test/*.html'
    },
    coffee: {
      compile: {
        files: {
          'dependency.js': 'dependency.coffee'
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.registerTask('default', 'coffee qunit');
};