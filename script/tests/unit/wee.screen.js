define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	require('script/wee.screen.js');

	registerSuite({
		name: 'Screen',

		setup: function() {
			Wee.$html('head',
				'<style id="style"> html { font-family: "5"; } </style>'
			);
		},

		teardown: function() {
			Wee.$remove('#style');
		},

		size: function() {
			assert.strictEqual(Wee.screen.size(), 5,
				'Screen size was not returned 5 successfully.'
			);
		},

		map: function() {
			assert.strictEqual(Wee.screen.map({
					size: 1,
					callback: function() {}
				}), undefined,
				'Single event was not mapped successfully.'
			);

			assert.strictEqual(Wee.screen.map([{
					size: 1,
					callback: function() {}
				}, {
					size: 2,
					callback: function() {}
				}]), undefined,
				'Multiple events were not mapped successfully.'
			);
		}
	});
});