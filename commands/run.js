/* global __dirname */

(function() {
	'use strict';

	module.exports = function(config) {
		var cp = require('child_process'),
			task = 'default',
			args = '';

		if (config.options.length) {
			task = config.options[0];
		}

		Object.keys(config.args).forEach(function(key) {
			args += ' --' + key + '=' + config.args[key];
		});

		cp.execSync('grunt ' + task + ' --b ' + __dirname +
			'/../ --gruntfile ' + __dirname + '/../Gruntfile.js' + args, {
			stdio: [0, 1, 2]
		});
	};
})();