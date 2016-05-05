/* global config, fs, path, project */
/* jshint maxdepth: 6 */

module.exports = function(grunt) {
	grunt.registerTask('buildModules', function() {
		fs.readdirSync(config.paths.moduleSource).forEach(function(name) {
			var modulePath = config.paths.moduleSource + name,
				configFile = modulePath + '/module.json';

			// Ensure the child is a directory
			if (! fs.statSync(modulePath).isDirectory()) {
				return;
			}

			var module = fs.readJsonSync(configFile, {
				throws: false
			});

			// Validate the module.json file
			if (! module) {
				Wee.notify({
					title: 'Module Error',
					message: 'Missing or invalid module.json for "' + name + '" module.'
				}, 'fail', true);
			}

			var scriptRoot = modulePath + '/core/js/',
				moduleScript = [
					config.paths.temp + 'moduleView-' + name + '.js',
					scriptRoot + 'vendor/**/*.js',
					scriptRoot + 'init.js',
					scriptRoot + '**/*.js',
					'!' + scriptRoot + 'script.js'
				],
				vars = JSON.parse(JSON.stringify(config.style.vars)),
				less = fs.readFileSync(config.paths.wee + 'css/wee.module.less', 'utf8'),
				namespace = 'Wee',
				coreScript = [],
				globalScript = [],
				imports = [],
				namespaceOpen = '',
				namespaceClose = '';

			// Push default values into module array
			config.modules[name] = {
				autoload: module.autoload === true,
				namespace: false,
				tasks: false
			};

			// Reference core Less and inherit namespace if extension
			if (module.extension) {
				imports.push("@import (reference) 'wee.less';");

				namespaceOpen = config.style.namespaceOpen || '';
				namespaceClose = config.style.namespaceClose || '';
			}

			// Add core styling
			imports.push('@import (optional) "' + modulePath + '/core/css/screen.less";');

			if (module.style) {
				// Namespace mixins and reset
				if (module.style.core && typeof module.style.core.namespace === 'string') {
					namespaceOpen = module.style.core.namespace + ' {';
					namespaceClose = '}';
				}

				// Build additional style
				if (module.style.build) {
					Wee.$toArray(module.style.build).forEach(function(target) {
						imports.push('@import (less) "' + modulePath + '/' + target + '";');
					});
				}

				// Compile additional style
				if (module.style.compile) {
					for (var styleTarget in module.style.compile) {
						var styleTask = styleTarget.replace(/\./g, '-') + '-' + name + '-style',
							styleSources = Wee.$toArray(module.style.compile[styleTarget]),
							styleFiles = styleSources.map(function(source) {
								return Wee.buildPath(modulePath, source);
							});

						grunt.config.set('watch.' + styleTask, {
							files: styleFiles,
							tasks: [
								'less:' + styleTask
							]
						});

						grunt.config.set('less.' + styleTask, {
							files: [{
								dest: Wee.buildPath(config.paths.module + name, styleTarget),
								src: styleFiles
							}],
							options: {
								globalVars: {
									weePath: '"' + config.paths.weeTemp + '"'
								}
							}
						});

						config.style.tasks.push('less:' + styleTask);
						grunt.task.run('less:' + styleTask);
					}
				}
			}

			module.style = module.style || {};
			module.script = module.script || {};

			if (module.script) {
				// Set module namespace
				if (module.script.core && module.script.core.namespace) {
					namespace = module.script.core.namespace;
				}

				config.modules[name].namespace = namespace;

				// Set global data variables
				if (
					(module.data && Object.keys(module.data).length) ||
					(module.script.data && Object.keys(module.script.data).length)
				) {
					var configScriptVars = Wee.$extend(
						module.data || {},
						module.script.data || {}
					);

					globalScript.push(
						namespace + '.$set("' + name + '.global", ' +
						JSON.stringify(configScriptVars) + ');'
					);
				}

				// Inject global script
				if (globalScript.length) {
					var tempPath = config.paths.temp + name + '.global.js';

					fs.writeFileSync(tempPath, globalScript.join(''));
					moduleScript.unshift(tempPath);
				}

				// Build additional script
				if (module.script.build) {
					Wee.$toArray(module.script.build).forEach(function(source) {
						moduleScript.push(path.join(modulePath, source));
					});
				}

				// Include Core if referenced
				if (! module.autoload && module.script.core && module.script.core.enable) {
					var features = module.script.core.features,
						root = config.paths.wee + 'js/',
						chained = [];

					coreScript.push(root + 'wee.js');

					if (features.chain === true) {
						chained.push(root + 'wee.chain.js');
					}

					if (features.animate === true) {
						coreScript.push(root + 'wee.animate.js');

						if (features.chain === true) {
							chained.push(root + 'chain/wee.chain.animate.js');
						}
					}

					if (features.assets === true) {
						coreScript.push(root + 'wee.assets.js');
					}

					if (features.data === true) {
						coreScript.push(root + 'wee.data.js');
					}

					if (features.dom === true) {
						coreScript.push(root + 'wee.dom.js');

						if (features.chain === true) {
							chained.push(root + 'chain/wee.chain.dom.js');
						}
					}

					if (features.events === true) {
						coreScript.push(root + 'wee.events.js');

						if (features.chain === true) {
							chained.push(root + 'chain/wee.chain.events.js');
						}
					}

					if (features.history === true) {
						coreScript.push(root + 'wee.history.js');
					}

					if (features.routes === true) {
						coreScript.push(root + 'wee.routes.js');
					}

					if (features.screen === true) {
						coreScript.push(root + 'wee.screen.js');
					}

					if (features.touch === true) {
						coreScript.push(root + 'wee.touch.js');
					}

					if (features.view === true) {
						coreScript.push(root + 'wee.view.js');
						coreScript.push(root + 'wee.view.diff.js');

						if (features.chain === true) {
							chained.push(root + 'chain/wee.chain.view.js');
						}
					}

					coreScript = coreScript.concat(chained);
				}

				// Compile additional script
				if (module.script.compile) {
					for (var scriptTarget in module.script.compile) {
						var scriptTask = scriptTarget.replace(/\./g, '-') + '-' + name + '-script',
							scriptSources = Wee.$toArray(module.script.compile[scriptTarget]),
							scriptFiles = scriptSources.map(function(source) {
								return Wee.buildPath(modulePath, source);
							});

						grunt.config.set('watch.' + scriptTask, {
							files: scriptFiles,
							tasks: [
								'uglify:' + scriptTask
							]
						});

						grunt.config.set('uglify.' + scriptTask, {
							files: [{
								dest: Wee.buildPath(config.paths.module + name, scriptTarget),
								src: scriptFiles
							}]
						});

						grunt.task.run('uglify:' + scriptTask);
					}
				}
			}

			// Append primary script
			moduleScript.push(scriptRoot + 'script.js');

			// Write temporary file
			fs.writeFileSync(config.paths.temp + name + '.less',
				less.replace(/{{moduleName}}/g, name)
					.replace(/{{modulePath}}/g, modulePath)
					.replace('{{namespaceOpen}}', namespaceOpen)
					.replace('{{namespaceClose}}', namespaceClose)
					.replace('{{fontPath}}', '/' + project.paths.assets + '/modules/' + name + '/fonts/')
					.replace('{{imgPath}}', '/' + project.paths.assets + '/modules/' + name + '/img/')
					.replace('{{imports}}', imports.join('\n'))
			);

			// Set global data variables
			if (
				(module.data && Object.keys(module.data).length) ||
				(module.style && module.style.data && Object.keys(module.style.data).length)
			) {
				var configStyleVars = Wee.$extend(
					module.data || {},
					module.style.data || {}
				);

				for (var key in configStyleVars) {
					var value = configStyleVars[key];

					if (typeof value === 'string') {
						vars[key] = value;
					}
				}
			}

			// Create module style compile task
			var dest = module.autoload === true ?
				config.paths.temp + name + '.css' :
				config.paths.module + name + '/style.min.css';

			grunt.config.set('less.' + name, {
				files: [{
					dest: dest,
					src: config.paths.temp + name + '.less'
				}],
				options: {
					globalVars: {
						weePath: '"' + config.paths.weeTemp + '"'
					},
					modifyVars: vars
				}
			});

			config.style.tasks.push('less:' + name);

			grunt.config.set('watch.' + name + '-style', {
				files: modulePath + '/**/*.less',
				tasks: [
					'less:' + name,
					'concat:style'
				]
			});

			grunt.task.run('less:' + name);
			grunt.task.run('concat:style');

			if (module.autoload === true) {
				// Push temporary style to concat array
				config.style.concat.push(dest);

				// Add script paths to uglify
				config.script.build = config.script.build.concat(moduleScript);
			} else {
				var maps = [],
					tasks = [];

				// Process core script compilation
				if (coreScript.length) {
					grunt.config.set('uglify.' + name + '-core', {
						options: {
							wrap: namespace
						},
						files: [{
							dest: config.paths.temp + name + '-core.min.js',
							src: coreScript
						}]
					});

					grunt.task.run('uglify:' + name + '-core');

					grunt.config.set('uglify.' + name + '-build', {
						files: [{
							dest: config.paths.temp + name + '-build.min.js',
							src: moduleScript
						}]
					});

					tasks.push('uglify:' + name + '-build');

					// Concatenate module core and build
					grunt.config.set('concat.' + name + '-concat', {
						files: [{
							dest: config.paths.module + name + '/script.min.js',
							src: [
								config.paths.temp + name + '-core.min.js',
								config.paths.temp + name + '-build.min.js'
							]
						}]
					});

					tasks.push('concat:' + name + '-concat');

					config.modules[name].tasks = [
						'uglify:' + name + '-build',
						'concat:' + name + '-concat'
					];

					if (project.script.sourceMaps === true) {
						maps['uglify.' + name + '-core'] =
							path.join(config.paths.temp, name + '-core.js.map');
						maps['uglify.' + name + '-build'] =
							path.join(config.paths.temp, name + '-build.js.map');
						maps['concat.' + name + '-concat'] =
							path.join(config.paths.jsMaps, name + '.script.js.map');
					}
				} else {
					grunt.config.set('uglify.' + name, {
						files: [{
							dest: config.paths.module + name + '/script.min.js',
							src: moduleScript
						}]
					});

					tasks.push('uglify:' + name);

					config.modules[name].tasks = [
						'uglify:' + name
					];

					if (project.script.sourceMaps === true) {
						maps['uglify.' + name] =
							path.join(config.paths.jsMaps, name + '.script.js.map');
					}
				}

				if (maps.length) {
					Wee.addMaps(grunt, maps);
				}

				grunt.config.set('watch.' + name + '-script', {
					files: moduleScript,
					tasks: tasks
				});

				grunt.task.run(tasks);
			}
		});
	});
};