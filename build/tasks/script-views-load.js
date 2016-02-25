/* global config, fs */

module.exports = function(grunt) {
	var glob = require('glob');

	grunt.registerTask('loadViews', function() {
		// Find core view templates
		var matches = glob.sync(config.paths.viewSource + 'load/**/*.html'),
			data = {},
			moduleData = {};

		if (matches.length) {
			matches.forEach(function(view) {
				var key = view.replace(config.paths.viewSource + 'load/', '')
					.replace('/', '.').slice(0, -5);

				data[key] = fs.readFileSync(view, 'utf8')
					.replace(/\s*\n+\t*/g, '');
			});
		}

		// Find module view templates
		config.modules.forEach(function(name) {
			var autoload = config.autoload.indexOf(name) !== -1;

			if (autoload) {
				// Autoloading, so point to the main data object
				moduleData = data;
			}

			var root = config.paths.moduleSource + name;
			matches = glob.sync(root + '/core/js/views/load/**/*.html');

			if (matches.length) {
				matches.forEach(function(view) {
					var key = name + '.' +
						view.replace(root + '/core/js/views/load/', '')
							.replace('/', '.').slice(0, -5);

					moduleData[key] = fs.readFileSync(view, 'utf8')
						.replace(/(}}|>)\n+\s*({{|<)/g, '$1$2')
						.replace(/\s\s*/g, ' ')
						.replace(/({{|<)\s*/g, '$1')
						.replace(/\s*(}}|>)/g, '$1');
				});
			}

			if (! autoload && Object.keys(moduleData).length) {
				// JSON encode and create module view temp file
				fs.writeFileSync(
					config.paths.temp + 'moduleView-' + name + '.js',
					'Wee.view.addView(' + JSON.stringify(moduleData) + ');'
				);

				// Trigger the module build
				grunt.task.run('uglify:' + name);
			}
		});

		if (Object.keys(data).length) {
			// JSON encode and inject templates
			fs.writeFileSync(
				config.paths.temp + 'views.js',
				'Wee.view.addView(' + JSON.stringify(data) + ');'
			);
		}
	});
};