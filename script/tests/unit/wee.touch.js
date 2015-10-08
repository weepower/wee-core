define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

		require = ('script/wee.touch.js');

		registerSuite({
			name: 'Touch',

			beforeEach: function() {
				var fixtureOne = document.createElement('div');

				fixtureOne.id = 'wee-touch-id';
				fixtureOne.className = 'wee-touch-class';

				document.body.appendChild(fixtureOne);
			},
			afterEach: function() {
				$('#wee-touch-id').remove();
			},
			'swipeLeft': function() {
				$('#wee-touch-id').on('swipeLeft', function() {
					Wee.$addClass($(this), 'wee-touch-class-2');
				});

				Wee.events.trigger('#wee-touch-id', 'swipeLeft');

				assert.ok(Wee.$hasClass('#wee-touch-id', 'wee-touch-class-2'),
					'Swipe Left event was not bound or triggered successfully'
				);
			},
			'swipeRight': function() {
				$('#wee-touch-id').on('swipeRight', function() {
					Wee.$addClass($(this), 'wee-touch-class-2');
				});

				Wee.events.trigger('#wee-touch-id', 'swipeRight');

				assert.ok(Wee.$hasClass('#wee-touch-id', 'wee-touch-class-2'),
					'Swipe Left event was not bound or triggered successfully'
				);
			},
			'swipeUp': function() {
				$('#wee-touch-id').on('swipeUp', function() {
					Wee.$addClass($(this), 'wee-touch-class-2');
				});

				Wee.events.trigger('#wee-touch-id', 'swipeUp');

				assert.ok(Wee.$hasClass('#wee-touch-id', 'wee-touch-class-2'),
					'Swipe Left event was not bound or triggered successfully'
				);
			},
			'swipdeDown': function() {
				$('#wee-touch-id').on('swipeDown', function() {
					Wee.$addClass($(this), 'wee-touch-class-2');
				});

				Wee.events.trigger('#wee-touch-id', 'swipeDown');

				assert.ok(Wee.$hasClass('#wee-touch-id', 'wee-touch-class-2'),
					'Swipe Left event was not bound or triggered successfully'
				);
			}
		});
});