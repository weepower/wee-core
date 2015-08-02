/* global global, process */

(function() {
	'use strict';

	global.Wee = require('./script/wee').Wee;
	require('./build/utils');

	var commands = {
			clean: function(config) {
				require('./commands/clean.js')(config);
			},
			make: function(config) {
				require('./commands/make.js')(config);
			},
			test: function(config) {
				require('./commands/test.js')(config);
			}
		},
		keywords = process.argv.slice(2);

	if (keywords.length) {
		var split = keywords[0].split(':'),
			command = commands[split[0]],
			options = split.slice(1),
			args = {};

		if (command) {
			keywords.slice(1).forEach(function(arg) {
				if (arg.slice(0, 2) == '--') {
					var segs = arg.slice(2).split('=');

					args[segs[0]] = segs.length > 1 ?
						segs[1] :
						'';
				}
			});

			command({
				options: options,
				args: args
			});
		} else {
			Wee.notify({
				title: 'Command Error',
				message: 'Command not available'
			}, 'error');
		}
	} else {
		Wee.notify({
			title: 'Command Error',
			message: 'Command option is required'
		}, 'error');
	}
})();