define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		el;

	require('temp/core-test.js');

	registerSuite({
		name: 'Touch',

		beforeEach: function() {
			el = document.createElement('div');

			el.id = 'wee';
			el.className = 'js-wee';

			document.body.appendChild(el);
		},

		afterEach: function() {
			el.parentNode.removeChild(el);
		},

		swipeLeft: function() {
			Wee.events.on(el, 'swipeLeft', function() {
				Wee.$addClass(this, 'test');
			});

			Wee.events.trigger(el, 'swipeLeft');

			assert.ok(Wee.$hasClass(el, 'test'),
				'Swipe left event was not bound or triggered successfully'
			);
		},

		swipeRight: function() {
			Wee.events.on(el, 'swipeRight', function() {
				Wee.$addClass(this, 'test');
			});

			Wee.events.trigger(el, 'swipeRight');

			assert.ok(Wee.$hasClass(el, 'test'),
				'Swipe right event was not bound or triggered successfully'
			);
		},

		swipeUp: function() {
			Wee.events.on(el, 'swipeUp', function() {
				Wee.$addClass(this, 'test');
			});

			Wee.events.trigger(el, 'swipeUp');

			assert.ok(Wee.$hasClass(el, 'test'),
				'Swipe up event was not bound or triggered successfully'
			);
		},

		swipdeDown: function() {
			Wee.events.on(el, 'swipeDown', function() {
				Wee.$addClass(this, 'test');
			});

			Wee.events.trigger(el, 'swipeDown');

			assert.ok(Wee.$hasClass(el, 'test'),
				'Swipe down event was not bound or triggered successfully'
			);
		}
	});
});