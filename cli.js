/* global global, process */

(function() {
	'use strict';

	global.chalk = require('chalk');
	global.Wee = require('./js/wee').Wee;

	module.exports = function(rootPath) {
		var fs = require('fs-extra'),
			glob = require('glob'),
			path = require('path'),
			keywords = process.argv.slice(2);

		require('./utils');

		if (keywords.length) {
			var args = {},
				split = keywords[0].split(':'),
				options = split.slice(1);

			keywords.slice(1).forEach(function(arg) {
				if (arg.slice(0, 2) == '--') {
					var segs = arg.slice(2).split('=');
					args[segs[0]] = segs.length > 1 ? segs[1] : '';
				}
			});

			var configPath = path.join(rootPath, args.config || 'wee.json'),
				project = JSON.parse(fs.readFileSync(configPath, 'utf8')),
				commandPaths = [
					'node_modules/wee-core/commands/',
					path.join(project.paths.source, 'commands/')
				],
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

			var command = commands[split[0]];

			if (command) {
				delete args.config;

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

				process.exit();
			}
		} else {
			Wee.notify({
				title: 'Command Error',
				message: 'Command option is required'
			}, 'error');

			process.exit();
		}
	};
})();