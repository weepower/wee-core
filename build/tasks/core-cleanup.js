/* global config, fs, module, project, require */

module.exports = function(grunt) {
	grunt.registerTask('cleanup', function() {
		// Remove temporary files
		fs.emptyDirSync(config.paths.temp);

		// Remove compiled assets
		fs.emptyDirSync(config.paths.css);
		fs.emptyDirSync(config.paths.js);

		if (project.script.sourceMaps === true) {
			// Create source map directory if needed
			fs.ensureDirSync(config.paths.maps);

			// Remove source maps
			fs.emptyDirSync(config.paths.maps);
		}
	});
};