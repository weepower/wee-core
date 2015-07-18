/* global config, JSCS, jshint, global, path, module, project, reloadPaths */

// -------------------------------------
// Load Dependencies
// -------------------------------------

var LessCssClean = require('less-plugin-clean-css');

global.browserSync = require('browser-sync');
global.jshint = require('jshint').JSHINT;
global.JSCS = require('jscs');
global.fs = require('fs-extra');
global.path = require('path');
global.Wee = require('../script/wee').Wee;

// Load build utilities
require('./utils');

// -------------------------------------
// Configure Grunt
// -------------------------------------

module.exports = function(grunt) {
	global.config = {};
	global.server = {};
	global.moduleLegacy = [];
	global.legacy = {};
	global.reloadPaths = [];
	global.legacyBuild = [];
	global.legacyConvert = [];
	global.version = '3.0.0';

	grunt.initConfig({
		less: {
			options: {
				modifyVars: '<%= config.style.vars %>',
				strictMath: true,
				paths: [
					'<%= config.paths.root %>'
				],
				plugins: [
					new LessCssClean()
				]
			},
			core: {
				files: [
					{
						dest: '<%= config.paths.temp %>/wee.css',
						src: '<%= config.paths.temp %>/wee.less'
					}
				]
			},
			lib: {
				files: [{
					expand: true,
					cwd: '<%= config.paths.cssSource %>/lib',
					dest: '<%= config.paths.css %>/lib',
					src: [
						'**/*.{css,less}',
						'!**/*.min.css'
					],
					rename: function(dest, src) {
						return Wee.getMinifiedExtension(dest, src, '.min.css');
					}
				}]
			}
		},
		uglify: {
			options: {
				compress: {
					drop_debugger: false
				}
			},
			core: {
				files: [{
					dest: '<%= config.paths.js %>script.min.js',
					src: '<%= config.script.files %>'
				}]
			},
			lib: {
				files: [{
					expand: true,
					cwd: '<%= config.paths.jsSource %>/lib',
					dest: '<%= config.paths.js %>/lib',
					src: [
						'**/*.js',
						'!**/*.min.js'
					],
					rename: function(dest, src) {
						return Wee.getMinifiedExtension(dest, src, '.min.js');
					}
				}]
			}
		},
		concat: {
			style: {
				dest: '<%= config.paths.css %>/style.min.css',
				src: '<%= config.style.concat %>'
			}
		},
		imagemin: {
			options: {
				svgoPlugins: [
					{
						removeViewBox: false
					},
					{
						convertPathData: false
					}
				]
			},
			core: {
				files: [
					{
						expand: true,
						cwd: '<%= config.paths.assets %>',
						dest: '<%= config.paths.assets %>',
						src: [
							'**/*.{gif,jpg,png,svg}'
						]
					}
				]
			}
		},
		watch: {
			options: {
				spawn: false
			},
			images: {
				files: [
					'<%= config.paths.assets %>/**/*.{gif,jpg,png,svg}'
				],
				tasks: [
					'newer:imagemin',
					'notify:images'
				]
			},
			scriptCore: {
				files: '<%= config.script.files %>',
				tasks: [
					'uglify:core',
					'notify:script'
				]
			},
			scriptLib: {
				files: [
					'<%= config.paths.jsSource %>/lib/**/*.js',
					'!<%= config.paths.jsSource %>/lib/**/*.min.js'
				],
				tasks: [
					'uglify:lib',
					'notify:script'
				]
			},
			styleCore: {
				files: [
					'wee/style/**/*.less',
					'<%= config.paths.cssSource %>/custom/**/*.less',
					'!<%= config.paths.temp %>wee.legacy.less'
				],
				tasks: [
					'less:core',
					'concat:style'
				]
			},
			styleLib: {
				files: [
					'<%= config.paths.cssSource %>/lib/**/*.{css,less}',
					'!<%= config.paths.cssSource %>/lib/**/*.min.css'
				],
				tasks: [
					'less:lib',
					'notify:style'
				]
			},
			styleBuild: {
				files: [
					'<%= config.paths.cssSource %>/build/**/*.{css,less}'
				],
				tasks: [
					'buildStyle',
					'notify:style'
				],
				options: {
					event: [
						'added',
						'deleted'
					]
				}
			},
			styleBuildUpdate: {
				files: [
					'<%= config.paths.cssSource %>/build/**/*.{css,less}'
				],
				tasks: [
					'less:core',
					'concat:style',
					'notify:style'
				],
				options: {
					event: [
						'changed'
					]
				}
			},
			styleConcat: {
				files: [
					'<%= config.paths.temp %>/**/*.css'
				],
				tasks: [
					'concat:style',
					'notify:style'
				]
			},
			project: {
				files: [
					'<%= config.path %>',
					'<%= config.paths.modulesSource %>/*/module.json'
				],
				tasks: [
					'default',
					'notify:project'
				]
			}
		}
	});

	//// Watch for changes to validate
	//if (project.script.validate.watch) {
	//	grunt.event.on('watch', function(action, file) {
	//		if (action !== 'deleted') {
	//			Wee.validate(config, grunt, file);
	//		}
	//	});
	//}

	// -------------------------------------
	// Load Plugins
	// -------------------------------------

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-newer');

	// -----------------------------------
	// Grunt Tasks
	// -----------------------------------

	grunt.registerTask('default', [
		'init',
		'cleanup',
		'configStyle',
		'configScript',
		'configGenerator',
		'buildStyle',
		'configModules',
		'buildLegacy',
		'uglify:core',
		'uglify:lib',
		'imagemin'
	]);

	// Build + Watch
	grunt.registerTask('local', [
		'default',
		'proxy',
		'checkUpdates',
		'sync',
		'watch'
	]);

	// Build + Server + Open + Watch
	grunt.registerTask('static', [
		'default',
		'server',
		'checkUpdates',
		'sync',
		'watch'
	]);

	// Validate
	grunt.registerTask('validate', [
		'init',
		'runValidation'
	]);

	// Generate Site
	grunt.registerTask('generate', [
		'init',
		'configGenerator'
	]);

	// Update
	grunt.registerTask('update', [
		'checkUpdates'
	]);
};