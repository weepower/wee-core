define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		el;

	require('temp/core.min.js');

	registerSuite({
		name: 'Animate',

		beforeEach: function() {
			el = document.createElement('div');

			el.id = 'container';
			el.className = 'js-container';

			document.body.appendChild(el);
		},

		afterEach: function() {
			el.parentNode.removeChild(el);
		},

		tween: function() {
			var promise = this.async(1000),
				$el = Wee.$(el);

			Wee.animate.tween($el, {
				height: 100
			}, {
				complete: promise.callback(function() {
					assert.equal(Wee.$height($el), 100,
						'The container height should equal 100.'
					);
				})
			});
		},

		addEasing: function() {
			var promise = this.async(1000),
				$el = Wee.$(el);

			Wee.animate.addEasing('custom', function(t) {
				return t / 2;
			});

			Wee.animate.tween($el, {
				height: 200
			}, {
				easing: 'custom',
				complete: promise.callback(function() {
					assert.equal(Wee.$height($el), 200,
						'The container height should equal 200.'
					);
				})
			});
		}
	});
});
