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

		// Ensure the temp directory exists
		fs.emptyDirSync(config.paths.temp);

		// Remove temporary files
		remFiles(config.paths.temp);

		// Remove compiled assets
		remFiles(config.paths.css);
		remFiles(config.paths.js);

		if (project.script.sourceMaps === true) {
			// Create source map directory if needed
			fs.ensureDirSync(config.paths.maps);

			// Remove source maps
			remFiles(config.paths.maps);
		}
	});
};