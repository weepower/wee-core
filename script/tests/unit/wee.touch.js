define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

		require = ('script/wee.touch.js');

		registerSuite({
			name: 'Touch',

			beforeEach: function() {
				var container = document.createElement('div');

				container.id = 'container';
				container.className = 'js-container';

				document.body.appendChild(container);
			},

			afterEach: function() {
				Wee.$remove('#container');
			},

			swipeLeft: function() {
				var $el = Wee.$('#container');

				Wee.events.on($el, 'swipeLeft', function() {
					Wee.$addClass(this, 'wee-touch-class-2');
				});

				Wee.events.trigger($el, 'swipeLeft');

				assert.ok(Wee.$hasClass($el, 'wee-touch-class-2'),
					'Swipe Left event was not bound or triggered successfully'
				);
			},

			swipeRight: function() {
				var $el = Wee.$('#container');

				Wee.events.on($el, 'swipeRight', function() {
					Wee.$addClass(this, 'wee-touch-class-2');
				});

				Wee.events.trigger($el, 'swipeRight');

				assert.ok(Wee.$hasClass($el, 'wee-touch-class-2'),
					'Swipe Left event was not bound or triggered successfully'
				);
			},

			swipeUp: function() {
				var $el = Wee.$('#container');

				Wee.events.on($el, 'swipeUp', function() {
					Wee.$addClass(this, 'wee-touch-class-2');
				});

				Wee.events.trigger($el, 'swipeUp');

				assert.ok(Wee.$hasClass($el, 'wee-touch-class-2'),
					'Swipe Left event was not bound or triggered successfully'
				);
			},

			swipdeDown: function() {
				var $el = Wee.$('#container');

				Wee.events.on($el, 'swipeDown', function() {
					Wee.$addClass(this, 'wee-touch-class-2');
				});

				Wee.events.trigger($el, 'swipeDown');

				assert.ok(Wee.$hasClass($el, 'wee-touch-class-2'),
					'Swipe Left event was not bound or triggered successfully'
				);
			}
		});
});