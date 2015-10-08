define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

		require('script/wee.animate.js');
		require('script/wee.dom.js');
		require('script/wee.chain.js');
		require('script/wee.events.js');

		registerSuite({
			name: 'Animate',

			beforeEach: function() {
				var fixtureOne = document.createElement('div');

				fixtureOne.id = 'wee-animate-id';
				fixtureOne.className = 'wee-animate-class';

				document.body.appendChild(fixtureOne);
			},
			afterEach: function() {
				$('#wee-animate-id').remove();
			},
			'tween': function() {
				var promise = this.async(100, 3);

				$('#wee-animate-id').on('click', function() {
					Wee.animate.tween(this, {
						height: 200,
						complete: promise.callback(function() {
							// ...
						})
					});
				});

				Wee.events.trigger('#wee-animate-id', 'click');
			},
			'addEasing': function() {
				var promise = this.async(100, 3);

				$('#wee-animate-id').on('click', function() {
					Wee.animate.addEasing(this, {
						height: 200,
						complete: promise.callback(function() {
							// ...
						})
					});
				});

				Wee.events.trigger('#wee-animate-id', 'click');
			},
			'extend': function() {
				// ...
			}

		});
});
