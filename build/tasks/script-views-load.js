/* global config, fs */

module.exports = function(grunt) {
	var glob = require('glob');

	grunt.registerTask('loadViews', function() {
		// Find core view templates
		var matches = glob.sync(config.paths.viewSource + 'load/**/*.html'),
			data = {};

		if (matches.length) {
			matches.forEach(function(view) {
				var key = view.replace(config.paths.viewSource + 'load/', '')
					.replace('/', '.').slice(0, -5);

				data[key] = fs.readFileSync(view, 'utf8')
					.replace(/\s*\n+\t*/g, '');
			});
		}

		// Find module view templates
		for (var name in config.modules) {
			var autoload = config.modules[name].autoload,
				namespace = config.modules[name].namespace,
				moduleData = autoload ? data : {};

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
					namespace + '.view.addView(' + JSON.stringify(moduleData) + ');'
				);

				// Trigger the module build
				config.modules[name].tasks.forEach(function(task) {
					grunt.task.run(task);
				});
			}
		};

		if (Object.keys(data).length) {
			// JSON encode and inject templates
			fs.writeFileSync(
				config.paths.temp + 'views.js',
				'Wee.view.addView(' + JSON.stringify(data) + ');'
			);
		}
	});
};