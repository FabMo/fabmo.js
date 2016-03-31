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

  'github-release': {
    options: {
      repository: 'FabMo/fabmo.js', // Path to repository
      auth: {
        user : process.env.GITHUB_USERNAME,
        password : process.env.GITHUB_PASSWORD
      },
      release: {
        tag_name: 'v' + grunt.file.readJSON('package.json').version,
        body : 'Release version ' + grunt.file.readJSON('package.json').version
      }
    },
    files: {
      src: ['dist/fabmo.js', 'dist/fabmo.min.js']
    }
  },

  bumpup: 'package.json',
  
  yuidoc: {
    compile: {
      name: '<%= pkg.name %>',
      description: '<%= pkg.description %>',
      version: '<%= pkg.version %>',
      url: '<%= pkg.homepage %>',
      options: {
        "paths": ".",
        "outdir": "dist/doc/api",
        "ignorepaths" : ["dist","node_modules"],
        "themedir" : "node_modules/yuidoc-lucid-theme",
        "helpers" : ["node_modules/yuidoc-lucid-theme/helpers/helpers.js"],
        "linkNatives" : true
      }
    }
  },

  'gh-pages': {
      options: {
        base: 'dist/doc/'
      },
      src: ['**']
    },

});

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-github-releaser');
  grunt.loadNpmTasks('grunt-bumpup');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');

  // Default task(s).
  grunt.registerTask('default', ['release']);

  grunt.registerTask('check-github-token', 'Check that a github access token has been defined.', function() {
    if(!process.env.GITHUB_ACCESS_TOKEN) {
      grunt.fail.fatal('No github access token is defined.  The GITHUB_ACCESS_TOKEN environment variable should be set to a valid access token.');
    }
  });

grunt.registerTask('check-github-auth', 'Check that a github username/password', function() {
    if(!process.env.GITHUB_USERNAME || !process.env.GITHUB_PASSWORD) {
      grunt.fail.fatal('No github access credentials are defined.  You must set the GITHUB_USERNAME and GITHUB_PASSOWRD environment variables to push a release.');
    }
  });

  grunt.registerTask('release', 'Perform a release', function() {
    var arg = this.args[0] || 'patch';
    if(arg != 'major' && arg != 'minor' && arg != 'patch') {
      grunt.fail.fatal('Release version must be one of major/minor/patch');
    }
    grunt.task.run(['bumpup:' + arg, 'string-replace', 'uglify', 'github-release']);
  });

  grunt.registerTask('doc', 'Generate documentation', function() {
    grunt.task.run(['yuidoc']);
  });

  grunt.registerTask('doc-dist', 'Push documentation to web.', function() {
    grunt.task.run(['doc', 'gh-pages']);
  });

};
