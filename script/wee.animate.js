(function(W) {
	'use strict';

	W.fn.make('animate', {
		/**
		 * Define default easing functions
		 */
		easing: {
			linear: function(val, target, rem) {
				return val;
			},
			swing: function(val, target, rem) {

			}
		},

		/**
		 * Transition to a specified attribute or property value
		 *
		 * @param target
		 * @param {object} props
		 * @param {object} options
		 */
		tween: function(target, props, options) {
			var scope = this,
				conf = W.$extend({
					complete: false,
					duration: 400,
					easing: 'swing'
				}, options);

			W.$each(target, function(el) {
				for (var prop in props) {
					var target = parseInt(props[prop]),
						cssValue = W._legacy ?
							el.currentStyle[prop] :
							getComputedStyle(el, null)[prop],
						css = cssValue !== undefined;

					el.current = parseInt(css ? cssValue : el[prop]);

					var steps = 100,
						interval = conf.duration / steps,
						dir = target > el.current ? 1 : -1;

					el.interval = setInterval(function() {
						scope.$private.update(el, css, prop, target, dir, conf.complete);
					}, interval);
				}
			});
		}
	}, {
		/**
		 * Iterate an attribute or property value based on a given easing
		 *
		 * @param el
		 * @param css
		 * @param prop
		 * @param target
		 * @param dir
		 * @param complete
		 */
		update: function(el, css, prop, target, dir, complete) {
			var val = el.current;

			if ((val * dir) >= target) {
				clearInterval(el.interval);

				if (complete) {
					Wee.$exec(complete);
				}
			} else {
				val = val + (10 * dir);

				if (css) {
					el.style[prop] = val + 'px';
				} else {
					el[prop] = val;
				}

				el.current = val;
			}
		}
	});
})(Wee);