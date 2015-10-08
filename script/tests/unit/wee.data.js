define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	require('script/wee.data.js');

	registerSuite({
		name: 'Wee Data',

		'data.request': {
			'get': function() {
				var promise = this.async(100, 3);

				Wee.data.request({
					url: '/$root/node_modules/wee-core/script/tests/sample-files/sample.json',
					success: promise.callback(function() {
						assert.isTrue(Wee.$get('sampleJsLoaded'),
							'Sample file was not loaded successfully'
						);
					})
				});
			},
			'get & render': function() {
				var promise = this.async(100, 3);

				Wee.data.request({
					url: '/$root/node_modules/wee-core/script/tests/sample-files/sample.json',
					template: '{{person.firstName}}',
					success: promise.callback(function(data) {
						assert.strictEqual(data, 'Don',
							'Data was not retrieved or rendered successfully'
						);
					})
				});
			},
			'post with data': function() {
				assert.isTrue(false);
			},
			'JSONP': function() {
				assert.isTrue(false);
			}
		}
	});
});
