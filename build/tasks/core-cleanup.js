/* global config, fs */

module.exports = function(grunt) {
	grunt.registerTask('cleanup', function() {
		// Remove temporary files
		fs.emptyDirSync(config.paths.temp);

		// Remove all public assets
		fs.removeSync(config.paths.css);
		fs.removeSync(config.paths.js);
		fs.removeSync(config.paths.img);
		fs.removeSync(config.paths.modules);
	});
};