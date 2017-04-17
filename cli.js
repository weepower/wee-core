/* global global, process */

const fs = require('fs-extra'),
	glob = require('glob'),
	path = require('path'),
	utils = require('./utils'),

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

				commands[name] = require(file);
			});
		});

		return commands;
	};

global.chalk = require('chalk');

module.exports = function(rootPath, program) {
	var keywords = process.argv.slice(2),
		keyCount = keywords.length,
		args = getArgs(
			keyCount === 1 ?
				keywords.slice(0) :
				keywords.slice(1)
		),
		configPath = path.join(rootPath, args.config || 'wee.json'),
		project = JSON.parse(fs.readFileSync(configPath, 'utf8')),
		commands = registerCommands(rootPath, [
			'node_modules/wee-core/commands/',
			path.join(project.paths.source, 'commands/')
		]);

	// Register commands
	Object.keys(commands).forEach(name => {
		let command = commands[name];

		// TODO: Remove once all default commands are updated
		if (! command.name) {
			return;
		}

		let result = program.command(command.name)
			.usage(command.usage || command.name)
			.description(command.description || '');

		if (command.options.length) {
			command.options.forEach(option => {
				result.option(option[0], option[1], option[2] || {});
			});
		}

		result.action(command.action.bind(null, {rootPath: rootPath, project: project}));
	});
};