define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	require('script/wee.data.js');

	registerSuite({
		'data.request': function() {
			//var dfd = this.async(1000),
			//	dfd2 = this.async(1000);
			//
			//Wee.data.request({
			//	url: 'sample.json',
			//	json: true,
			//	failed: function(data) {
			//		dfd.callback(function(error, data) {
			//			if (error) {
			//				throw error;
			//			}
			//
			//			assert.strictEqual(data.name, 'Wee',
			//				'JSON data requested successfully.'
			//			);
			//		});
			//	}
			//});
			//
			//Wee.data.request({
			//	url: 'sample.json',
			//	json: true,
			//	template: '{{ name }}',
			//	success: function(data) {
			//		dfd.callback(function(error, data) {
			//			if (error) {
			//				throw error;
			//			}
			//
			//			assert.strictEqual(data, 'Wee',
			//				'JSON data requested and rendered successfully.'
			//			);
			//		});
			//	}
			//});
		}
	});
});