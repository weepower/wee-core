const chalk = require('chalk');
const fs = require('fs-extra');
const notifier = require('node-notifier');
const path = require('path');
const process = require('process');
const basePath = __filename.split('/').slice(0, -1).join('/');
const projectPath = process.env.PWD;
const projectSourcePath = `${projectPath}/source`;

module.exports = {
	/**
	 * Prep a string to become file/folder name
	 *
	 * @param  {string} string
	 * @return {string}
	 */
	fileFormat(string) {
		return string.trim().replace(/\s+|_/g, '-').toLowerCase();
	},

	/**
	 * Notify through a natively available notification option
	 *
	 * @param {object} options
	 * @param {string} [type=notice]
	 * @param {boolean} [log=true]
	 */
	notify(options, type, log) {
		options.icon = __dirname + '/images/' + (type || 'notice') + '.png';
		options.group = 1;

		if (type == 'error' || type == 'fail') {
			options.group = 2;
			options.sound = true;
			options.wait = true;
		}

		if (log !== false) {
			console.log(options.message);
		}

		notifier.notify(options);

		if (type == 'fail') {
			process.exit(1);
		}
	},

	/**
	 * Log an error to the console
	 *
	 * @param {string} message
	 * @param {string} [details]
	 */
	logError(message, details) {
		console.log(
			chalk.red.bold('error: ') +
			message + ' ' + (details || '')
		);
	},

	/**
	 * Log a success message to the console
	 *
	 * @param  {string} message
	 */
	logSuccess(message) {
		console.log(chalk.green(message));
	},

	logList(name, desc) {
		console.log(
			`\n${chalk.green.bgBlack.bold(name)} - ${chalk.white.bgBlack(desc)}`
		);
	},

	paths: {
		root: basePath,
		styles: `${basePath}/styles`,
		commands: `${basePath}/commands`,
		project: {
			root: projectPath,
			source: projectSourcePath,
			styles: `${projectSourcePath}/styles`,
			scripts: `${projectSourcePath}/scripts`,
			components: `${projectSourcePath}/components`
		},
		tests: {
			root: `${basePath}/tests`,
			scripts: `${basePath}/tests/scripts`
		}
	},

	trimRight(str) {
		return str.replace(/\s+$/, '');
	},

	stripStars(line) {
	let re = /^(?:\s*[\*]{1,2}\s)/;
		return this.trimRight(line.replace(re, ''));
	}
};