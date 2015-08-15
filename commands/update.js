(function() {
	'use strict';

	module.exports = function() {
		var fs = require('fs-extra'),
			https = require('https'),
			url = 'https://raw.githubusercontent.com/weepower/wee/master/package.json';

		https.get(url, function(response) {
			var json = '';

			response.on('data', function(chunk) {
				json += chunk;
			});

			response.on('end', function() {
				var data = JSON.parse(json),
					pkg = fs.readJsonSync('package.json', {
						encoding: 'utf8'
					});

				if (pkg.version.replace(/[^\d\.]/g, '') < data.version) {
					var current = pkg.version.split('.'),
						update = data.version.split('.'),
						type = 'patch';

					if (update[1] > current[1]) {
						type = 'minor update';
					}

					if (update[0] > current[0]) {
						type = 'major update';
					}

					Wee.notify({
						title: 'Update Available',
						message: 'Check the console for details'
					}, 'notice', false);

					console.log(
						'A new ' + type + ' is available to ' + data.version + ' from ' + pkg.version + '.\n' +
						'Read the release notes at https://github.com/weepower/wee/releases before updating.'
					);
				} else {
					console.log('You are running the latest version ' + pkg.version + '.');
				}
			});
		}).on('error', function() {
			Wee.notify({
				title: 'Update Error',
				message: 'Check the console for details'
			}, 'error', false);

			console.log('Error trying to access the repository at https://github.com/weepower/wee.');
		});
	};
})();