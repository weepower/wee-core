const path = require('path');
const { logError, logSuccess } = require('${weeCore}/utils');

// Refer to https://github.com/tj/commander.js for documentation
// Properties defined below directly correspond to commander API
module.exports = {
	name: '${commandName}',
	description: '${commandName} description here',
	usage: '- wee ${commandName} [options]',
	options: [
		['-t, --test <name>', 'option with a value'],
		['-t2, --test2', 'option without a value']
	],
	action(config, options) {
		// Require test option be provided
		// if (typeof options.test !== 'string') {
		// 	logError('--test is required');
		// 	process.exit();
		// }

		logSuccess('${commandName} command successful');
	}
};