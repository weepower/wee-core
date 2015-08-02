/* global __dirname */

(function() {
	'use strict';

	module.exports = function(config) {
		var fs = require('fs-extra');

		require('../script/wee.view');

		var error = false,
			message = false,
			templatePath = __dirname + '/../templates/',
			commands = {
				controller: function() {
					var name = config.args.name || '',
						target = 'source/js/build/' + name + '.js';

					if (!name) {
						error = 'Missing argument "--name=controllerName"';
					} else if (fs.existsSync(target)) {
						error = 'Controller "' + target + '" already exists';
					}

					if (!error) {
						var template = fs.readFileSync(templatePath + 'controller/base.js', 'utf8'),
							parsed = Wee.view.render(template, config.args);

						fs.writeFileSync(target, parsed);

						message = 'Controller generated at "' + target + '"';
					}
				},
				module: function() {
					var name = config.args.name || '',
						slug = name.toLowerCase(),
						target = 'source/modules/' + slug;

					if (!name) {
						error = 'Missing argument "--name=Module"';
					} else if (fs.existsSync(target)) {
						error = 'Module "' + name + '" already exists';
					}

					if (!error) {
						fs.copySync(templatePath + 'module', target);

						message = 'Module generated at "' + target + '"';
					}
				},
				test: function() {
					var name = config.args.name,
						type = config.args.type || 'unit',
						types = [
							'unit',
							'functional'
						],
						target = 'source/js/tests/' + type + '/' + name + '.js';

					if (!name) {
						error = 'Missing argument "--name=testName"';
					} else if (types.indexOf(type) < 0) {
						error = 'Invalid test type "' + type + '"';
					} else if (fs.existsSync(target)) {
						error = 'Test "' + target + '" already exists';
					}

					if (!error) {
						var template = fs.readFileSync(templatePath + 'test/unit.js', 'utf8'),
							parsed = Wee.view.render(template, config.args);

						fs.writeFileSync(target, parsed);

						message = 'Test generated at "' + target + '"';
					}
				}
			};

		if (config.options.length) {
			var type = config.options[0],
				command = commands[type];

			if (command) {
				command();
			} else {
				error = 'Generator "' + type + '" not registered';
			}
		} else {
			error = 'Missing required generator type';
		}

		if (error) {
			Wee.notify({
				title: 'Generator Error',
				message: error
			}, 'error');
		} else {
			Wee.notify({
				title: 'Generation Successful',
				message: message || 'Generator successfully executed'
			});
		}

		return;
	};
})();