(function() {
	'use strict';

	module.exports = function() {
		var https = require('https'),
			fs = require('fs-extra'),
			url = 'https://raw.githubusercontent.com/weepower/wee/master/package.json';

		https.get(url, function(response) {
			var json = '';

			response.on('data', function(chunk) {
				json += chunk;
			});

			response.on('end', function() {
				var data = JSON.parse(json),
					pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')),
					version = pkg.version;

				if (version.replace(/[^\d\.]/g, '') < data.version) {
					var current = version.split('.'),
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
					});

					console.log('A new ' + type + ' is available to ' + data.version + ' from ' + version + '.');
					console.log('Read the release notes at https://github.com/weepower/wee/releases before updating.');
				} else {
					console.log('You are running the latest version ' + version + '.');
				}
			});
		}).on('error', function() {
			console.log('Error trying to access the repository at https://github.com/weepower/wee.');
		});
	};
})();