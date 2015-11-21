/* global process */

(function() {
	'use strict';

	module.exports = function(config) {
		var glob = require('glob'),
			path = require('path'),
			files = glob.sync('**/*.js', {
				cwd: config.project.paths.source,
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
				path.join(config.project.paths.source, file)
			);
		});

		process.exit();
	};
})();