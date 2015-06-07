module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bowerRequirejs: {
      target: {
        rjsConfig: 'src/wedgewheel.js',
        options: {
          transitive: true
        }
      }
    },
    clean: {
      build: [
        'build',
        'dist'
      ]
    },
    copy: {
      //Disabled for now. Travis doesn't seem to allow me to use subdirectories, so the "combined" file will have to do for the release.
      //libs: {
      //  src: "src/bower_components/*",
      //  dest: "dist/bower_components"
      //},
      //sourcecode: {
      //  src: "src/wedgewheel.js",
      //  dest: "dist/wedgewheel.js"
      //}
    },
    requirejs: {
      combine: {
        options: {
          mainConfigFile: "src/wedgewheel.js",
          out: "dist/wedgewheel.combined.js",
          optimize: 'none',
          removeCombined: true,
          cjsTranslate: true,
          wrap: true
        }
      }
    },
    uglify: {
      compile: {
        options: {
          preserveComments: 'some'
        },
        files: {
          'dist/wedgewheel.combined.min.js': ['dist/wedgewheel.combined.js']
          //'dist/wedgewheel.min.js': ['dist/wedgewheel.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-bower-requirejs');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  //grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('common', ['requirejs' /*,'copy'*/]);

  grunt.registerTask('prod', ['clean', 'common', 'uglify']);

  grunt.registerTask('default', ['prod']);

};