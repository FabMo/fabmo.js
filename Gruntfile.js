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
        'dist/doc/index.html' : 'dist/doc/index.html'
      }
    },

    doc: {
      files: {
        'dist/doc/index.html' : 'dist/doc/index.html'
      }
    },
    options: {
      replacements: [{
        pattern: /{{FABMO_VERSION}}/g,
        replacement: 'v<%= pkg.version %>'
      }]
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
  copy: {
      doc: {
        expand: true,
        src: 'doc/**',
        dest: 'dist/',
      },
    },

  'availabletasks' : {
    'tasks' : {
        options: {
            showTasks: ['user'],
            filter: 'exclude',
            tasks: ['availabletasks', 'default', 'check-github-auth', 'check-github-token']
        }
    }
  },
  gitcommit: {
        task: {
            options: {
                message: '<%= pkg.name %> v<%= pkg.version %>',
                noVerify: true,
                noStatus: false
            },
            files: {
                src: ['package.json']
            }
        }
    },
});

// Load the plugin that provides the "uglify" task.
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-string-replace');
grunt.loadNpmTasks('grunt-github-releaser');
grunt.loadNpmTasks('grunt-bumpup');
grunt.loadNpmTasks('grunt-gh-pages');
grunt.loadNpmTasks('grunt-contrib-yuidoc');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-available-tasks');
grunt.loadNpmTasks('grunt-git');

grunt.registerTask('release', 'Perform a complete release, including documentation generation, tagging, and push to Github.', function() {
  if(this.args.length == 0) {
    grunt.fail.fatal('You must specify a release type to prepare a release:  grunt prepare:major|minor|patch');
  }
  arg = this.args[0];
  grunt.task.run(['prepare:' + arg, 'gitcommit', 'push-release']);
});

grunt.registerTask('check-github-token', 'Check that a github access token has been defined.', function() {
  if(!process.env.GITHUB_ACCESS_TOKEN) {
    grunt.fail.fatal('No github access token is defined.  The GITHUB_ACCESS_TOKEN environment variable should be set to a valid access token.');
  }
});

grunt.registerTask('check-github-auth', 'Check that a github username/password has been specified', function() {
  if(!process.env.GITHUB_USERNAME || !process.env.GITHUB_PASSWORD) {
    grunt.fail.fatal('No github access credentials are defined.  You must set the GITHUB_USERNAME and GITHUB_PASSOWRD environment variables to push a release.');
  }
});

grunt.registerTask('prepare', 'Prepare a release.  (Do not tag or push to Github)', function() {
  if(this.args.length == 0) {
    grunt.fail.fatal('You must specify a release type to prepare a release:  grunt prepare:major|minor|patch');
  }
  arg = this.args[0];
  if(arg != 'major' && arg != 'minor' && arg != 'patch') {
    grunt.fail.fatal('Release version must be one of major/minor/patch');
  }
  // Bump the rev
  grunt.task.run(['bumpup:' + arg, 'doc', 'string-replace', 'uglify']);
});

// Push 
grunt.registerTask('push-release', 'Create a release and push to Github.', function() {
  grunt.task.run(['check-github-auth','github-release','doc-dist']);
});

grunt.registerTask('doc', 'Generate documentation.', function() {
  grunt.task.run(['yuidoc', 'copy:doc', 'string-replace:doc']);
});

grunt.registerTask('doc-dist', 'Push documentation to Github. (gh-pages)', function() {
  grunt.task.requires(['doc']);
  grunt.task.run(['gh-pages']);
});

// Default task(s).
grunt.registerTask('default', 'availabletasks');

};
