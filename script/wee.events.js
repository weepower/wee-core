/* jshint maxparams: 5 */

(function(W) {
	'use strict';

	W.fn.make('events', {
		/**
		 * Bind specified function to specified element and event
		 *
		 * @param {(HTMLElement|object|string)} target
		 * @param {(object|string)} a - event name or object of events
		 * @param {(function|object)} [b] - event callback or options object
		 * @param {(object|string)} [c] - event options
		 * @param {Array} [c.args] - callback arguments
		 * @param {(HTMLElement|string)} [c.context=document]
		 * @param {(HTMLElement|string)} [c.delegate]
		 * @param {boolean} [c.once=false] - remove event after first execution
		 * @param {object} [c.scope]
		 */
		on: function(target, a, b, c) {
			var evts = [];

			if (W.$isObject(target) && ! target._$) {
				var keys = Object.keys(target),
					i = 0;

				for (; i < keys.length; i++) {
					var key = keys[i];
					evts = target[key];

					this.$private.bind(key, evts, a);
				}
			} else {
				if (typeof a == 'string') {
					evts[a] = b;
				} else {
					evts = a;
					c = b;
				}

				this.$private.bind(target, evts, c);
			}
		},

		/**
		 * Remove specified event from specified element
		 *
		 * @param {(HTMLElement|string)} [target]
		 * @param {(object|string)} a - event name or object of events
		 * @param {function} [b] - specific function to remove
		 */
		off: function(target, a, b) {
			var obj = a;

			if (a) {
				if (typeof a == 'string') {
					obj = [];
					obj[a] = b;
				}

				for (var key in obj) {
					var evts = key.split(' '),
						i = 0;

					for (; i < evts.length; i++) {
						var evt = evts[i],
						fn = obj[evt];

						this.$private.off(target, evt, fn);
					}
				}
			} else {
				this.$private.off(target);
			}
		},

		/**
		 * Get currently bound events to optional specified element and event|function
		 *
		 * @param {(HTMLElement|string)} [target]
		 * @param {string} [event] - event name to match
		 * @param {function} [fn] - specific function to match
		 * @returns {Array} matches
		 */
		bound: function(target, event, fn) {
			var bound = this.$get('evts', []),
				matches = [];
			target = target || [0];

			W.$each(target, function(el) {
				for (var e in bound) {
					var binding = bound[e];

					if (
						(
							el &&
							el !== binding.el
						) ||
						(
							event &&
							! new RegExp('^' + event).test(binding.ev) &&
							! new RegExp(event + '$').test(binding.ev)
						) ||
						(
							fn &&
							String(fn) !== String(binding.fn)
						)
					) {
						continue;
					}

					matches.push(binding);
				}
			});

			return matches;
		},

		/**
		 * Execute bound event for each matching selection
		 *
		 * @param {(HTMLElement|string)} target
		 * @param {string} name
		 */
		trigger: function(target, name) {
			this.bound(target, name).forEach(function(evt) {
				evt.cb();
			});
		},

		/**
		 * Add a custom event
		 *
		 * @param {string} name
		 * @param {function} on
		 * @param {function} off
		 */
		addEvent: function(name, on, off) {
			this.$private.custom[name] = [on, off];
		}
	}, {
		custom: {},

		/**
		 * Attach specific event logic to element
		 *
		 * @param {Array} els
		 * @param {object} obj
		 * @param {object} options
		 */
		bind: function(els, obj, options) {
			var scope = this;

			// Redefine variables when delegating
			if (options && options.delegate) {
				options.targ = els;
				els = options.delegate;
			}

			// For each element attach events
			W.$each(els, function(el) {
				// Loop through object events
				for (var key in obj) {
					var evts = key.split(' '),
						i = 0;

					for (; i < evts.length; i++) {
						var conf = W.$extend({
								args: [],
								once: false,
								scope: el
							}, options),
							fn = obj[key],
							evt = evts[i],
							ev = evt,
							f = fn;
						evt = evt.split('.')[0];

						// Prepend element to callback arguments if necessary
						if (conf.args[1] !== el) {
							conf.args.unshift(0, el);
						}

						(function(el, evt, fn, f, conf) {
							var cb = function(e) {
								var cont = true;

								if (W._legacy || ! e) {
									e = W._win.event || {};
									e.target = e.srcElement;

									e.preventDefault = function() {
										e.returnValue = false;
									};

									e.stopPropagation = function() {
										e.cancelBubble = true;
									};
								}

								conf.args[0] = e;

								// If watch within parent make sure the target
								// matches the selector
								if (conf.targ) {
									var targ = conf.targ,
										sel = targ._$ ? targ.sel : targ;

									// Update refs when targeting ref
									if (sel.indexOf('ref:') > -1) {
										W.$setRef(el);
									}

									targ = W.$toArray(W.$(sel));

									if (! targ.some(function(el) {
										return el.contains(e.target);
									})) {
										cont = false;
									}

									// Ensure element argument is the target
									conf.args[1] = e.target;
								}

								if (cont) {
									W.$exec(fn, conf);

									// Unbind after first execution
									if (conf.once) {
										scope.$public.off(el, evt, f);
									}
								}
							};

							// Ensure the specified element, event, and function
							// combination hasn't already been bound
							if (evt != 'init' && ! scope.$public.bound(el, ev, f).length) {
								// Determine if the event is native or custom
								if ('on' + evt in W._win) {
									W._legacy ?
										el.attachEvent('on' + evt, cb) :
										el.addEventListener(evt, cb, false);
								}

								scope.$push('evts', {
									el: el,
									ev: ev,
									evt: evt,
									cb: cb,
									fn: f
								});
							}

							if (evt == 'init' || conf.init === true) {
								cb();
							}
						})(el, evt, fn, f, conf);
					}
				}
			});
		},

		/**
		 * Detach event(s) from element
		 *
		 * @param {(HTMLElement|string)} [sel]
		 * @param {string} [evt]
		 * @param {function} [fn]
		 */
		off: function(sel, evt, fn) {
			var scope = this;

			W.$each(this.$public.bound(sel, evt, fn), function(e, i) {
				if ('on' + e.evt in W._doc) {
					W._legacy ?
						e.el.detachEvent('on' + e.evt, e.cb) :
						e.el.removeEventListener(e.evt, e.cb);
				}

				scope.$get('evts').splice(i, 1);
			});
		}
	});
})(Wee);