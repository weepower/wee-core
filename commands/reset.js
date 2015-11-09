(function() {
	'use strict';

	module.exports = function(config) {
		var fs = require('fs-extra'),
			path = require('path'),
			files = [
				'LICENSE',
				'README.md',
				'source/modules/welcome'
			];

		files.forEach(function(file) {
			fs.remove(path.join(config.rootPath, file));
		});

		Wee.notify({
			title: 'Project Reset',
			message: 'Sample project files have been removed'
		});
	};
})();