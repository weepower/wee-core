define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert');

	require('js/wee');
	require('js/wee.data');

	registerSuite({
		name: 'Data',

		'request': {
			'get': function() {
				var promise = this.async(1000);

				Wee.data.request({
					url: '/$root/node_modules/wee-core/js/tests/sample-files/sample.json',
					json: true,
					success: promise.callback(function(data) {
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
