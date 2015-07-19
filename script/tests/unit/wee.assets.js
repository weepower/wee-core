define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	require('script/wee.assets.js');

	registerSuite({
		'assets.root': function() {
			Wee.assets.root('https://assets.weepower.com');

			assert.strictEqual(Wee.assets.root(), 'https://assets.weepower.com',
				'Asset root set successfully.'
			);
		},
		'assets.load': function() {
			// ...
		},
		'assets.replace': function() {
			// ...
		},
		'assets.remove': function() {
			// ...
		},
		'assets.ready': function() {
			// ...
		}
	});
});