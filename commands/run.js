/* global __dirname */

(function() {
	'use strict';

	var gruntPath = __dirname + '/../Gruntfile.js',
		grunt = require('grunt'),
		build = require(gruntPath);

	module.exports = function(config) {
		var options = {
				b: __dirname,
				gruntfile: gruntPath
			},
			task = config.options.length ?
				config.options[0] :
				'default';

		// Pass through additional flags
		Object.keys(config.args).forEach(function(key) {
			var val = config.args[key];
			options[key] = val == '' ? true : val;
		});

		build(grunt);

		grunt.tasks([
			task
		], options);
	};
})();