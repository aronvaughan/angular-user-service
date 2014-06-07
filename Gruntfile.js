// Generated on 2014-05-06 using generator-angular-component 0.2.3
'use strict';

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-bower-install');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-connect-proxy');
    grunt.loadNpmTasks('grunt-protractor-runner');

    //for karma - you may need to install explicitly
    //sudo npm i -g karma phantomjs selenium-webdriver grunt-cli jasmine-node istanbul

    // Configurable paths
    var yoConfig = {
        livereload: 35729,
        examplePage: 'example/',
        src: 'src',
        dist: 'dist'
    };

    // Livereload setup
    var lrSnippet = require('connect-livereload')({
        port: yoConfig.livereload
    });
    var mountFolder = function(connect, dir) {
        return connect.static(require('path').resolve(dir));
    };

    // Load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        yo: yoConfig,
        meta: {
            banner: '/**\n' +
                ' * <%= pkg.name %>\n' +
                ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                ' * @link <%= pkg.homepage %>\n' +
                ' * @author <%= pkg.author.name %> <<%= pkg.author.email %>>\n' +
                ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
                ' */\n'
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>/<%= yo.examplePage %>'
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yo.dist %>/*',
                        '!<%= yo.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            less: {
                files: ['<%= yo.src %>/{,*/}*.less'],
                tasks: ['less:dist']
            },
            app: {
                files: [
                    '<%= yo.src %>/{,*/}*.html',
                    '{.tmp,<%= yo.src %>}/{,*/}*.css',
                    '{.tmp,<%= yo.src %>}/{,*/}*.js'
                ],
                options: {
                    livereload: yoConfig.livereload
                }
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'qunit']
            },
            express: {
                files: ['<%= yo.src %>/example/server/*.js'],
                tasks: ['express:dev'],
                options: {
                    spawn: false // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions. Without this option specified express won't be reloaded
                }
            }
        },
        connect: {
            options: {
                port: 9000,
                hostname: '0.0.0.0' // Change this to '0.0.0.0' to access the server from outside.
            },
            //forward to grails server anything with /names in it
            proxies: [{
                context: ['/api', '/api/*'],
                host: 'localhost',
                port: 3000,
                https: false,
                changeOrigin: false
            }],
            livereload: {
                options: {
                    open: true,
                    middleware: function(connect) {
                        var middleWares = [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yoConfig.src),
                            mountFolder(connect, '.'),
                            require('grunt-connect-proxy/lib/utils').proxyRequest
                        ];
                        return middleWares;
                    }
                }
            }
        },
        less: {
            options: {
                // dumpLineNumbers: 'all',
                paths: ['<%= yo.src %>']
            },
            dist: {
                files: {
                    '<%= yo.src %>/<%= yo.name %>.css': '<%= yo.src %>/<%= yo.name %>.less'
                }
            }
        },
        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            src: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['<%= yo.src %>/{,*/}*.js']
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/**/*.js']
            }
        },
        karma: {
            options: {
                configFile: 'karma.conf.js',
                browsers: ['PhantomJS']
            },
            unit: {
                singleRun: true,
                configFile: 'karma-unit.conf.js'
            },
            integration: {
                singleRun: true,
                configFile: 'karma-integration.conf.js'
            },
            server: {
                autoWatch: true
            }
        },
        ngmin: {
            options: {
                banner: '<%= meta.banner %>'
            },
            dist: {
                files: [{
                    src: '<%= yo.src %>/<%= pkg.name %>.js',
                    dest: '<%= yo.dist %>/<%= pkg.name %>.js'
                }, {
                    src: '<%= yo.src %>/authManager/authManager_grailsSpringSecurityRest.js',
                    dest: '<%= yo.dist %>/authManager/authManager_grailsSpringSecurityRest.js'
                }]
            }
            // dist: {
            //   files: {
            //     '/.js': '/.js'
            //   }
            // }
        },
        concat: {
            options: {
                banner: '<%= meta.banner %>',
                stripBanners: true
            },
            dist: {
                src: ['<%= yo.src %>/authManager/authManager_grailsSpringSecurityRest.js', '<%= yo.src %>/<%= pkg.name %>.js'],
                dest: '<%= yo.dist %>/<%= pkg.name %>.min.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>'
            },
            /*
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: '<%= yo.dist %>/<%= pkg.name %>.min.js'
            }  */
            dist: {
                files: [{
                        src: '<%= concat.dist.dest %>',
                        dest: '<%= yo.dist %>/<%= pkg.name %>.min.js'
                    }
                    /*, {
                    src: '<%= yo.dist %>/authManager/authManager_grailsSpringSecurityRest.js',
                    dest: '<%= yo.dist %>/authManager/authManager_grailsSpringSecurityRest.min.js'
                }*/
                ]
            }
        },
        jsbeautifier: {
            //"default": {
            //      src : ["src/**/*.js"]
            //  },
            'pre-test': {
                src: ['src/**/*.js', 'Gruntfile.js', 'test/**/*.js'],
                options: {
                    //mode:"VERIFY_ONLY"
                    //dest: "test/pretty"
                }
            }
        },
        //https://github.com/stephenplusplus/grunt-bower-install
        bowerInstall: {
            target: {
                src: '<%= yo.src %>/example/index.html',
                ignorePath: ['<%= yo.src %>/', 'bower_components']
            }
        },
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['-a'], // '-a' for all files
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
            }
        },
        protractor: {
            options: {
                keepAlive: true,
                configFile: 'protractor.conf.js'
            },
            run: {}
        },
        express: {
            options: {
                // Override defaults here
            },
            dev: {
                options: {
                    script: '<%= yo.src %>/example/server/server.js'
                }
            }
            /*,
            prod: {
              options: {
                script: 'path/to/prod/server.js',
                node_env: 'production'
              }
            },
            test: {
              options: {
                script: 'path/to/test/server.js'
              }
            } */
        }
    });


    grunt.registerTask('serve', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'build',
            'bowerInstall',
            'configureProxies',
            'express:dev',
            'connect:livereload',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'jsbeautifier:pre-test',
        'jshint',
        'configureProxies',
        'express:dev',
        'karma:unit',
        // not working 'karma:integration'
        // not needed  'protractor:run'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'jsbeautifier:pre-test',
        'jshint',
        'less:dist',
        'ngmin:dist',
        'concat:dist',
        'uglify:dist'
    ]);

    grunt.registerTask('release', [
        'test',
        'bump-only',
        'build',
        'bump-commit'
    ]);

    grunt.registerTask('usage', 'prints usage information', function() {
        grunt.log.writeln('=============  usage =============');
        grunt.log.writeln('grunt serve - to see example app');
        grunt.log.writeln('grunt clean - to clean up the project and artifacts');
        grunt.log.writeln('grunt test - to run the tests');
        grunt.log.writeln('grunt build - to build the distributable files');
        grunt.log.writeln('grunt release - to bump the version, create distributables and commit to the repo and tag it');
    });
    grunt.registerTask('default', ['usage']);

};
