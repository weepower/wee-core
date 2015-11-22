/* global fs, path, project, reloadPaths */

module.exports = function(grunt) {
	grunt.registerTask('initGenerator', function(task) {
		var build = Wee.$toArray(project.generator.build),
			configPath = '../../' + build[task],
			json = fs.readJsonSync(configPath),
			siteConfig = json.config,
			staticRoot = path.dirname(configPath);

		// Setup watch configuration
		if (siteConfig.watch === true) {
			var templates = [],
				targets = [],
				watchFiles = [],
				processSection = function(context) {
					var keys = Object.keys(context);

					keys.forEach(function(key) {
						var block = context[key],
							root = path.join(
								siteConfig.paths.content || '',
								block.contentRoot || ''
							),
							content = block.content ?
								Wee.$toArray(block.content) :
								[],
							template = block.template || siteConfig.defaultTemplate;

						if (template.indexOf('.') === -1) {
							template += '.html';
						}

						template = path.join(
							staticRoot,
							siteConfig.paths.templates + '/' + template
						);

						// Push targets to exclude from watch
						Wee.$toArray(block.target).forEach(function(target) {
							targets.push(path.join(staticRoot, siteConfig.paths.target || '', target));
						});

						watchFiles.push(template);
						templates.push(template);

						// Watch template files
						content.forEach(function(name) {
							var template = path.join(staticRoot, root, name);

							watchFiles.push(template);
							reloadPaths.push('!' + template);
						});

						// Check for nested sections
						if (block.sections) {
							processSection(block.sections);
						}
					});
				};

			processSection(json.sections);

			// Watch for generator updates
			watchFiles = Wee.$unique(watchFiles);

			if (watchFiles.length > 0) {
				grunt.config.set('watch.buildGenerator-' + task, {
					files: watchFiles,
					tasks: 'buildGenerator:' + task
				});
			}

			// Exclude targets from watch
			targets = Wee.$unique(targets);

			targets.forEach(function(target) {
				reloadPaths.push('!' + target);
			});

			// Exclude templates from watch
			templates = Wee.$unique(templates);

			templates.forEach(function(template) {
				reloadPaths.push('!' + template);
			});

			// Watch partials
			if (siteConfig.paths.partials) {
				var partialPath = siteConfig.paths.partials;

				// Watch for partial updates
				grunt.config.set('watch.cachePartials-' + task, {
					files: path.join(staticRoot, partialPath, '**/*'),
					tasks: [
						'cachePartials:' + task,
						'buildGenerator:' + task
					]
				});

				// Exclude partials from watch
				reloadPaths.push('!' + path.join(staticRoot, partialPath));
			}

			// Watch helpers
			if (siteConfig.paths.helpers) {
				var helperPath = siteConfig.paths.helpers;

				// Watch for helper updates
				grunt.config.set('watch.loadHelpers-' + task, {
					files: path.join(staticRoot, helperPath, '**/*.js'),
					tasks: [
						'loadHelpers:' + task,
						'buildGenerator:' + task
					]
				});

				// Exclude helpers from watch
				reloadPaths.push('!' + path.join(staticRoot, helperPath));
			}
		}

		// Cache partials
		if (siteConfig.paths.partials) {
			grunt.task.run('cachePartials:' + task);
		}

		// Load helpers
		if (siteConfig.paths.helpers) {
			grunt.task.run('loadHelpers:' + task);
		}

		// Build static site
		grunt.task.run('buildGenerator:' + task);
	});
};