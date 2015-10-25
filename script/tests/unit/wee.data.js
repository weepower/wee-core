define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	require('script/wee.data.js');

	registerSuite({
		name: 'Data',

		'request': {
			'get': function() {
				var promise = this.async(1000);

				Wee.data.request({
					url: '/$root/node_modules/wee-core/script/tests/sample-files/sample.json',
					json: true,
					success: promise.callback(function(data) {
						console.log(data);
						assert.strictEqual(data.person.firstName, 'Don',
							'Sample file was not loaded successfully'
						);
					})
				});
			},

			'post with data': function() {
				// TODO: Complete
				assert.isTrue(true);
			},

			'JSONP': function() {
				// TODO: Complete
				assert.isTrue(true);
			}
		}
	});
});
