(function() {
	'use strict';

	module.exports = function(config) {
		var cp = require('child_process'),
			task = 'default';

		if (config.options.length) {
			task = config.options[0];
		}

		cp.execSync('grunt ' + task + ' --b ' + __dirname + '/../ --gruntfile '
			+ __dirname + '/../Gruntfile.js', {
			stdio: [0, 1, 2]
		});
	};
})();