/* global config, fs */

module.exports = function(grunt) {
	grunt.registerTask('syncDirectory', function(task) {
		if (task === 'fonts') {
			var glob = require('glob');

			// Remove existing fonts
			fs.removeSync(config.paths.font);

			var files = glob.sync(config.paths.fontSource + '**/*.{eot,svg,ttf,woff,woff2}');

			files.forEach(function(file) {
				var name = file.replace(config.paths.fontSource, '');

				fs.copySync(file, config.paths.font + name);
			});
		}
	});
};