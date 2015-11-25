/* global config, project */

module.exports = function(grunt) {
	grunt.registerTask('configStyle', function() {
		var core = project.style.core,
			features = core.features;

		// Namespace mixins and reset
		if (typeof core.namespace == 'string') {
			config.style.namespaceOpen = core.namespace + ' {';
			config.style.namespaceClose = '}';
		}

		// Core style features
		config.style.vars = {
			sourcePath: '"' + config.paths.cssSource + '"',
			modulePath: '"' + config.paths.moduleSource + '"',
			buttonEnabled: features.buttons === true,
			codeEnabled: features.code === true,
			formEnabled: features.forms === true,
			tableEnabled: features.tables === true,
			printEnabled: features.print === true
		};

		if (config.style.vars.buttonEnabled) {
			config.style.coreImports.push('../css/components/wee.buttons.less');
		}

		if (config.style.vars.codeEnabled) {
			config.style.coreImports.push('../css/components/wee.code.less');
		}

		if (config.style.vars.formEnabled) {
			config.style.coreImports.push('../css/components/wee.forms.less');
		}

		if (config.style.vars.tableEnabled) {
			config.style.coreImports.push('../css/components/wee.tables.less');
		}

		if (config.style.vars.printEnabled) {
			config.style.print = '@media print {\n' +
				'@import "../css/wee.print.less";\n' +
				'@import (optional) "@{sourcePath}/custom/print.less";\n' +
				'}';
		}

		// Responsive
		if (core.responsive && core.responsive.enable === true) {
			config.style.vars.responsiveEnabled = true;

			// Breakpoints
			var offset = core.responsive.offset || 0,
				breakpoints = core.responsive.breakpoints,
				defaults = [
					'mobileLandscape',
					'tabletPortrait',
					'desktopSmall',
					'desktopMedium',
					'desktopLarge'
				];

			defaults.forEach(function(key) {
				var breakpoint = breakpoints[key];

				config.style.vars[key + 'Width'] = breakpoint !== false ?
					(breakpoint - offset) + 'px' :
					false;

				delete breakpoints[key];
			});

			config.style.responsive = '@import "../css/wee.responsive.less";';
		} else {
			config.style.vars.responsiveEnabled = false;
			config.style.vars.ieBreakpoint = 1;
		}

		// Compile custom
		for (var target in project.style.compile) {
			var taskName = target.replace(/\./g, '-') + '-style',
				sources = Wee.$toArray(project.style.compile[target]),
				files = [];

			for (var sourcePath in sources) {
				files.push(Wee.buildPath(config.paths.cssSource, sources[sourcePath]));
			}

			// Set watch config
			grunt.config.set('watch.' + taskName, {
				files: files,
				tasks: [
					'less:' + taskName
				]
			});

			// Create Less task
			grunt.config.set('less.' + taskName, {
				files: [{
					dest: Wee.buildPath(config.paths.css, target),
					src: files
				}],
				options: {
					globalVars: {
						weePath: '"' + config.paths.weeTemp + '"'
					}
				}
			});

			// Push style task
			config.style.tasks.push('less:' + taskName);
		}

		// Set global data variables
		if (
			(project.data && Object.keys(project.data).length) ||
			(project.style.data && Object.keys(project.style.data).length)
		) {
			var configVars = Wee.$extend(
				project.data || {},
				project.style.data || {}
			);

			for (var key in configVars) {
				var value = configVars[key];

				if (typeof value === 'string') {
					config.style.vars[key] = value;
				}
			}
		}
	});
};