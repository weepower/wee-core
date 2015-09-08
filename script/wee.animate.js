(function(W) {
	'use strict';

	W.fn.make('animate', {
		/**
		 * Transition to a specified attribute or property value
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {object} props
		 * @param {object} [options]
		 * @param {number} [options.duration]
		 * @param {string} [options.ease]
		 */
		tween: function(target, props, options) {
			var conf = W.$extend({
					duration: 400,
					ease: 'ease'
				}, options),
				ease = this.$private.easings[conf.ease];

			if (ease) {
				W.$each(target, function(el) {
					for (var prop in props) {
						var target = parseInt(props[prop]),
							cssValue = W._legacy ?
								el.currentStyle[prop] :
								getComputedStyle(el, null)[prop],
							css = cssValue !== undefined,
							val = parseInt(css ? cssValue : el[prop]),
							dist = Math.abs(target - val),
							dir = target > val ? 1 : -1,
							start = Date.now();

						var setValue = function(prop, update) {
								css ?
									el.style[prop] = update + 'px' :
									el[prop] = update;
							},
							si = setInterval(function() {
								var diff = Date.now() - start;

								if (dist && diff < conf.duration) {
									setValue(prop, val + dist * ease(diff / conf.duration) * dir);
								} else {
									clearInterval(si);

									if (conf.complete) {
										W.$exec(conf.complete);
									}

									setValue(prop, target);
								}
							}, 5);
					}
				});
			}
		},

		/**
		 * Add additional easing function
		 *
		 * @param {string} name
		 * @param {function} fn
		 */
		addEasing: function(name, fn) {
			this.$private.extend(name, fn);
		}
	}, {
		/**
		 * Default easing functions
		 */
		easings: {
			ease: function(t) {
				return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
			},
			linear: function(t) {
				return t;
			}
		},

		/**
		 * Extend easing options
		 *
		 * @param {(object|string)} a
		 * @param {function} b
		 */
		extend: function(a, b) {
			var obj = a;

			if (typeof a == 'string') {
				obj = [];
				obj[a] = b;
			}

			W.$extend(this.easings, obj);
		}
	});
})(Wee);