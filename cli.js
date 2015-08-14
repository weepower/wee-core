/* global global, process */

(function() {
	'use strict';

	module.exports = function(rootPath) {
		var fs = require('fs-extra'),
			glob = require('glob'),
			path = require('path');

		global.Wee = require('./script/wee').Wee;

		require('./utils');

		var commandPaths = [
				'node_modules/wee-core/commands/',
				'source/commands/'
			],
			keywords = process.argv.slice(2),
			commands = {};

		// Register commands
		commandPaths.forEach(function(commandPath) {
			var files = glob.sync(commandPath + '*.js');

			files.forEach(function(file) {
				var name = path.basename(file, '.js');
				file = path.join(rootPath, file);

				commands[name] = function(config) {
					require(file)(config);
				};
			});
		});

		// Execute command
		if (keywords.length) {
			var split = keywords[0].split(':'),
				command = commands[split[0]],
				options = split.slice(1),
				args = {};

			if (command) {
				keywords.slice(1).forEach(function(arg) {
					if (arg.slice(0, 2) == '--') {
						var segs = arg.slice(2).split('=');

						args[segs[0]] = segs.length > 1 ? segs[1] : '';
					}
				});

				// Read project configuration and remove from arguments
				var configPath = path.join(rootPath, args['config'] || 'wee.json'),
					project = JSON.parse(fs.readFileSync(configPath, 'utf8'));

				delete args['config'];

				command({
					options: options,
					args: args,
					rootPath: rootPath,
					project: project
				});
			} else {
				Wee.notify({
					title: 'Command Error',
					message: 'Command not found'
				}, 'error');
			}
		} else {
			Wee.notify({
				title: 'Command Error',
				message: 'Command option is required'
			}, 'error');
		}
	};
})();