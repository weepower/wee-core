define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee'),
		el;

	require('js/wee.screen.js');

	registerSuite({
		name: 'Screen',

		setup: function() {
			el = document.createElement('style');
			el.textContent = 'html {font-family: "5"}';

			document.getElementsByTagName('head')[0].appendChild(el);
		},

		teardown: function() {
			document.getElementsByTagName('head')[0].removeChild(el);
		},

		size: function() {
			assert.strictEqual(Wee.screen.size(), 5,
				'Screen size should return 5'
			);
		},

		map: function() {
			// TODO: Complete
			assert.strictEqual(Wee.screen.map({
					size: 1,
					callback: function() {}
				}), undefined,
				'Single event was not mapped successfully'
			);

			assert.strictEqual(Wee.screen.map([{
					size: 1,
					callback: function() {}
				}, {
					size: 2,
					callback: function() {}
				}]), undefined,
				'Multiple events were not mapped successfully'
			);
		}
	});
});