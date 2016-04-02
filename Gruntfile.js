/* global __dirname, global, path, process */

(function() {
	'use strict';

	module.exports = function(grunt) {
		var LessCssClean = require('less-plugin-clean-css'),
			rootPath = '../../';

		global.version = '3.3.1';

		global.bs = require('browser-sync').create();
		global.fs = require('fs-extra');
		global.path = require('path');
		global.Wee = require('./js/wee');
		require('./utils');

		global.config = {
			configPath: path.join(
				rootPath,
				grunt.option('config') || 'wee.json'
			),
			rootPath: rootPath
		};

		global.reloadPaths = [];
		global.server = {};

		process.chdir(__dirname);

		grunt.loadTasks('./build/tasks');

		grunt.initConfig({
			less: {
				options: {
					modifyVars: '<%= config.style.vars %>',
					strictMath: true,
					paths: [
						'<%= config.paths.root %>'
					],
					plugins: [
						new LessCssClean({
							restructuring: false
						})
					]
				},
				core: {
					files: [
						{
							dest: '<%= config.paths.temp %>wee.css',
							src: '<%= config.paths.temp %>wee.less'
						}
					]
				},
				lib: {
					files: [{
						expand: true,
						cwd: '<%= config.paths.cssSource %>lib',
						dest: '<%= config.paths.css %>lib',
						src: [
							'**/*.{css,less}',
							'!**/*.min.css'
						],
						rename: function(dest, src) {
							return Wee.getMinExtension(dest, src, '.min.css');
						}
					}]
				}
			},
			uglify: {
				core: {
					options: {
						screwIE8: true,
						wrap: '<%= config.script.namespace %>'
					},
					files: [{
						dest: '<%= config.paths.temp %>core.min.js',
						src: [
							'<%= config.script.core %>',
							'<%= config.paths.temp %>global.js',
							'<%= config.paths.temp %>views.js'
						]
					}]
				},
				build: {
					files: [{
						dest: '<%= config.paths.temp %>build.min.js',
						src: '<%= config.script.build %>'
					}]
				},
				lib: {
					files: [{
						expand: true,
						cwd: '<%= config.paths.jsSource %>lib',
						dest: '<%= config.paths.js %>lib',
						src: [
							'**/*.js',
							'!**/*.min.js'
						],
						rename: function(dest, src) {
							return Wee.getMinExtension(dest, src, '.min.js');
						}
					}]
				}
			},
			concat: {
				script: {
					files: [{
						dest: '<%= config.paths.js %>script.min.js',
						src: [
							'<%= config.paths.temp %>core.min.js',
							'<%= config.paths.temp %>build.min.js'
						]
					}]
				},
				style: {
					dest: '<%= config.paths.css %>style.min.css',
					src: '<%= config.style.concat %>'
				}
			},
			imagemin: {
				options: {
					progressive: true,
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
							cwd: '<%= config.paths.imgSource %>',
							dest: '<%= config.paths.img %>',
							src: [
								'**/*.{gif,jpg,png,svg}'
							]
						},
						{
							expand: true,
							cwd: '<%= config.paths.moduleSource %>',
							dest: '<%= config.paths.module %>',
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
				imgCore: {
					files: [
						'<%= config.paths.imgSource %>**/*.{gif,jpg,png,svg}',
						'<%= config.paths.moduleSource %>**/*.{gif,jpg,png,svg}'
					],
					tasks: [
						'newer:imagemin',
						'notify:images'
					]
				},
				scriptBuild: {
					files: [
						'<%= config.script.build %>'
					],
					tasks: [
						'uglify:build',
						'concat:script',
						'notify:script'
					]
				},
				scriptLib: {
					files: [
						'<%= config.paths.jsSource %>lib**/*.js',
						'!<%= config.paths.jsSource %>lib**/*.min.js'
					],
					tasks: [
						'uglify:lib',
						'notify:script'
					]
				},
				styleCore: {
					files: [
						'wee/css/**/*.less',
						'<%= config.paths.cssSource %>custom/**/*.less'
					],
					tasks: [
						'less:core',
						'concat:style',
						'notify:style'
					]
				},
				styleLib: {
					files: [
						'<%= config.paths.cssSource %>lib/**/*.{css,less}',
						'!<%= config.paths.cssSource %>lib/**/*.min.css'
					],
					tasks: [
						'less:lib',
						'notify:style'
					]
				},
				styleBuild: {
					files: [
						'<%= config.paths.cssSource %>build/**/*.{css,less}'
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
						'<%= config.paths.cssSource %>build/**/*.{css,less}'
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
						'<%= config.paths.temp %>**/*.css'
					],
					tasks: [
						'concat:style',
						'notify:style'
					]
				},
				fontSync: {
					files: [
						'<%= config.paths.fontSource %>**/*.{eot,svg,ttf,woff,woff2}'
					],
					tasks: [
						'syncDirectory:fonts',
						'notify:fonts'
					]
				},
				imgSync: {
					files: [
						'<%= config.paths.imgSource %>**/*.{bmp,webp}'
					],
					tasks: [
						'syncDirectory:images',
						'notify:images'
					]
				},
				viewLoad: {
					files: [
						'<%= config.paths.source %>**/views/load/**/*.html'
					],
					tasks: [
						'loadViews',
						'uglify:core',
						'concat:script',
						'notify:script'
					]
				},
				viewMake: {
					files: [
						'<%= config.paths.source %>**/views/**/*.html'
					],
					tasks: [
						'makeViews'
					]
				},
				assetRemove: {
					files: [
						'<%= config.paths.source %>**/*.{css,less,js,gif,jpg,png,svg}'
					],
					tasks: [
						'rebuild'
					],
					options: {
						event: [
							'deleted'
						]
					}
				},
				project: {
					files: [
						'<%= config.path %>',
						'<%= config.paths.moduleSource %>*/module.json'
					],
					tasks: [
						'default',
						'notify:project'
					]
				}
			}
		});

		var tasks = [
				'grunt-contrib-concat',
				'grunt-contrib-imagemin',
				'grunt-contrib-less',
				'grunt-contrib-uglify',
				'grunt-contrib-watch',
				'grunt-newer'
			],
			taskRoot = fs.existsSync('node_modules/' + tasks[0]) ?
				'node_modules/' :
				'../';

		tasks.forEach(function(task) {
			grunt.loadTasks(taskRoot + task + '/tasks');
		});

		grunt.registerTask('default', [
			'init',
			'cleanup',
			'setup',
			'configStyle',
			'configScript',
			'configGenerator',
			'buildStyle',
			'buildModules',
			'loadViews',
			'makeViews',
			'uglify:core',
			'uglify:build',
			'concat:script',
			'uglify:lib',
			'imagemin',
			'syncDirectory:fonts',
			'syncDirectory:images'
		]);

		/**
		 * Rebuild
		 */
		grunt.registerTask('rebuild', [
			'cleanup',
			'setup',
			'buildStyle',
			'buildModules',
			'loadViews',
			'makeViews',
			'uglify:core',
			'uglify:build',
			'concat:script',
			'uglify:lib',
			'imagemin',
			'syncDirectory:fonts',
			'syncDirectory:images'
		]);

		/**
		 * Build, watch
		 */
		grunt.registerTask('local', [
			'default',
			'proxy',
			'sync',
			'watch'
		]);

		/**
		 * Build, watch, serve
		 */
		grunt.registerTask('static', [
			'default',
			'server',
			'sync',
			'watch'
		]);

		/**
		 * Generate
		 */
		grunt.registerTask('generate', [
			'init',
			'configGenerator'
		]);
	};
})();