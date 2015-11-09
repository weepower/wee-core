/* global config, fs, path */

module.exports = function(grunt) {
	var glob = require('glob');

	grunt.registerTask('loadViews', function(task) {
		// Find core view templates
		var matches = glob.sync(config.paths.jsSource + 'views/load/*.html'),
			views = [];

		if (matches.length) {
			views[''] = matches;
		}

		// Search for module view templates
		config.modules.forEach(function(name) {
			matches = glob.sync(
				config.paths.modulesSource + name + '/core/js/views/load/*.html'
			);

			if (matches.length) {
				views[name] = matches;
			}
		});

		// Process template matches
		var keys = Object.keys(views);

		if (keys.length) {
			var data = {};

			// Remove whitespace from template
			keys.forEach(function(key) {
				views[key].forEach(function(view) {
					var name = (key == '' ? '' : key + '.') +
						path.basename(view, '.html');

					data[name] = fs.readFileSync(view, 'utf8')
						.replace(/\s*\n+\t*/g, '');
				});
			});

			// JSON encode and inject templates
			var script = 'Wee.view.addView(' + JSON.stringify(data) + ');';

			fs.writeFileSync(config.paths.temp + 'views.js', script);
		}
	});
};