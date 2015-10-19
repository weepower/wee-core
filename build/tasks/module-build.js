/* global config, fs, legacyConvert, moduleLegacy, path, project */
/* jshint maxdepth: 5 */

module.exports = function(grunt) {
	grunt.registerTask('buildModules', function() {
		// Loop through module directories
		var children = fs.readdirSync(config.paths.modulesSource);

		for (var directory in children) {
			var name = children[directory],
				modulePath = config.paths.modulesSource + children[directory];

			// Ensure the child is a directory
			if (fs.statSync(modulePath).isDirectory()) {
				var configFile = modulePath + '/module.json';

				// Ensure the module.json file exists
				if (fs.existsSync(configFile)) {
					// Get module config
					var module = fs.readJsonSync(configFile),
						scriptRoot = modulePath + '/module/script/',
						moduleScript = [
							scriptRoot + 'script.js',
							scriptRoot + '*.js'
						],
						vars = JSON.parse(JSON.stringify(config.style.vars)),
						less = fs.readFileSync(config.paths.wee + 'style/wee.module.less', 'utf8'),
						namespaceOpen = '',
						namespaceClose = '';

					// Set module variables
					vars.moduleName = name;
					vars.responsive = false;

					// Template variables
					var inject = '@import (optional) "' +
							config.paths.modulesSource + name +
							'/module/style/screen.less";\n',
						responsive = '';

					// Reference core Less and inherit namespace if extension
					if (module.extension) {
						inject += "@import (reference) 'wee.less';\n";

						namespaceOpen = config.style.namespaceOpen || '';
						namespaceClose = config.style.namespaceClose || '';
					}

					if (module.style) {
						// Namespace mixins and reset
						if (module.style.core && typeof module.style.core.namespace == 'string') {
							namespaceOpen = module.style.core.namespace + ' {';
							namespaceClose = '}';
						}

						// Build additional style
						if (module.style.build) {
							var buildStyleSources = Wee.$toArray(module.style.build);

							buildStyleSources.forEach(function(filepath) {
								inject += '@import "' +
									config.paths.modulesSource + name +
									'/' + filepath + '";\n';
							});
						}

						// Compile additional style
						if (module.style.compile) {
							for (var compileStyleTarget in module.style.compile) {
								var compileStyleTaskName = compileStyleTarget.replace(/\./g, '-') + '-' + name + '-style',
									compileStyleSources = Wee.$toArray(module.style.compile[compileStyleTarget]),
									files = [];

								for (var sourcePath in compileStyleSources) {
									files.push(Wee.buildPath(modulePath, compileStyleSources[sourcePath]));
								}

								// Merge watch config
								grunt.config.set('watch.' + compileStyleTaskName, {
									files: files,
									tasks: [
										'less:' + compileStyleTaskName
									]
								});

								// Create Less task
								grunt.config.set('less.' + compileStyleTaskName, {
									files: [{
										dest: Wee.buildPath(config.paths.modules + name, compileStyleTarget),
										src: files
									}],
									options: {
										globalVars: {
											weePath: '"' + config.paths.weeTemp + '"'
										}
									}
								});

								// Push style task
								config.style.tasks.push('less:' + compileStyleTaskName);

								// Run task
								grunt.task.run('less:' + compileStyleTaskName);
							}
						}
					}

					module.style = module.style || {};
					module.script = module.script || {};

					if (module.script) {
						// Set global data variables
						if (
							(module.data && Object.keys(module.data).length) ||
							(module.script && module.script.data && Object.keys(module.script.data).length)
						) {
							var weeScriptGlobal = config.paths.temp + name + '.data.js',
								configScriptVars = Wee.$extend(module.data || {}, module.script.data || {}),
								script = 'Wee.$set("' + name + ':global", ' + JSON.stringify(configScriptVars) + ');';

							fs.writeFileSync(weeScriptGlobal, script);

							moduleScript.unshift(weeScriptGlobal);
						}

						// Build additional script
						if (module.script.build) {
							var buildScriptSources = Wee.$toArray(module.script.build);

							buildScriptSources.forEach(function(filepath) {
								moduleScript.push(path.join(modulePath, filepath));
							});
						}

						// Compile additional script
						if (module.script.compile) {
							for (var compileScriptTarget in module.script.compile) {
								var compileScriptTaskName = compileScriptTarget.replace(/\./g, '-') + '-' + name + '-script',
									compileScriptSources = module.script.compile[compileScriptTarget],
									src = [];

								if (compileScriptSources instanceof Array) {
									for (var source in compileScriptSources) {
										src.push(Wee.buildPath(config.paths.js, compileScriptSources[source]));
									}
								} else {
									src = Wee.buildPath(modulePath, compileScriptSources);
								}

								// Merge watch config
								grunt.config.set('watch.' + compileScriptTaskName, {
									files: src,
									tasks: [
										'uglify:' + compileScriptTaskName
									]
								});

								// Create uglify task
								grunt.config.set('uglify.' + compileScriptTaskName, {
									files: [{
										dest: Wee.buildPath(config.paths.modules + name, compileScriptTarget),
										src: src
									}]
								});

								// Run task
								grunt.task.run('uglify:' + compileScriptTaskName);
							}
						}
					}

					// Determine if module is responsive
					if (project.style.core.responsive.enable) {
						if (fs.existsSync(modulePath + '/module/style/breakpoints')) {
							vars.responsive = true;

							responsive +=
								'.wee-mobile-landscape () when not (@mobileLandscapeWidth = false) {\n' +
								'	@import (optional) "' + config.paths.modulesSource + name + '/module/style/breakpoints/mobile-landscape.less";\n' +
								'}\n' +
								'.wee-tablet-portrait () when not (@tabletPortraitWidth = false) {\n' +
								'	@import (optional) "' + config.paths.modulesSource + name + '/module/style/breakpoints/tablet-portrait.less";\n' +
								'}\n' +
								'.wee-desktop-small () when not (@desktopSmallWidth = false) {\n' +
								'	@import (optional) "' + config.paths.modulesSource + name + '/module/style/breakpoints/desktop-small.less";\n' +
								'}\n' +
								'.wee-desktop-medium () when not (@desktopMediumWidth = false) {\n' +
								'	@import (optional) "' + config.paths.modulesSource + name + '/module/style/breakpoints/desktop-medium.less";\n' +
								'}\n' +
								'.wee-desktop-large () when not (@desktopLargeWidth = false) {\n' +
								'	@import (optional) "' + config.paths.modulesSource + name + '/module/style/breakpoints/desktop-large.less";\n' +
								'}\n';
						}

						if (fs.existsSync(modulePath + '/css/breakpoints')) {
							vars.responsive = true;

							responsive +=
								'.wee-mobile-landscape () when not (@mobileLandscapeWidth = false) {\n' +
								'	@import (optional) "' + config.paths.modulesSource + name + '/css/breakpoints/mobile-landscape.less";\n' +
								'}\n' +
								'.wee-tablet-portrait () when not (@tabletPortraitWidth = false) {\n' +
								'	@import (optional) "' + config.paths.modulesSource + name + '/css/breakpoints/tablet-portrait.less";\n' +
								'}\n' +
								'.wee-desktop-small () when not (@desktopSmallWidth = false) {\n' +
								'	@import (optional) "' + config.paths.modulesSource + name + '/css/breakpoints/desktop-small.less";\n' +
								'}\n' +
								'.wee-desktop-medium () when not (@desktopMediumWidth = false) {\n' +
								'	@import (optional) "' + config.paths.modulesSource + name + '/css/breakpoints/desktop-medium.less";\n' +
								'}\n' +
								'.wee-desktop-large () when not (@desktopLargeWidth = false) {\n' +
								'	@import (optional) "' + config.paths.modulesSource + name + '/css/breakpoints/desktop-large.less";\n' +
								'}\n';
						}
					}

					// Inject empty mixins if no breakpoints exist
					if (! vars.responsive) {
						responsive +=
							'.wee-mobile-landscape () {}\n' +
							'.wee-tablet-portrait () {}\n' +
							'.wee-desktop-small () {}\n' +
							'.wee-desktop-medium () {}\n' +
							'.wee-desktop-large () {}\n';
					}

					// Process import injection
					less = less.replace('{{namespaceOpen}}', namespaceOpen)
						.replace('{{namespaceClose}}', namespaceClose)
						.replace('{{imports}}', inject)
						.replace('{{responsive}}', responsive);

					// Write temporary file
					fs.writeFileSync(config.paths.temp + name + '.less', less);

					// Set global data variables
					if (
						(module.data && Object.keys(module.data).length) ||
						(module.style && module.style.data && Object.keys(module.style.data).length)
					) {
						var configStyleVars = Wee.$extend(module.data || {}, module.style.data || {});

						for (var key in configStyleVars) {
							var value = configStyleVars[key];

							if (typeof value === 'string') {
								vars[key] = value;
							}
						}
					}

					// Create module style compile task
					var dest = (module.autoload === true) ?
							config.paths.temp + name + '.css' :
							config.paths.modules + name + '/style.min.css',
						obj = {};

					obj[name] = {
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
					};

					grunt.config.merge({
						less: obj
					});

					// Push style task
					config.style.tasks.push('less:' + name);

					// Configure style watch task
					grunt.config.set('watch.' + name + '-style', {
						files: modulePath + '/**/*.less',
						tasks: [
							'less:' + name,
							'concat:style'
						]
					});

					// Run initial tasks
					grunt.task.run('less:' + name);
					grunt.task.run('concat:style');

					if (module.autoload === true) {
						// Push temporary style to concat list
						config.style.concat.push(dest);

						// Add script paths to uglify
						config.script.files = config.script.files.concat(moduleScript);

						// Append legacy style
						if (project.style.legacy.enable) {
							moduleLegacy.push('@import (inline) "' + config.paths.temp + name + '-legacy.css";');
						}

						if (project.style.legacy.watch === true) {
							// Configure legacy watch task
							grunt.config.set('watch.' + name + '-legacy', {
								files: config.paths.temp + compileStyleTaskName + '.css',
								tasks: [
									'less:legacy',
									'convertLegacy:core',
									'notify:legacy'
								]
							});
						}
					} else {
						// Create module style compile task
						obj[name] = {
							files: [{
								dest: config.paths.modules + name + '/script.min.js',
								src: moduleScript
							}]
						};

						grunt.config.merge({
							uglify: obj
						});

						// Configure script watch task
						grunt.config.set('watch.' + name + '-script', {
							files: moduleScript,
							tasks: [
								'uglify:' + name
							]
						});

						// Execute script task
						grunt.task.run('uglify:' + name);
					}

					// Legacy processing
					if (project.style.legacy.enable) {
						var legacyTaskName = name + '-legacy';
						dest = module.autoload ?
							config.paths.temp + legacyTaskName + '.css' :
							config.paths.modules + name + '/legacy.min.css';

						// Create legacy task
						grunt.config.set('less.' + legacyTaskName, {
							files: [{
								dest: dest,
								src: config.paths.wee + 'style/wee.module-legacy.less'
							}],
							options: {
								modifyVars: vars,
								globalVars: {
									weePath: '"' + config.paths.weeTemp + '"'
								}
							}
						});

						if (project.style.legacy.watch === true) {
							// Configure legacy watch task
							grunt.config.set('watch.' + legacyTaskName, {
								files: modulePath + '/**/*.less',
								tasks: [
									'less:' + legacyTaskName,
									'convertLegacy:' + legacyTaskName
								]
							});
						}

						// Push to conversion array
						legacyConvert[legacyTaskName] = dest;

						grunt.task.run('less:' + legacyTaskName);
						grunt.task.run('convertLegacy:' + legacyTaskName);
					}
				} else {
					Wee.notify({
						title: 'Module Error',
						message: 'Missing module.json for "' + name + '" module.'
					}, 'error');

					grunt.fail.fatal('Missing module.json for "' + name + '" module.');
				}
			}
		}
	});
};