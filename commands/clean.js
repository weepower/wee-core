(function() {
	'use strict';

	module.exports = function() {
		var fs = require('fs-extra'),
			paths = [
				'bower.json',
				'LICENSE',
				'README.md',
				'source/modules/welcome'
			];

		paths.forEach(function(path) {
			fs.remove(path);
		});
	};
})();