/* global bs, config, path, project, reloadPaths, server */

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
			});

			// Add root to watchlist
			if (reloadWatch.root === true) {
				reloadPaths.unshift(
					path.join(config.paths.root, '**/*.' + reloadExt)
				);
			}

			// Bind BrowserSync watchlist
			reloadPaths.unshift(
				path.join(
					config.paths.assets,
					'**/*.{css,gif,jpg,js,png,svg,webp,woff}'
				)
			);

			server.files = reloadPaths;

			// Define exclusion patterns
			if (reloadConfig.ignore) {
				server.snippetOptions = {
					blacklist: reloadConfig.ignore
				};
			}
		}

		if (serverConfig.ghostMode !== true) {
			server.ghostMode = serverConfig.ghostMode || false;
		}

		// Override defaults
		server.logPrefix = 'Wee';
		server.logFileChanges = false;
		server.notify = false;
		server.open = 'external';
		server.port = serverConfig.port;

		server.ui = {
			port: serverConfig.port + 1,
			weinre: {
				port: serverConfig.port + 100
			}
		};

		bs.init(server);
	});
};