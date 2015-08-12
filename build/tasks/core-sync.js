/* global config, fs */

module.exports = function(grunt) {
	var glob = require('glob');

	grunt.registerTask('syncDirectory', function(task) {
		var corePath,
			destPath,
			modulePath,
			extensions,
			files;

		if (task === 'fonts') {
			corePath = config.paths.fontSource;
			destPath = config.paths.font;
			modulePath = 'fonts';
			extensions = 'eot,svg,ttf,woff,woff2';
		} else if (task === 'images') {
			corePath = config.paths.imgSource;
			destPath = config.paths.img;
			modulePath = 'img';
			extensions = 'bmp,webp';
		}

		if (corePath) {
			// Sync core files
			fs.removeSync(destPath);

			files = glob.sync(corePath + '**/*.{' + extensions + '}');

			files.forEach(function(file) {
				var name = file.replace(corePath, '');

				fs.copySync(file, destPath + name);
			});

			// Sync module files
			var directories = glob.sync(config.paths.modulesSource + modulePath);

			directories.forEach(function(directory) {
				fs.removeSync(directory);
			});

			files = glob.sync(
				config.paths.modulesSource +
				'*/' + modulePath + '/**/*.{' + extensions + '}'
			);

			files.forEach(function(file) {
				var name = file.replace(config.paths.modulesSource, '');

				fs.copySync(file, config.paths.modules + name);
			});

			if (task === 'images') {
				grunt.task.run('imagemin');
			}
		}
	});
};