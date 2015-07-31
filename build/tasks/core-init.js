/* global config, configPath, global, path */

module.exports = function(grunt) {
	grunt.registerTask('init', function() {
		// Reset config object and set core paths
		var project = grunt.file.readJSON(configPath),
			rootPath = project.paths.root,
			sourcePath = project.paths.source,
			assetPath = path.normalize(
				rootPath !== '' ?
					rootPath + '/' + project.paths.assets :
					project.assets
			) + '/',
			tempPath = 'node_modules/wee-core/temp/';

		global.project = project;

		global.config = {
			path: configPath,
			paths: {
				source: sourcePath,
				assets: assetPath,

				cssSource: sourcePath + '/css/',
				css: assetPath + 'css/',
				cssMaps: assetPath + 'js/maps/',

				jsSource: sourcePath + '/js/',
				js: assetPath + 'js/',
				jsMaps: assetPath + 'js/maps/',

				fontSource: sourcePath + '/fonts/',
				font: assetPath + 'fonts/',

				imgSource: sourcePath + '/img/',
				img: assetPath + 'img/',

				modulesSource: sourcePath + '/modules/',
				modules: assetPath + 'modules/',

				wee: 'node_modules/wee-core/',
				weeTemp: tempPath + 'wee.less',

				root: './' + rootPath,
				temp: tempPath
			},
			script: {
				files: []
			},
			style: {
				concat: [],
				imports: [],
				tasks: [],
				print: '',
				responsive: ''
			}
		};

		// Set Grunt configuration
		grunt.config.set('config', config);
	});
};