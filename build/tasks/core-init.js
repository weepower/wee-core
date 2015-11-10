/* global config, fs, global, path */

module.exports = function(grunt) {
	grunt.registerTask('init', function() {
		// Reset config object and set core paths
		var project = fs.readJsonSync(config.configPath),
			rootPath = config.rootPath + project.paths.root,
			sourcePath = config.rootPath + project.paths.source + '/',
			assetPath = path.normalize(
				rootPath !== '' ?
				rootPath + '/' + project.paths.assets :
					project.assets
			) + '/',
			tempPath = 'temp/';

		global.project = project;

		global.config = Wee.$extend(global.config, {
			path: config.configPath,
			paths: {
				source: sourcePath,
				assets: assetPath,

				cssSource: sourcePath + 'css/',
				css: assetPath + 'css/',

				jsSource: sourcePath + 'js/',
				js: assetPath + 'js/',
				jsMaps: assetPath + 'js/maps/',

				viewSource: sourcePath + 'js/views/',
				view: assetPath + 'js/views/',

				fontSource: sourcePath + 'fonts/',
				font: assetPath + 'fonts/',

				imgSource: sourcePath + 'img/',
				img: assetPath + 'img/',

				moduleSource: sourcePath + 'modules/',
				module: assetPath + 'modules/',

				wee: '',
				weeTemp: tempPath + 'wee.less',

				root: rootPath,
				temp: tempPath
			},
			script: {
				build: [],
				core: []
			},
			style: {
				concat: [],
				coreImports: [],
				imports: [],
				tasks: [],
				print: '',
				responsive: ''
			},
			modules: []
		});

		// Set Grunt configuration
		grunt.config.set('config', config);
	});
};