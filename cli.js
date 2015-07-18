/* global global */

(function() {
	'use strict';

	global.Wee = require('./script/wee').Wee;
	require('./build/utils');

	global.arguments = {};

	var commands = {
		clean: function() {
			require('./commands/clean.js');
		},
		test: function() {
			require('./commands/test.js');
		},
		make: function() {
			require('./commands/make.js');
		}
	};

	var keywords = process.argv.slice(2),
		split = keywords[0].split(':'),
		command = commands[split[0]];

	global.options = split.slice(1);

	if (command) {
		keywords.slice(1).forEach(function(arg) {
			if (arg.slice(0, 2) == '--') {
				var segs = arg.slice(2).split('=');

				global.arguments[segs[0]] = segs.length > 1 ? segs[1] : '';
			}
		});

		command();
	}
})();