(function(W) {
	'use strict';

	W.fn.make('animate', {
		_construct: function() {
			this.easing = {
				linear: function(val, target, rem) {
					return val;
				},
				swing: function(val, target, rem) {

				}
			}
		},

		/**
		 *
		 * @param target
		 * @param props
		 * @param opt
		 */
		tween: function(target, props, opt) {
			var scope = this,
				conf = W.$extend({
					complete: false,
					duration: 400,
					easing: 'swing'
				}, opt);

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