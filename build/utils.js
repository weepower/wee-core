Wee.fn.extend({
	// Build root or relative path
	buildPath: function(loc, file) {
		return file.substring(0, 2) === './' ?
			file :
			path.join(loc, file);
	},
	// Append minified extension
	getMinExtension: function(dest, src, ext) {
		var dir = src.substring(0, src.lastIndexOf('/')),
			filename = src.substring(src.lastIndexOf('/'), src.length);
		filename = filename.substring(0, filename.lastIndexOf('.'));

		return dest + '/' + dir + filename + ext;
	},
	validate: function(config, grunt, filepath) {
		var ext = path.extname(filepath);

		if (filepath.indexOf('temp') === -1 &&
			filepath.indexOf('/vendor') === -1) {
			if (ext === '.js') {
				var js = grunt.file.read(filepath),
					errors = [],
					total = 0;

				if (project.script.validate.jshint) {
					// JSHint
					var jshintConfig = grunt.file.readJSON(
						project.script.validate.jshint === true ?
							'wee/script/.jshintrc' :
							project.script.validate.jshint
					);

					if (! jshint(js, jshintConfig)) {
						var out = jshint.data();
						errors = out.errors,
							total = errors.length;

						grunt.log.header('Script validation errors found');

						grunt.log.error('JSHint error' +
							((total > 1) ? 's' : '') + ' in ' + filepath + '.');

						errors.forEach(function(message) {
							Wee.logError(grunt, message.line + ':' + message.character, message.reason, message.evidence);
						});

						grunt.log.writeln();
						grunt.log.writeln();

						this.notify({
							title: 'JSHint Validation Error',
							message: 'Check console for error details'
						}, 'error');
					}
				}

				if (project.script.validate.jscs) {
					// JSCS
					var jscsConfig = grunt.file.readJSON(
							project.script.validate.jscs === true ?
								'wee/script/.jscs.json' :
								project.script.validate.jscs
						),
						checker = new JSCS();

					checker.registerDefaultRules();
					checker.configure(jscsConfig);

					errors = checker.checkString(js);

					var errorList = errors.getErrorList();
					total = errorList.length;

					if (total > 0) {
						grunt.log.error('JSCS error' +
							((total > 1) ? 's' : '') + ' in ' + filepath + '.');

						errorList.forEach(function(message) {
							Wee.logError(grunt, message.line + ':' + message.column, message.rule, message.message);
						});

						this.notify({
							title: 'JSCS Validation Error',
							message: 'Check console for error details'
						}, 'error');
					}
				}
			}
		}
	},
	logError: function(grunt, pos, msg, details) {
		grunt.log.writeln('['.cyan + pos + '] '.cyan + msg + ' ' + (details || '').magenta);
	},
	notify: function(data, type) {
		var notifier = require('node-notifier'),
			iconPath = 'node_modules/wee-core/build/img/';
		type = type || 'notice';

		if (type === 'error') {
			console.error(data.message);
			data.icon = iconPath + 'error.png';
		} else {
			console.log(data.message);
			data.icon = iconPath + 'notice.png';
		}

		notifier.notify(data);
	},
	serverWatch: function(url) {
		if (url.substring(0, 4) !== 'http') {
			reloadPaths.push(path.join(config.paths.root, url));
		}
	}
});