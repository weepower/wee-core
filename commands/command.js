const fs = require('fs-extra');
const path = require('path');
const { paths, logError, logSuccess, fileFormat } = require('../utils');

module.exports = {
	name: 'command',
	description: 'create new cli command',
	usage: '- wee command [options]',
	options: [
		['-n, --name <command-name>', 'name of command']
	],
	action(config, options) {
		const fileName = options.name;
		const commandName = fileName.split('-').map((word, i) => {
			return i ? word.substr(0, 1).toUpperCase() + word.substr(1) : word;
		}).join('');
		const commandPath = paths.project.commands;

		if (typeof commandName !== 'string') {
			logError('--name is required');
			process.exit();
		}

		// Check for command existence
		if (fs.existsSync(`${commandPath}/${fileName}.js`)) {
			logError(`command named "${fileName}" already exists`);
			process.exit();
		}

		const weeCore = path.relative(path.resolve(commandPath), paths.root);
		const commandTemplate = eval('`' + fs.readFileSync(`${paths.commands}/helpers/command-template.js`) + '`');

		fs.writeFileSync(`${commandPath}/${fileName}.js`, commandTemplate);

		logSuccess('Command created successfully');
	}
};