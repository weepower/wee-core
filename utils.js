var chalk = require('chalk'),
	fs = require('fs-extra'),
	notifier = require('node-notifier'),
	path = require('path');

module.exports = {
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
	 * @param {string} position
	 * @param {string} message
	 * @param {string} [details]
	 */
	logError(position, message, details) {
		console.log(
			chalk.bgBlack.bold('[' + position + '] ') +
			message + ' ' + (details || '')
		);
	}
};