/* global config, fs, module, project */

module.exports = function(grunt) {
	grunt.registerTask('cleanup', function() {
		var remFiles = function(dir) {
			fs.readdirSync(dir).forEach(function(file) {
				var loc = dir + file;

				if (file.charAt(0) !== '.' && fs.lstatSync(loc).isFile()) {
					fs.unlinkSync(loc);
				}
			});
		}

		// Remove temporary files
		remFiles(config.paths.temp);

		// Remove compiled assets
		remFiles(config.paths.css);
		remFiles(config.paths.js);

		if (project.script.sourceMaps === true) {
			// Create source map directory if needed
			if (! fs.lstatSync(config.paths.maps).isDirectory()) {
				fs.mkdirSync(config.paths.maps);
			}

			// Remove source maps
			remFiles(config.paths.maps);
		}
	});
};