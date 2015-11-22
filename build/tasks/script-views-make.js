/* global config, fs, path */

module.exports = function(grunt) {
	var glob = require('glob');

	grunt.registerTask('makeViews', function() {
		// Remove core files
		fs.removeSync(config.paths.view);

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
					config.paths.view + dir + '/' + file + '.html',
					script
				);
			});
		}

		// Find module view templates
		config.modules.forEach(function(name) {
			var root = config.paths.moduleSource + name;
			matches = glob.sync(root + '/core/js/views/**/*.html', {
				ignore: root + '/core/js/views/load/**/*'
			});

			// Remove module files
			fs.removeSync(config.paths.module + name + '/views');

			if (matches.length) {
				matches.forEach(function(view) {
					var rel = view.replace(root + '/core/js/views/', ''),
						dir = path.dirname(rel),
						key = rel.replace('/', '.').slice(0, -5),
						file = key.split('.').pop(),
						script = fs.readFileSync(view, 'utf8')
							.replace(/\s*\n+\t*/g, '');

					fs.outputFileSync(
						config.paths.module + name + '/views/' + dir + '/' + file + '.html',
						script
					);
				});
			}
		});
	});
};