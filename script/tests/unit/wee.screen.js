define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	require('script/wee.screen.js');

	registerSuite({
		'screen.size': function() {
			//assert.strictEqual(Wee.screen.size(), 5,
			//	'Screen size returned 5 successfully.'
			//);
		},
		'screen.map': function() {
			assert.strictEqual(Wee.screen.map({
					size: 1,
					callback: function() {}
				}), undefined,
				'Single event mapped successfully.'
			);

			assert.strictEqual(Wee.screen.map([{
					size: 1,
					callback: function() {}
				}, {
					size: 2,
					callback: function() {}
				}]), undefined,
				'Multiple events mapped successfully.'
			);
		}
	});
});