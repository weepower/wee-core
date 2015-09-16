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
		 * @param {number} [options.duration]
		 * @param {string} [options.ease]
		 */
		tween: function(target, props, options) {
			var conf = W.$extend({
					duration: 400,
					ease: 'ease'
				}, options),
				ease = easings[conf.ease];

			if (! ease) {
				return;
			}

			W.$each(target, function(el) {
				for (var prop in props) {
					var target = parseInt(props[prop]),
						cssValue;

					if (prop == 'scrollTop') {
						var de = Wee._doc.documentElement;

						el = de && de.scrollTop ? de : el;
						cssValue = el.scrollTop;
					} else {
						cssValue = W._legacy ?
							el.currentStyle[prop] :
							getComputedStyle(el, null)[prop];
					}

					var	css = cssValue !== undefined,
						val = parseInt(css ? cssValue : el[prop]),
						dist = Math.abs(target - val),
						dir = target > val ? 1 : -1,
						start = Date.now(),
						setValue = function(prop, update) {
							if (prop == 'scrollTop') {
								el.scrollTop = update;
							} else {
								css ?
									el.style[prop] = update + 'px' :
									el[prop] = update;
							}
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
		},

		/**
		 * Add additional easing function
		 *
		 * @param {string} name
		 * @param {function} fn
		 */
		addEasing: function(name, fn) {
			var obj = name;

			if (typeof name == 'string') {
				obj = [];
				obj[name] = fn;
			}

			W.$extend(easings, obj);
		}
	});
})(Wee);