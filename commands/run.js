const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const fs = require('fs-extra');
const utils = require('../utils');

module.exports = {
	name: 'run',
	description: 'Run development server',
	usage: '- wee run [options]',
	options: [
		['-l, --local', 'wrap proxy around local dev domain'],
		['-s, --static', 'serve static files']
	],
	action(config, options) {
		let project = config.project,
			projectUpdated = false;

		if (options.local) {
			if (! project.server.proxy) {
				utils.logError('Set proxy domain in wee.json');
				process.exit();
			}

			project.server.static = false;
			projectUpdated = true;
		}

		if (options.static && ! project.server.static) {
			project.server.static = true;
			projectUpdated = true;
		}

		// Update wee.json
		if (projectUpdated) {
			fs.writeJsonSync(config.rootPath + '/wee.json', project);
		}

		// Execute npm run
		let child = spawn('npm', ['start', '--ansi'], {
			cwd: config.rootPath,
			stdio: 'inherit'
		});

		child.on('error', data => {
			utils.logError(data);
		});
	}
};