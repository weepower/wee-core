/* global config, fs, path, project */
/* jshint maxdepth: 8 */

module.exports = function(grunt) {
	grunt.registerTask('buildModules', function() {
		// Loop through module directories
		var children = fs.readdirSync(config.paths.moduleSource);

		for (var directory in children) {
			var name = children[directory],
				modulePath = config.paths.moduleSource + children[directory];

			// Ensure the child is a directory
			if (fs.statSync(modulePath).isDirectory()) {
				var configFile = modulePath + '/module.json';

				// Ensure the module.json file exists
				if (fs.existsSync(configFile)) {
					// Get module config
					var module = fs.readJsonSync(configFile),
						scriptRoot = modulePath + '/core/js/',
						moduleScript = [
							scriptRoot + 'vendor/**/*.js',
							scriptRoot + '**/*.js',
							'!' + scriptRoot + 'script.js',
						],
						vars = JSON.parse(JSON.stringify(config.style.vars)),
						less = fs.readFileSync(config.paths.wee + 'css/wee.module.less', 'utf8'),
						globalScript = [],
						namespaceOpen = '',
						namespaceClose = '';

					// Push into model list
					config.modules.push(name);

					// Set module variables
					vars.moduleName = name;
					vars.responsive = false;

					// Template variables
					var inject = '',
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
									config.paths.moduleSource + name +
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
										dest: Wee.buildPath(config.paths.module + name, compileStyleTarget),
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

					// Append core style
					inject += '@import (optional) "' +
						config.paths.moduleSource + name +
						'/core/css/screen.less";\n',

					module.style = module.style || {};
					module.script = module.script || {};

					if (module.script) {
						// Set global data variables
						if (
							(module.data && Object.keys(module.data).length) ||
							(module.script && module.script.data && Object.keys(module.script.data).length)
						) {
							var configScriptVars = Wee.$extend(
								module.data || {},
								module.script.data || {}
							);

							globalScript.push('Wee.$set("' + name + '.global", ' + JSON.stringify(configScriptVars) + ');');
						}

						// Inject global script
						if (globalScript.length) {
							var tempPath = config.paths.temp + name + '.global.js';

							fs.writeFileSync(
								tempPath,
								globalScript.join('')
							);

							moduleScript.unshift(tempPath);
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
										dest: Wee.buildPath(config.paths.module + name, compileScriptTarget),
										src: src
									}]
								});

								// Run task
								grunt.task.run('uglify:' + compileScriptTaskName);
							}
						}
					}

					// Append primary script
					moduleScript.push(scriptRoot + 'script.js');

					// Determine if module is responsive
					if (project.style.core.responsive.enable) {
						if (fs.existsSync(modulePath + '/core/css/breakpoints')) {
							vars.responsive = true;

							responsive +=
								'.wee-mobile-landscape () when not (@mobileLandscapeWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/core/css/breakpoints/mobile-landscape.less";\n' +
								'}\n' +
								'.wee-tablet-portrait () when not (@tabletPortraitWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/core/css/breakpoints/tablet-portrait.less";\n' +
								'}\n' +
								'.wee-desktop-small () when not (@desktopSmallWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/core/css/breakpoints/desktop-small.less";\n' +
								'}\n' +
								'.wee-desktop-medium () when not (@desktopMediumWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/core/css/breakpoints/desktop-medium.less";\n' +
								'}\n' +
								'.wee-desktop-large () when not (@desktopLargeWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/core/css/breakpoints/desktop-large.less";\n' +
								'}\n';
						}

						if (fs.existsSync(modulePath + '/css/breakpoints')) {
							vars.responsive = true;

							responsive +=
								'.wee-mobile-landscape () when not (@mobileLandscapeWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/css/breakpoints/mobile-landscape.less";\n' +
								'}\n' +
								'.wee-tablet-portrait () when not (@tabletPortraitWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/css/breakpoints/tablet-portrait.less";\n' +
								'}\n' +
								'.wee-desktop-small () when not (@desktopSmallWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/css/breakpoints/desktop-small.less";\n' +
								'}\n' +
								'.wee-desktop-medium () when not (@desktopMediumWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/css/breakpoints/desktop-medium.less";\n' +
								'}\n' +
								'.wee-desktop-large () when not (@desktopLargeWidth = false) {\n' +
								'	@import (optional) "' + config.paths.moduleSource + name + '/css/breakpoints/desktop-large.less";\n' +
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
							config.paths.module + name + '/style.min.css',
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
						config.script.build = config.script.build.concat(moduleScript);
					} else {
						// Create module style compile task
						obj[name] = {
							files: [{
								dest: config.paths.module + name + '/script.min.js',
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