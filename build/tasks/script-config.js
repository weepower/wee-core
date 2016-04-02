/* global config, fs, path, project */

module.exports = function(grunt) {
	grunt.registerTask('configScript', function() {
		// Core scripts
		if (project.script.core.enable === true) {
			var features = project.script.core.features,
				weeScriptRoot = config.paths.wee + 'js/',
				globalScript = [],
				chained = [];

			config.script.core.push(weeScriptRoot + 'wee.js');

			// Set global data variables
			if (
				(project.data && Object.keys(project.data).length) ||
				(project.script.data && Object.keys(project.script.data).length)
			) {
				var configVars = Wee.$extend(
					project.data || {},
					project.script.data || {}
				);

				globalScript.push('Wee.$set("global", ' + JSON.stringify(configVars) + ');');
			}

			// Inject global script
			if (globalScript.length) {
				fs.writeFileSync(
					config.paths.temp + 'global.js',
					globalScript.join('')
				);
			}

			if (features.chain === true) {
				chained.push(weeScriptRoot + 'wee.chain.js');
			}

			if (features.animate === true) {
				config.script.core.push(weeScriptRoot + 'wee.animate.js');

				if (features.chain === true) {
					chained.push(weeScriptRoot + 'chain/wee.chain.animate.js');
				}
			}

			if (features.assets === true) {
				config.script.core.push(weeScriptRoot + 'wee.assets.js');
			}

			if (features.data === true) {
				config.script.core.push(weeScriptRoot + 'wee.data.js');
			}

			if (features.dom === true) {
				config.script.core.push(weeScriptRoot + 'wee.dom.js');

				if (features.chain === true) {
					chained.push(weeScriptRoot + 'chain/wee.chain.dom.js');
				}
			}

			if (features.events === true) {
				config.script.core.push(weeScriptRoot + 'wee.events.js');

				if (features.chain === true) {
					chained.push(weeScriptRoot + 'chain/wee.chain.events.js');
				}
			}

			if (features.history === true) {
				config.script.core.push(weeScriptRoot + 'wee.history.js');
			}

			if (features.routes === true) {
				config.script.core.push(weeScriptRoot + 'wee.routes.js');
			}

			if (features.screen === true) {
				config.script.core.push(weeScriptRoot + 'wee.screen.js');
			}

			if (features.touch === true) {
				config.script.core.push(weeScriptRoot + 'wee.touch.js');
			}

			if (features.view === true) {
				config.script.core.push(weeScriptRoot + 'wee.view.js');
				config.script.core.push(weeScriptRoot + 'wee.view.diff.js');

				if (features.chain === true) {
					chained.push(weeScriptRoot + 'chain/wee.chain.view.js');
				}
			}

			config.script.core = config.script.core.concat(chained);
		}

		// Build/vendor directory scripts
		config.script.build.push(config.paths.jsSource + 'build/vendor/**/*.js');

		// Custom/init.js file
		config.script.build.push(config.paths.jsSource + 'custom/init.js');

		// Remaining build directory scripts
		config.script.build.push(config.paths.jsSource + 'build/**/*.js');

		// Project.config file build files
		project.script.build.forEach(function(name) {
			config.script.build.push(Wee.buildPath(config.paths.jsSource, name));
		});

		// Custom/script.js file
		config.script.build.push(config.paths.jsSource + 'custom/script.js');

		// Compile custom
		for (var target in project.script.compile) {
			var taskName = target.replace(/\./g, '-') + '-script',
				sources = project.script.compile[target],
				src = [];

			if (sources instanceof Array) {
				for (var source in sources) {
					src.push(Wee.buildPath(config.paths.jsSource, sources[source]));
				}
			} else {
				src = Wee.buildPath(config.paths.jsSource, sources);
			}

			// Merge watch config
			grunt.config.set('watch.' + taskName, {
				files: src,
				tasks: [
					'uglify:' + taskName
				]
			});

			// Create uglify task
			grunt.config.set('uglify.' + taskName, {
				files: [{
					dest: Wee.buildPath(config.paths.js, target),
					src: src
				}]
			});

			// Run task
			grunt.task.run('uglify:' + taskName);
		}

		// Configure source maps
		if (project.script.sourceMaps === true) {
			grunt.config.set('uglify.core.options.sourceMap', true);
			grunt.config.set('uglify.core.options.sourceMapIncludeSources', true);
			grunt.config.set(
				'uglify.core.options.sourceMapName',
				path.join(config.paths.temp, 'core.js.map')
			);

			grunt.config.set('uglify.build.options.sourceMap', true);
			grunt.config.set('uglify.build.options.sourceMapIncludeSources', true);
			grunt.config.set(
				'uglify.build.options.sourceMapName',
				path.join(config.paths.temp, 'build.js.map')
			);

			grunt.config.set('uglify.lib.options.sourceMap', true);
			grunt.config.set('uglify.lib.options.sourceMapIncludeSources', true);
			grunt.config.set('uglify.lib.options.sourceMapName', function(dest) {
				var scriptRoot = path.normalize(config.paths.js),
					moduleRoot = path.normalize(config.paths.module);
				dest = path.normalize(dest)
					.replace(scriptRoot, '')
					.replace(moduleRoot, '/')
					.replace(/^[\\\/]/, '')
					.replace(/\\|\//g, '.')
					.replace('.min.js', '');

				return path.join(config.paths.jsMaps, dest + '.js.map');
			});

			grunt.config.set('concat.script.options.sourceMap', true);
			grunt.config.set(
				'concat.script.options.sourceMapName',
				path.join(config.paths.jsMaps, 'script.js.map')
			);
		}
	});
};