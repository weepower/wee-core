/* global config, JSCS, jshint, path, project, reloadPaths */

(function() {
	'use strict';

	var chalk = require('chalk'),
		fs = require('fs-extra'),
		glob = require('glob'),
		notifier = require('node-notifier'),
		path = require('path');

	Wee.fn.extend({
		/**
		 * Build root or relative path
		 *
		 * @param loc
		 * @param file
		 * @returns {*}
		 */
		buildPath: function(loc, file) {
			return file.substring(0, 2) === './' ?
				file :
				path.join(loc, file);
		},

		/**
		 * Append minified extension
		 *
		 * @param dest
		 * @param src
		 * @param ext
		 * @returns {string}
		 */
		getMinExtension: function(dest, src, ext) {
			var dir = src.substring(0, src.lastIndexOf('/')),
				filename = src.substring(src.lastIndexOf('/'), src.length);
			filename = filename.substring(0, filename.lastIndexOf('.'));

			return dest + '/' + dir + filename + ext;
		},

		/**
		 *
		 * @param file
		 * @param config
		 * @param log
		 */
		validate: function(root, config, file) {
			var ext = path.extname(file);

			if (file.indexOf('temp') === -1 &&
				file.indexOf('/vendor') === -1) {
				if (ext === '.js') {
					var validate = config.script.validate,
						src = fs.readFileSync(file, {
							encoding: 'utf-8'
						});

					if (validate.jshint) {
						this.validateJshint(
							path.join(root, validate.jshint),
							file,
							src
						);
					}

					if (validate.jscs) {
						this.validateJscs(
							path.join(root, validate.jscs),
							file,
							src
						);
					}
				}
			}
		},

		/**
		 *
		 * @param src
		 * @param file
		 */
		validateJshint: function(rules, file, src) {
			var jshint = require('jshint').JSHINT,
				config = fs.readJsonSync(rules);

			if (! jshint(src, config)) {
				var out = jshint.data(),
					errors = out.errors,
					total = errors.length;

				console.log(
					chalk.bgRed('JSHint error' +
						((total > 1) ? 's' : '') + ' in ' + file + '.')
				);

				errors.forEach(function(error) {
					if (error) {
						Wee.logError(
							error.line + ':' + error.character,
							error.reason,
							error.evidence
						);
					}
				});

				console.log('\n');

				this.notify({
					title: 'JSHint Validation Error',
					message: 'Check console for error details'
				}, 'error', false);
			}
		},

		/**
		 *
		 * @param src
		 * @param file
		 */
		validateJscs: function(rules, file, src) {
			var JSCS = require('jscs'),
				jscsConfig = fs.readJsonSync(rules),
				checker = new JSCS();

			checker.registerDefaultRules();
			checker.configure(jscsConfig);

			var errors = checker.checkString(src),
				errorList = errors.getErrorList(),
				total = errorList.length;

			if (total > 0) {
				console.log(
					chalk.bgRed('JSCS error' +
						((total > 1) ? 's' : '') + ' in ' + file + '.')
				);

				errorList.forEach(function(error) {
					if (error) {
						Wee.logError(
							error.line + ':' + error.column,
							error.rule,
							error.message
						);
					}
				});

				console.log('\n');

				this.notify({
					title: 'JSCS Validation Error',
					message: 'Check console for error details'
				}, 'error', false);
			}
		},

		/**
		 *
		 * @param position
		 * @param message
		 * @param details
		 */
		logError: function(position, message, details) {
			var output =
				chalk.bgBlack.bold('[' + position + '] ') +
				message + ' ' +
				(details || '');

			console.log(output);
		},

		/**
		 *
		 * @param options
		 * @param type
		 * @param log
		 */
		notify: function(options, type, log) {
			options.icon = 'node_modules/wee-core/build/img/' +
				(type || 'notice') + '.png';
			options.group = 1;

			if (type == 'error') {
				options.group = 2;
				options.sound = true;
				options.wait = true;
			}

			if (log !== false) {
				console.log(options.message);
			}

			notifier.notify(options);
		},

		/**
		 *
		 * @param url
		 */
		serverWatch: function(url) {
			if (url.substring(0, 4) !== 'http') {
				reloadPaths.push(path.join(config.paths.root, url));
			}
		}
	});
})();