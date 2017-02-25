define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		el;

	require('js/tests/support/exports.js');

	registerSuite({
		name: 'Animate',

		beforeEach: function() {
			el = document.createElement('div');

			el.id = 'container';
			el.className = 'js-container';

			document.body.appendChild(el);

			$el = $(el);
		},

		afterEach: function() {
			el.parentNode.removeChild(el);
		},

		tween: {
			simple: function() {
				var promise = this.async(1000);

				$el.tween({
					height: 100
				}, {
					complete: promise.callback(function() {
						assert.strictEqual($el.attr('style'), 'height: 100px;',
							'The container height should equal 100.'
						);
					})
				});
			},

			advanced: function() {
				var promise = this.async(2000);
				var num = 0;

				$el.tween({
					height: 200,
					marginTop: 150
				}, {
					duration: 500,
					ease: 'linear',
					complete: promise.callback(function() {
						num++;
						
						assert.strictEqual(num, 1,
							'Function did not execute correctly ("num" should equal 2)'
						);

						assert.strictEqual($el.height(), 200,
							'Container height should equal 200'
						);
						
						assert.strictEqual($el.css('marginTop'), '150px',
							'The container margin-top should equal 150.'
						);
					})
				});
			}
		},

		easing: function() {
			var promise = this.async(1000),
				$el = Wee.$(el);

			Wee.animate.tween($el, {
				height: 200
			}, {
				ease: 'linear',
				complete: promise.callback(function() {
					assert.equal(Wee.$height($el), 200,
						'The container height should equal 200.'
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
				ease: 'custom',
				complete: promise.callback(function() {
					assert.equal(Wee.$height($el), 200,
						'The container height should equal 200.'
					);
				})
			});
		}
	});
});
