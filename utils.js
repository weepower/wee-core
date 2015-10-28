/* global config, reloadPaths */

(function(W) {
	'use strict';

	var chalk = require('chalk'),
		fs = require('fs-extra'),
		notifier = require('node-notifier'),
		path = require('path');

	W.fn.extend({
		/**
		 * Build root or relative path
		 *
		 * @param {string} loc
		 * @param {string} file
		 * @returns {string} path
		 */
		buildPath: function(loc, file) {
			return file.substring(0, 2) === './' ?
				file :
				path.join(loc, file);
		},

		/**
		 * Append minified extension
		 *
		 * @param {string} dest
		 * @param {string} src
		 * @param {string} ext
		 * @returns {string} path
		 */
		getMinExtension: function(dest, src, ext) {
			var dir = src.substring(0, src.lastIndexOf('/')),
				filename = src.substring(src.lastIndexOf('/'), src.length)
					.substring(0, filename.lastIndexOf('.'));

			return dest + '/' + dir + filename + ext;
		},

		/**
		 * Validate source file
		 *
		 * @param {string} root
		 * @param {object} config
		 * @param {string} file
		 */
		validate: function(root, config, file) {
			var ext = path.extname(file);

			if (['temp', '/vendor'].indexOf(file) < 0) {
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
		 * Validate JavaScript source file using JSHint
		 *
		 * @param {object} rules
		 * @param {string} file
		 * @param {string} src
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
						W.logError(
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
		 * Validate JavaScript source file using JSCS
		 *
		 * @param {object} rules
		 * @param {string} file
		 * @param {string} src
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
						W.logError(
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
		 * Log an error to the console
		 *
		 * @param {number} position
		 * @param {string} message
		 * @param {string} [details]
		 */
		logError: function(position, message, details) {
			console.log(
				chalk.bgBlack.bold('[' + position + '] ') +
				message + ' ' + (details || '')
			);
		},

		/**
		 * Notify through a naitvely available notification option
		 *
		 * @param {object} options
		 * @param {string} [type=notice]
		 * @param {boolean} [log=true]
		 */
		notify: function(options, type, log) {
			options.icon = 'build/img/' + (type || 'notice') + '.png';
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
		 * Push full server watch path
		 *
		 * @param {string} url
		 */
		serverWatch: function(url) {
			if (url.substring(0, 4) !== 'http') {
				reloadPaths.push(
					path.join(config.paths.root, url)
				);
			}
		}
	});
})(Wee);