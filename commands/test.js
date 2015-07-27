/* global __dirname */

(function() {
	'use strict';

	var exec = require('child_process').exec;

	exec(
		__dirname + '/../node_modules/.bin/intern-runner config=source/js/tests/config.js',
		function(error, stdout, stderr) {
			if (error) {
				console.log(error);
			} else {
				console.log(stdout);
			}
		}
	);
})();