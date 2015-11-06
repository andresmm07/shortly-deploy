module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    concat: {
      options: {
            separator: ';',
          },
          dist: {
            src: ['public/client/app.js', 'public/client/link.js', 'public/client/links.js','public/client/linkView.js','public/client/linksView.js','public/client/createLinkView.js','public/client/router.js'],
            dest: 'public/dist/built.js',
          },
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      my_target: {
            files: {
              'public/dist/built.min.js': ['public/dist/built.js']
            }
          }
    },

    jshint: {
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
          'public/dist/**/*.js',
          'node_modules/**/*'
        ]
      },
      all: ['../2015-10-shortly-deploy/**/*.js']
    },

    cssmin: {
        // Add filespec list here
      my_target: {
            files: {
              'public/style.min.css': ['public/style.css']
            }
          }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      multiple: {
        command: [
            'azure site scale mode standard alshortly',
            'echo site scaled up',
            'git push alshortly master',
            'echo git pushed',
            'azure site browse alshortly',
            'echo site launched in browser',
            'azure site scale mode free alshortly',
            'echo scaled down'
        ].join('&&')
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest', 'jshint'
  ]);

  grunt.registerTask('build', [
    'concat', 'cssmin', 'uglify'
  ]);

  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      // add your production server task here
      grunt.task.run(['shell']);
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', function(n) {
      // add your production server task here
      if(grunt.option('prod')){
        grunt.task.run(['test', 'build', 'shell'])        
      }else{
        grunt.task.run(['test', 'server-dev'])
      }

  });


};
