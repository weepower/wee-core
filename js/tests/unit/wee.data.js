define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert');

	require('temp/core.min.js');

	registerSuite({
		name: 'Data',

		'request': {
			'get': function() {
				var promise = this.async(1000);

				// TODO: File path is relative to wee-core. Need solution that
				// TODO: uses conditional path that works with Browsersync as well.
				Wee.data.request({
					url: '/js/tests/sample-files/sample.json',
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
