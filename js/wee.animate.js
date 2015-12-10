(function(W) {
	'use strict';

	/**
	 * Default easing functions
	 */
	var easings = {
			ease: function(t) {
				return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
			},
			linear: function(t) {
				return t;
			}
		},
		timers = [];

	W.animate = {
		/**
		 * Transition an attribute or property value
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {object} values
		 * @param {object} [options]
		 * @param {(Array|function|string)} [options.complete]
		 * @param {number} [options.duration=400]
		 * @param {string} [options.ease='ease']
		 */
		tween: function(target, values, options) {
			var conf = W.$extend({
					duration: 400,
					ease: 'ease'
				}, options),
				ease = easings[conf.ease] || easings.ease;

			W.$each(target, function(el) {
				for (var prop in values) {
					var target = parseInt(values[prop]),
						cssValue;

					if ((prop == 'scrollTop' || prop == 'scrollLeft') &&
						el === W._body && ! W._win.atob
					) {
						el = W._html;
					} else {
						cssValue = getComputedStyle(el, null)[prop];
					}

					var	css = cssValue !== undefined,
						unit = css && cssValue.slice(-2) == 'px' ? 'px' : '',
						val = parseInt(css ? cssValue : el[prop]),
						setValue = function(prop, update) {
							css ?
								el.style[prop] = update + unit :
								el[prop] = update;
						},
						start = Date.now(),
						fn = (function() {
							var scope = this,
								diff = Date.now() - scope.start;

							if (scope.dist && diff < conf.duration) {
								setValue(
									scope.prop,
									scope.val + scope.dist *
										ease(diff / conf.duration) * scope.dir
								);
							} else {
								clearInterval(timers[scope.prop + scope.start]);
								setValue(scope.prop, scope.target);

								if (conf.complete) {
									W.$exec(conf.complete);
								}
							}
						}).bind({
							dir: target > val ? 1 : -1,
							dist: Math.abs(target - val),
							prop: prop,
							start: start,
							target: target,
							val: val
						});

					timers[prop + start] = setInterval(fn, 10);
				}
			});
		},

		/**
		 * Add additional easing function(s)
		 *
		 * @param {(object|string)} a - name or easing object
		 * @param {function} [b] - easing function
		 */
		addEasing: function(a, b) {
			W._extend(easings, a, b);
		}
	};
})(Wee);