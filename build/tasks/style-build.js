/* global config, path, project */

module.exports = function(grunt) {
	grunt.registerTask('buildStyle', function() {
		var less = fs.readFileSync(config.paths.wee + 'style/wee.less', 'utf8'),
			buildFiles = grunt.file.expand({
				cwd: config.paths.cssSource + 'build'
			}, [
				'**/*.css',
				'**/*.less'
			]),
			coreInject = '',
			inject = '';

		buildFiles.forEach(function(name) {
			name = '@{sourcePath}/build/' +
				name.replace(path.normalize(config.paths.assets), '');

			if (name.indexOf('/vendor/') !== -1) {
				config.style.imports.unshift(name);
			} else {
				config.style.imports.push(name);
			}
		});

		// Build configured
		var buildArray = [
			'<%= config.paths.cssSource %>build/**/*.{css,less}'
		];

		project.style.build.forEach(function(name) {
			name = Wee.buildPath(config.paths.cssSource, name);

			buildArray.push(name);

			name = '@{sourcePath}/' +
				name.replace(path.normalize(config.paths.assets), '');

			config.style.imports.push(name);
		});

		grunt.config.set('watch.styleBuildUpdate.files', buildArray);

		// Process core imports
		config.style.coreImports.forEach(function(val) {
			coreInject += '@import (optional) "' + val + '";\n';
		});

		// Process custom imports
		config.style.imports.forEach(function(val) {
			if (path.extname(val) === '.css') {
				inject += '@import (inline, optional) "' + val + '";\n';
			} else {
				inject += '@import (optional) "' + val + '";\n';
			}
		});

		less = less.replace('{{namespaceOpen}}', config.style.namespaceOpen || '')
			.replace('{{namespaceClose}}', config.style.namespaceClose || '')
			.replace('{{coreImports}}', coreInject)
			.replace('{{imports}}', inject)
			.replace('{{print}}', config.style.print || '')
			.replace('{{responsive}}', config.style.responsive || '');

		// Write temporary file
		fs.writeFileSync(config.paths.weeTemp, less);

		// Add to concat array
		config.style.concat.push(config.paths.temp + 'wee.css');

		// Run Grunt tasks
		var tasks = [
			'less:lib',
			'less:core'
		];

		tasks = tasks.concat(config.style.tasks);
		tasks.push('concat:style');

		grunt.task.run(tasks);
	});
};