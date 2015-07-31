define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	registerSuite({
		name: '{{name}}',

		setup: function() {
			// Executes before suite starts
		},

		teardown: function() {
			// Executes after suite ends
		},

		beforeEach: function() {
			// Executes before each test
		},

		afterEach: function() {
			// Executes after each test
		},

		'{{name}} Test': function() {
			var string = 'string';

			assert.equal(string, 'string',
				'The variable matches correctly.'
			);
		}
	});
});