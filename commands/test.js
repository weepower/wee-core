/* global chalk */

(function() {
	'use strict';

	function getOptions(configPath, suites) {
		var options = [
			'config=' + configPath
		];

		if (suites) {
			options.push(suites);
		}

		return options;
	}

	module.exports = function(config) {
		var spawn = require('child_process').spawn,
			path = require('path'),
			core = config.options[0] === 'core',
			runnerPath = core ?
				'./node_modules/.bin/intern-runner' :
				config.rootPath + '/node_modules/.bin/intern-runner',
			configPath = path.join(
				core ? '' : config.project.paths.source,
				'js/tests/config.js'
			),
			port = config.project.server.port,
			suites = config.args.suites ? 'suites=' + config.args.suites : null,
			child;

		if (core) {
			process.chdir('node_modules/wee-core');
		}

		child = spawn(runnerPath, getOptions(configPath, suites));

		child.stdout.on('data', function(data) {
			process.stdout.write(data.toString());
		});

		child.stderr.on('data', function(data) {
			console.log(data.toString());
		});

		child.on('error', function(data) {
			console.log(data.toString());
			var testPath = path.join(
				config.project.paths.source,
				'/js/tests/config'
				),
				protocol = config.project.server.tasks['static'].https ? 'https' : 'http';

			Wee.notify({
				title: 'Test Error',
				message: 'Check the console for details'
			}, 'error', false);

			console.log(
				chalk.bgRed('For automated testing make sure that ChromeDriver is installed and running.')
			);
			console.log('Execute "chromedriver --port=4444 --url-base=wd/hub" to start the process.\n');

			console.log(
				chalk.bgRed('To view the browser client run "wee run:static" and open the following:')
			);
			console.log(protocol + '://localhost:' + port + '/$root/node_modules/intern/client.html?config=' + testPath + '&initialBaseUrl=/$root');
		});

		child.on('close', function(code) {
			console.log('Exited with code ' + code);
		})
	};
})();