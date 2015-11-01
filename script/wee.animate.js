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
		 * @param {object} props
		 * @param {object} [options]
		 * @param {number} [options.duration=400]
		 * @param {string} [options.ease='ease']
		 * @param {(Array|function|string)} [options.complete]
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

					if (scrollTop) {
						cssValue = Math.max(
							W._body.scrollTop,
							W._doc.documentElement.scrollTop
						).toString();
					} else {
						cssValue = W._legacy ?
							el.currentStyle[prop] :
							getComputedStyle(el, null)[prop];
					}

					var	css = cssValue !== undefined,
						unit = css && cssValue.slice(-2) == 'px' ? 'px' : '',
						val = parseInt(css ? cssValue : el[prop]),
						setValue = function(prop, update) {
							if (scrollTop) {
								W._body.scrollTop = update;
								W._doc.documentElement.scrollTop = update;
							} else {
								css ?
									el.style[prop] = update + unit :
									el[prop] = update;
							}
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

					timers[prop + start] = setInterval(fn, 5);
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
	};
})(Wee);