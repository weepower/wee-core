/* global config, path */

module.exports = function(grunt) {
	grunt.registerTask('runValidation', function() {
		var assets = grunt.file.expand({
				cwd: config.paths.source,
				filter: function(src) {
					return src.indexOf('/polyfill') === -1 &&
						src.indexOf('.min.js') === -1 &&
						src.indexOf('/vendor') === -1;
				}
			}, '**/*.js');

		// Validate assets
		assets.forEach(function(assetPath) {
			var asset = path.join(config.paths.source, assetPath);
			Wee.validate(config, grunt, asset);
		});
	});
};