/* global fs, path, project */

module.exports = function(grunt) {
	grunt.registerTask('configGenerator', function() {
		if (project.generator.enable === true) {
			// Import view library
			require('../../js/wee.view');

			var build = project.generator.build;

			if (build && build.length) {
				build = build.map(function(file) {
					return path.join('../../', file);
				});
			}

			// Loop through static site config files
			grunt.file.expand(build).forEach(function(src, i) {
				var json = fs.readJsonSync(src);

				// Watch for config updates
				if (json.config.watch === true) {
					grunt.config.set('watch.initGenerator-' + i, {
						files: src,
						tasks: 'initGenerator:' + i
					});
				}

				// Initialize static site
				grunt.task.run('initGenerator:' + i);
			});
		}
	});
};