/* global config, fs, path */

module.exports = function(grunt) {
	var glob = require('glob');

	grunt.registerTask('makeViews', function(task) {
		var data = {};

		// Find core view templates
		var matches = glob.sync(config.paths.viewSource + '**/*.html', {
			ignore: config.paths.viewSource + 'load/**/*'
		});

		if (matches.length) {
			matches.forEach(function(view) {
				var rel = view.replace(config.paths.viewSource, ''),
					dir = path.dirname(rel),
					key = rel.replace('/', '.').slice(0, -5),
					file = key.split('.').pop(),
					script = fs.readFileSync(view, 'utf8')
						.replace(/\s*\n+\t*/g, '');

				fs.outputFileSync(
					config.paths.js + 'views/' + dir + '/' + file + '.min.js',
					'Wee.view.addView("' + key + '",' +
						JSON.stringify(script) + ');'
				);
			});
		}

		// Find module view templates
		config.modules.forEach(function(name) {
			var root = config.paths.moduleSource + name;
			matches = glob.sync(root + '/core/js/views/**/*.html', {
				ignore: root + '/core/js/views/load/**/*'
			});

			if (matches.length) {
				matches.forEach(function(view) {
					var rel = view.replace(root + '/core/js/views/', ''),
						dir = path.dirname(rel),
						key = rel.replace('/', '.').slice(0, -5),
						file = key.split('.').pop(),
						script = fs.readFileSync(view, 'utf8')
							.replace(/\s*\n+\t*/g, '');

					fs.outputFileSync(
						config.paths.js + name + '/views/' + dir + '/' + file + '.min.js',
						'Wee.view.addView("' + name + '.' + key + '",' +
							JSON.stringify(script) + ');'
					);
				});
			}
		});
	});
};