import { $each, $setRef, $sel } from 'core/dom';
import { $extend, $isObject, $isString, $toArray } from 'core/types';
import { $exec } from 'core/core';
import { _doc } from 'core/variables';

let custom = {};
let bound = [];

function _bind(els, obj, options) {
	// Redefine variables when delegating
	if (options && options.delegate) {
		options.targ = els;
		els = options.delegate;
	}

	// For each element attach events
	$each(els, el => {
		// Loop through object events
		for (let key in obj) {
			let evts = key.split(' ');
			let	i = 0;

			for (; i < evts.length; i++) {
				let conf = $extend({
						args: [],
						once: false,
						scope: el
					}, options);
				let	fn = obj[key];
				let	evt = evts[i];
				let	ev = evt;
				let	parts = ev.split('.');
				let	f = fn;
				evt = parts[0];

				if (parts.length == 1 && conf.namespace) {
					ev += '.' + conf.namespace;
				}

				// Prepend element to callback arguments if necessary
				if (conf.args[1] !== el) {
					conf.args.unshift(0, el);
				}

				(function(el, evt, fn, f, conf) {
					let cb = e => {
						let cont = true;
						conf.args[0] = e;

						// If watch within ancestor make sure the target
						// matches the selector
						if (conf.targ) {
							let targ = conf.targ;
							let	sel = targ._$ ? targ.sel : targ;

							// Update refs when targeting ref
							if ($isString(sel) &&
								sel.indexOf('ref:') > -1) {
								$setRef(el);
							}

							cont = $toArray($sel(sel)).some(el => el.contains(e.target) && (targ = el));

							// Ensure element argument is the target
							conf.args[1] = conf.scope = targ;
						}

						if (cont) {
							$exec(fn, conf);

							// Unbind after first execution
							if (conf.once) {
								_off(el, evt, f);
							}
						}
					};

					// Ensure the specified element, event, and function
					// combination hasn't already been bound
					if (evt != 'init' && ! _bound(el, ev, f, conf.targ).length) {
						// Determine if the event is native or custom
						if ('on' + evt in el) {
							el.addEventListener(evt, cb, false);
						} else if (custom[evt]) {
							custom[evt][0](el, fn, conf);
						}

						bound.push({
							el: el,
							ev: ev,
							evt: evt,
							cb: cb,
							fn: f,
							targ: conf.targ
						});
					}

					if (evt == 'init' || conf.init === true) {
						cb();
					}
				})(el, evt, fn, f, conf);
			}
		}
	}, options);
}

/**
 * Detach event(s) from element
 *
 * @private
 * @param {(HTMLElement|string)} [sel]
 * @param {string} [evt]
 * @param {function} [fn]
 */
function _off(sel, evt, fn) {
	$each(_bound(sel, evt, fn), e => {
		if ('on' + e.evt in _doc) {
			e.el.removeEventListener(e.evt, e.cb);
		} else if (custom[e.evt]) {
			custom[e.evt][1](e.el, e.cb);
		}

		bound.splice(bound.indexOf(e), 1);
	});
}

function _bound(target, event, fn, delegateTarg) {
	let segs = (event || '').split('.');
	let	matches = [];
	target = target || [0];

	$each(target, el => {
		Object.keys(bound).forEach(e => {
			let binding = bound[e];
			let	parts = binding.ev.split('.');
			let	match = true;

			if (el && el !== binding.el) {
				match = false;
			}

			if (event &&
				(
					segs[0] !== '' &&
					segs[0] != parts[0]
				) ||
				(
					segs[1] &&
					segs[1] != parts[1]
				)) {
				match = false;
			}

			if (fn && String(fn) !== String(binding.fn)) {
				match = false;
			}

			// If delegated event, check against target element
			if ((delegateTarg && binding.targ) && delegateTarg.sel !== binding.targ.sel) {
				match = false;
			}

			if (match) {
				matches.push(binding);
			}
		});
	});

	return target ? matches : bound;
}

export default {
	/**
	 * Bind event function to element
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
	on(target, a, b, c) {
		let evts = [];

		if ($isObject(target) && ! target._$) {
			let keys = Object.keys(target);
			let	i = 0;

			for (; i < keys.length; i++) {
				let key = keys[i];
				evts = target[key];

				_bind(key, evts, a);
			}
		} else {
			if ($isString(a)) {
				evts[a] = b;
			} else {
				evts = a;
				c = b;
			}

			_bind(target, evts, c);
		}
	},

	/**
	 * Remove specified event from specified element
	 *
	 * @param {(HTMLElement|string)} [target]
	 * @param {(object|string)} a - event name or object of events
	 * @param {function} [b] - specific function to remove
	 */
	off(target, a, b) {
		let obj = a;

		if (! target && ! a) {
			bound = [];
			custom = {};
			return;
		}

		if (a) {
			if ($isString(a)) {
				obj = [];
				obj[a] = b;
			}

			for (let key in obj) {
				let evts = key.split(' ');
				let	i = 0;

				for (; i < evts.length; i++) {
					let evt = evts[i];
					let fn = obj[evt];

					_off(target, evt, fn);
				}
			}
		} else {
			_off(target);
		}
	},

	/**
	 * Get currently bound events to optional specified element and event|function
	 *
	 * @param {(boolean|HTMLElement|string)} [target]
	 * @param {string} [event] - event name to match
	 * @param {function} [fn] - specific function to match
	 * @param {HTMLElement} [delegateTarg] - targets of delegated event
	 * @returns {Array} matches
	 */
	bound(target, event, fn, delegateTarg) {
		return _bound(target, event, fn, delegateTarg);
	},

	/**
	 * Execute bound event for each matching selection
	 *
	 * @param {(HTMLElement|string)} target
	 * @param {string} name
	 */
	trigger(target, name) {
		let fn = function() {};

		_bound(target, name).forEach(e => {
			e.cb({
				target: e.el,
				preventDefault: fn,
				stopPropagation: fn
			});
		});
	},

	/**
	 * Add a custom event
	 *
	 * @param {string} name
	 * @param {function} on
	 * @param {function} off
	 */
	addEvent(name, on, off) {
		custom[name] = [on, off];
	}
}