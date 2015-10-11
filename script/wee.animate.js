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
	};

	W.fn.make('animate', {
		/**
		 * Transition to a specified attribute or property value
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {object} props
		 * @param {object} [options]
		 * @param {number} [options.duration=400]
		 * @param {string} [options.ease='ease']
		 */
		tween: function(target, props, options) {
			var conf = W.$extend({
					duration: 400,
					ease: 'ease'
				}, options),
				ease = easings[conf.ease] || easings.ease;

			W.$each(target, function(el) {
				for (var prop in props) {
					var target = parseInt(props[prop]),
						scrollTop = prop == 'scrollTop',
						cssValue;

					// Patch scrollTop in IE9- browsers
					if (scrollTop && ! W._win.atob) {
						el = W._doc.documentElement;
						cssValue = el.scrollTop;
					} else {
						cssValue = W._legacy ?
							el.currentStyle[prop] :
							getComputedStyle(el, null)[prop];
					}

					var	css = cssValue !== undefined,
						unit = css && cssValue.slice(-2) == 'px' ? 'px' : '',
						val = parseInt(css ? cssValue : el[prop]),
						dist = Math.abs(target - val),
						dir = target > val ? 1 : -1,
						start = Date.now(),
						setValue = function(prop, update) {
							if (scrollTop && ! W._win.atob) {
								el.scrollTop = update;
							} else {
								css ?
									el.style[prop] = update + unit:
									el[prop] = update;
							}
						},
						si = setInterval(function() {
							var diff = Date.now() - start;

							if (dist && diff < conf.duration) {
								setValue(
									prop,
									val + dist * ease(diff / conf.duration) * dir
								);
							} else {
								clearInterval(si);
								setValue(prop, target);

								if (conf.complete) {
									W.$exec(conf.complete);
								}
							}
						}, 5);
				}
			});
		},

		/**
		 * Add additional easing function
		 *
		 * @param {(object|string}} name or easing object
		 * @param {function} [fn]
		 */
		addEasing: function(name, fn) {
			W._extend(easings, name, fn);
		}
	});
})(Wee);