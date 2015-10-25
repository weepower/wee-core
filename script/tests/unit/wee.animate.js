define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	require('script/wee.dom.js');
	require('script/wee.animate.js');

	registerSuite({
		name: 'Animate',

		beforeEach: function() {
			var container = document.createElement('div');

			container.id = 'container';
			container.className = 'js-container';

			document.body.appendChild(container);
		},

		afterEach: function() {
			Wee.$remove('#container');
		},

		tween: function() {
			var promise = this.async(1000),
				$el = Wee.$('#container');

			Wee.animate.tween($el, {
				height: 100
			}, {
				complete: promise.callback(function() {
					assert.equal(Wee.$height($el), 100,
						'The container height is equal to 100.'
					);
				})
			});
		},

		addEasing: function() {
			var promise = this.async(1000),
				$el = Wee.$('#container');

			Wee.animate.addEasing('custom', function(t) {
				return t / 2;
			});

			Wee.animate.tween('#container', {
				height: 200
			}, {
				easing: 'custom',
				complete: promise.callback(function() {
					assert.equal(Wee.$height($el), 200,
						'The container height is equal to 200.'
					);
				})
			});
		}
	});
});
