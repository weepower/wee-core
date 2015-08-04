(function(W) {
	'use strict';

	W.fn.make('animate', {
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
					duration: 400,
					ease: 'ease'
				}, options),
				ease = scope.$private.easings[conf.ease];

			if (ease) {
				W.$each(target, function(el) {
					for (var prop in props) {
						var target = parseInt(props[prop]),
							cssValue = W._legacy ?
								el.currentStyle[prop] :
								getComputedStyle(el, null)[prop],
							css = cssValue !== undefined,
							start = parseInt(css ? cssValue : el[prop]);

						scope.$private.update({
							el: el,
							css: css,
							prop: prop,
							ease: ease,
							targ: target,
							len: conf.duration,
							dir: target > start ? 1 : -1,
							fn: conf.complete,
							val: start,
							time: Date.now()
						});
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
		 * Define default easing functions
		 *
		 * @param {number} time
		 */
		easings: {
			ease: function(t) {
				return (t < .5 ? 2 * t : -1 + (4 - 2 * t)) * t;
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
		},

		/**
		 * Iterate an attribute or property value based on a given easing
		 *
		 * @param {object} obj
		 * @param obj.el
		 * @param obj.css
		 * @param obj.prop
		 * @param obj.ease
		 * @param obj.targ
		 * @param obj.dir
		 * @param obj.fn
		 * @param obj.len
		 * @param obj.time
		 */
		update: function(obj) {
			var scope = this,
				rem = Math.abs(obj.targ) - Math.abs(obj.val);

			if (rem <= 0) {
				if (obj.fn) {
					W.$exec(obj.fn);
				}
			} else {
				var time = (Date.now() - obj.time) / obj.len;
				obj.val = obj.val + (obj.ease(time) * rem);
console.log(obj.val);
				obj.val = obj.dir > 0 ?
					Math.floor(obj.val) * 1 :
					Math.ceil(obj.val) * -1;

				obj.css ?
					obj.el.style[obj.prop] = obj.val + 'px' :
					obj.el[obj.prop] = obj.val;

				setTimeout(function() {
					scope.update(obj);
				}, 20);
			}
		}
	});
})(Wee);