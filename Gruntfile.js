module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> */\n',
        mangle: true,
        compress: {
          sequences: true,
          dead_code: true,
          conditionals: true,
          booleans: true,
          unused: true,
          if_return: true,
          join_vars: true,
          drop_console: true
        }
      },
      build: {
        src: 'dist/fabmo.js',
        dest: 'dist/fabmo.min.js'
      }
    },
  
  'string-replace': {
    version: {
      files: {
        'dist/fabmo.js' : 'fabmo.js',
      },
      options: {
        replacements: [{
          pattern: /{{FABMO_VERSION}}/g,
          replacement: 'v<%= pkg.version %>'
        }]
      }
    }
  },

  release: {
    options: {
      bump: true, //default: true
      //changelog: false, //default: false
      //changelogText: '<%= version %>\n', //default: '### <%= version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n'
      file: 'package.json', //default: package.json
      add: false, //default: true
      commit: false, //default: true
      tag: false, //default: true
      push: false, //default: true
      pushTags: false, //default: true
      npm: false, //default: true
      npmtag: true, //default: no tag
      indentation: '  ', //default: '  ' (two spaces)
      folder: 'folder/to/publish/to/npm', //default project root
      tagName: 'v<%= version %>', //default: '<%= version %>'
      commitMessage: 'Release v<%= version %>', //default: 'release <%= version %>'
      tagMessage: 'Tagging version v<%= version %>', //default: 'Version <%= version %>',
      beforeBump: [], // optional grunt tasks to run before file versions are bumped
      afterBump: ['build'], // optional grunt tasks to run after file versions are bumped
      beforeRelease: [], // optional grunt tasks to run after release version is bumped up but before release is packaged
      afterRelease: [], // optional grunt tasks to run after release is packaged
      updateVars: [], // optional grunt config objects to update (this will update/set the version property on the object specified)
      github: {
        //apiRoot: 'https://git.example.com/v3', // Default: https://github.com
        repo: 'FabMo/fabmo.js',                 //put your user/repo here
        accessTokenVar: 'GITHUB_ACCESS_TOKEN',  //ENVIRONMENT VARIABLE that contains GitHub Access Token
      }
    }
  }
  });



  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-release');

  // Default task(s).
  grunt.registerTask('default', ['release']);

  grunt.registerTask('build', 'Perform the build', function() {
    grunt.task.run(['string-replace', 'uglify']);
  });

  grunt.registerTask('check-github-token', 'Check that a github access token has been defined.', function() {
    if(!process.env.GITHUB_ACCESS_TOKEN) {
      grunt.fail.fatal('No github access token is defined.  The GITHUB_ACCESS_TOKEN environment variable should be set to a valid access token.');
    }
  });

};
