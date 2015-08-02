/* global config, fs */

module.exports = function(grunt) {
	grunt.registerTask('syncDirectory', function(task) {
		if (task === 'fonts') {
			var glob = require('glob'),
				files;

			// Sync core fonts
			fs.removeSync(config.paths.font);

			files = glob.sync(config.paths.fontSource + '**/*.{eot,svg,ttf,woff,woff2}');

			files.forEach(function(file) {
				var name = file.replace(config.paths.fontSource, '');

				fs.copySync(file, config.paths.font + name);
			});

			// Sync module fonts
			var directories = glob.sync(config.paths.modulesSource + 'fonts');

			directories.forEach(function(directory) {
				fs.removeSync(directory);
			});

			files = glob.sync(config.paths.modulesSource + '*/fonts/**/*.{eot,svg,ttf,woff,woff2}');

			files.forEach(function(file) {
				var name = file.replace(config.paths.modulesSource, '');

				fs.copySync(file, config.paths.modules + name);
			});
		}
	});
};