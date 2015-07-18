define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	registerSuite({
		'{{name}}': function() {
			var string = 'string';

			assert.equal(string, 'string',
				'The variable matches correctly.'
			);
		}
	});
});