(function() {
	'use strict';

	module.exports = function(config) {
		var glob = require('glob'),
			path = require('path'),
			scriptPath = config.project.paths.source,
			files = glob.sync('**/*.js', {
				cwd: scriptPath,
				ignore: [
					'**/*.min.js',
					'**/polyfill/*',
					'**/vendor/*'
				]
			});

		files.forEach(function(file) {
			Wee.validate(
				config.rootPath,
				config.project,
				path.join(scriptPath, file)
			);
		});
	};
})();