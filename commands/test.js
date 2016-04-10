/* global chalk */

(function() {
	'use strict';

	module.exports = function(config) {
		var exec = require('child_process').exec,
			path = require('path'),
			runnerPath = path.join(
				config.rootPath,
				'node_modules/.bin/intern-runner'
			),
			configPath = path.join(
				config.project.paths.source,
				'js/tests/config.js'
			),
			port = config.project.server.port;

		exec(
			runnerPath + ' config=' + configPath,
			function(error, stdout) {
				if (error) {
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
				} else {
					console.log(stdout);
				}
			}
		);
	};
})();