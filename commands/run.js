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
		// TODO: run local or static - set properties in bs-config and call npm run
		// TODO: Look at https://dzone.com/articles/execute-unix-command-nodejs for exec example
		let project = config.project,
			projectUpdated = false;

		if (options.local) {
			if (! project.server.proxy) {
				utils.notify({icon: 'error', message: 'Set proxy domain in wee.json'}, 'error');
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
			console.log(data);
		});

		child.on('close', (code) => {
			console.log(`child process exited with code ${code}`);
		});
	}
};