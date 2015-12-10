/* global config, fs */

module.exports = function(grunt) {
	var glob = require('glob');

	grunt.registerTask('loadViews', function() {
		var data = {};

		// Find core view templates
		var matches = glob.sync(config.paths.viewSource + 'load/**/*.html');

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
			var root = config.paths.moduleSource + name;
			matches = glob.sync(root + '/core/js/views/load/**/*.html');

			if (matches.length) {
				matches.forEach(function(view) {
					var key = name + '.' +
						view.replace(root + '/core/js/views/load/', '')
							.replace('/', '.').slice(0, -5);

					data[key] = fs.readFileSync(view, 'utf8')
						.replace(/[\s][\s]*/g, ' ')
						.replace(/[\s]*>[\s]*/g, '>')
						.replace(/[\s]*<[\s]*/g, '<');
				});
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