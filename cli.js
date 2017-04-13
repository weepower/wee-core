/* global global, process */

(function() {
	'use strict';

	var fs = require('fs-extra'),
		glob = require('glob'),
		path = require('path'),
		notify = require('./notify'),

		/**
		 * Parse arguments from command array
		 *
		 * @param {Array} keywords
		 * @returns {object}
		 */
		getArgs = function(keywords) {
			var args = {};

			keywords.forEach(function(arg) {
				if (arg.slice(0, 2) == '--') {
					var segs = arg.slice(2).split('=');
					args[segs[0]] = segs.length > 1 ? segs[1] : '';
				}
			});

			return args;
		},

		/**
		 * Register all available commands
		 *
		 * @param {string} rootPath
		 * @param {Array} paths
		 * @returns {object}
		 */
		registerCommands = function(rootPath, paths) {
			var commands = {};

			paths.forEach(function(commandPath) {
				var files = glob.sync(commandPath + '*.js');

				files.forEach(function(file) {
					var name = path.basename(file, '.js');
					file = path.join(rootPath, file);

					commands[name] = function(config) {
						require(file)(config);
					};
				});
			});

			return commands;
		};

	global.chalk = require('chalk');

	module.exports = function(rootPath) {
		var keywords = process.argv.slice(2),
			keyCount = keywords.length,
			args = getArgs(
				keyCount === 1 ?
					keywords.slice(0) :
					keywords.slice(1)
			),
			configPath = path.join(rootPath, args.config || 'wee.json'),
			project = JSON.parse(fs.readFileSync(configPath, 'utf8')),
			cmd = project.defaultCommand || 'run';

		// Process fallback command
		if (keyCount > 1 || (keyCount && ! Object.keys(args).length)) {
			cmd = keywords[0];
		}

		var parts = cmd.split(':'),
			options = parts.slice(1),
			commands = registerCommands(rootPath, [
				'node_modules/wee-core/commands/',
				path.join(project.paths.source, 'commands/')
			]),
			command = commands[parts[0]];

		if (command) {
			delete args.config;

			command({
				options: options,
				args: args,
				rootPath: rootPath,
				project: project
			});
		} else {
			notify({
				title: 'Command Error',
				message: 'Command not found'
			}, 'error');

			process.exit();
		}
	};
})();