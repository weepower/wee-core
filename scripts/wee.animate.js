/* jshint maxparams: 5 */

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

		/**
		 * Process a specific animation property
		 *
		 * @param {HTMLElement} el
		 * @param {string} prop
		 * @param {number} target
		 * @param {object} conf
		 * @param {function} ease
		 */
		process = function(el, prop, target, conf, ease) {
			var scroll = prop == 'scrollTop' || prop == 'scrollLeft',
				bodyScroll = scroll && el === W._body,
				cssValue;

			if (! scroll) {
				cssValue = getComputedStyle(el, null)[prop];
			}

			var css = cssValue !== undefined,
				unit = css && cssValue.slice(-2) == 'px' ? 'px' : '',
				val = parseInt(
					css ?
						cssValue :
						bodyScroll ? (el[prop] || W._html[prop]) : el[prop]
				),
				setValue = function(prop, update) {
					css ?
						el.style[prop] = update + unit :
						el[prop] = update;

					if (bodyScroll) {
						W._html[prop] = update;
					}
				},
				dir = target > val ? 1 : -1,
				dist = Math.abs(target - val),
				start = Date.now(),
				fn = function() {
					var diff = Date.now() - start;

					if (dist && diff < conf.duration) {
						setValue(prop, val + dist * ease(diff / conf.duration) * dir);
						raf(fn);
					} else {
						setValue(prop, target);
						conf.i--;

						if (conf.complete && ! conf.i) {
							W.$exec(conf.complete);
						}
					}
				};

			fn();
		},
		raf;

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
					duration: 400
				}, options),
				ease = easings[conf.ease] || easings.ease;
			conf.i = 0;

			if (! raf) {
				raf = W._win.requestAnimationFrame || function(cb) {
					setTimeout(cb, 15);
				};
			}

			W.$each(target, function(el) {
				for (var prop in values) {
					conf.i++;
					process(el, prop, parseInt(values[prop]), conf, ease);
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