/* global browserSync, config, path, project, reloadPaths, server */

module.exports = function(grunt) {
	grunt.registerTask('sync', function() {
		var serverConfig = project.server,
			reloadConfig = serverConfig.reload;

		// Configure browser reloading
		if (reloadConfig.enable === true) {
			var reloadWatch = reloadConfig.watch,
				reloadExt = reloadWatch.extensions.join();

			if (reloadWatch.extensions.length > 1) {
				reloadExt = '{' + reloadExt + '}';
			}

			// Add user-defined paths
			reloadWatch.paths.forEach(function(file) {
				reloadPaths.push(
					path.join('../../', file, '**/*.' + reloadExt)
				);

				// TODO: Remove when dependency issue is resolved
				reloadPaths.unshift(
					path.join('../../', file, '*/*.' + reloadExt)
				);
			});

			// Add root to watchlist
			if (reloadWatch.root === true) {
				reloadPaths.unshift(
					path.join(config.paths.root, '**/*.' + reloadExt)
				);

				// TODO: Remove when dependency issue is resolved
				reloadPaths.unshift(
					path.join(config.paths.root, '*.' + reloadExt)
				);
			}

			// Bind BrowserSync watchlist
			reloadPaths.unshift(
				path.join(
					config.paths.assets,
					'**/*.{css,js,gif,jpg,png,svg,webp,woff}'
				)
			);

			server.files = reloadPaths;
		}

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