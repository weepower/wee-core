/* global browserSync, config, project, reloadPaths, server */

module.exports = function(grunt) {
	grunt.registerTask('sync', function() {
		var serverConfig = project.server,
			reloadConfig = project.server.reload;

		// Configure browser reloading
		if (reloadConfig.enable === true) {
			var reloadWatch = reloadConfig.watch,
				reloadExtensions = reloadWatch.extensions.join();

			if (reloadWatch.extensions.length > 1) {
				reloadExtensions = '{' + reloadExtensions + '}';
			}

			// Add user-defined paths
			reloadWatch.paths.forEach(function(path) {
				reloadPaths.push(path + '/**/*.' + reloadExtensions);
			});

			// Add root to watchlist
			if (reloadWatch.root === true) {
				reloadPaths.unshift('../../' + config.paths.root + '/**/*.' + reloadExtensions);
			}

			// Bind BrowserSync watchlist
			reloadPaths.unshift(
				config.paths.assets +
					'**/*.{min.css,min.js,gif,jpg,png,svg,webp,woff}'
			);

			server.files = reloadPaths;
		}

		// Ghost mode
		if (serverConfig.ghostMode !== true) {
			server.ghostMode = serverConfig.ghostMode || false;
		}

		server.port = serverConfig.port;
		server.logPrefix = 'Wee';
		server.open = 'external';
		server.notify = false;

		server.ui = {
			port: serverConfig.port + 1,
			weinre: {
				port: serverConfig.port + 100
			}
		};

		browserSync(server);
	});
};