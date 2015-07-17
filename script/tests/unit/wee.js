define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	registerSuite({
		'fn.make': function() {
			Wee.fn.make('controller', {
				test: function() {
					return 'response';
				}
			});

			assert.equal(Wee.controller.test(), 'response',
				'Controller function response correctly returned.'
			);
		},
		'fn.extend': function() {
			Wee.fn.extend('controller', {
				test2: function() {
					return 'response';
				}
			});

			assert.strictEqual(Wee.controller.test2(), 'response',
				'Controller extended successfully.'
			);
		},
		'$env': function() {
			// Default
			assert.strictEqual(Wee.$env(), 'local',
				'Default environment is correctly set to "local".'
			);

			// Settings
			Wee.$env({
				prod: 'www.weepower.com',
				stage: 'www.weepower.stage'
			}, 'here');

			assert.strictEqual(Wee.$env(), 'here',
				'Default environment is correctly set to "here".'
			);
		},
		'$envSecure': function() {
			assert.ok(
				Wee.$envSecure('https://www.weepower.com'),
				'The environment is correctly identified as secure.'
			);
		}
	});
});