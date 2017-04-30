import { _$, _body, _doc, _html, _win, U } from './variables';
import { $exec } from './core';
import { _extend, _slice, $toArray } from './types';

let range,
	refs = {};

/**
 * Check if a node contains another node
 *
 * @private
 * @param {HTMLElement} source
 * @param {HTMLElement} target
 * @returns {boolean} match
 */
function _contains(source, target) {
	return (source === _doc ? _html : source)
		.contains(target);
}

/**
 * Convert selection to array
 *
 * @param {($|HTMLElement|string)} selector
 * @param {object} [options]
 * @param {(HTMLElement|string)} [options.context=document]
 * @returns {($|Array)} nodes
 */
export function _selArray(selector, options) {
	if (selector && selector._$) {
		return selector;
	}

	options = options || {};

	let el = typeof selector == 'string' ?
		$sel(selector, options.context) :
		selector;

	return $toArray(el);
}

/**
 * Get matches to specified selector or return parsed HTML
 *
 * @param {($|HTMLElement|string)} selector
 * @param {($|HTMLElement|string)} [context=document]
 * @returns {Array} elements
 */
export function $sel(selector, context) {
	let el = null,
		ref = [];

	if (typeof selector !== 'string') {
		el = selector;
	} else {
		if (selector === 'window') {
			return [_win];
		}

		if (selector === 'document') {
			return [_doc];
		}

		// Return nothing if context doesn't exist
		context = context !== U ? $sel(context)[0] : _doc;

		if (! context) {
			return ref;
		}

		// Check for pre-cached elements
		if (selector.indexOf(':') === 0 || selector.indexOf('ref:') > -1) {
			let split = selector.split(',').filter(function(sel) {
				sel = sel.trim();

				if (sel.slice(0, 1) === ':') {
					sel = sel.slice(1);
				} else if (sel.slice(0, 4) === 'ref:') {
					sel = sel.slice(4);
				} else {
					return true;
				}

				sel = refs[sel];

				// Apply context filter if not document
				if (sel) {
					ref = ref.concat(
						context === _doc ?
							sel :
							sel.filter(function(el) {
								return _contains(context, el);
							})
					);
				}

				return false;
			});

			if (split.length) {
				selector = split.join(',');
			} else {
				return ref;
			}
		}

		// Use third-party selector engine if defined
		if (_win.WeeSelector !== U) {
			el = _win.WeeSelector(selector, context);
		} else if (/^[#.]?[\w-]+$/.test(selector)) {
			let pre = selector[0];

			if (pre == '#') {
				el = _doc.getElementById(selector.substr(1));
			} else if (pre == '.') {
				el = context.getElementsByClassName(selector.substr(1));
			} else {
				el = context.getElementsByTagName(selector);
			}
		} else {
			try {
				el = context.querySelectorAll(selector);
			} catch (e) {
				el = $parseHTML(selector).childNodes;
			}
		}
	}

	if (! el) {
		el = ref;
	} else if (el.nodeType !== U || el === _win) {
		el = [el];
	} else {
		el = _slice.call(el);
	}

	// Join references if available
	return ref.length ? el.concat(ref) : el;
}

/**
 * Execute function for each matching selection
 *
 * @param {($|Array|HTMLElement|string)} target
 * @param {function} fn
 * @param {Object} [options]
 * @param {Array} [options.args]
 * @param {($|HTMLElement|string)} [options.context=document]
 * @param {boolean} [options.reverse=false]
 * @param {Object} [options.scope]
 */
export function $each(target, fn, options) {
	if (target) {
		let conf = _extend({
				args: []
			}, options),
			els = _selArray(target, conf),
			i = 0;

		if (conf.reverse && ! els._$) {
			els = els.reverse();
		}

		for (; i < els.length; i++) {
			let el = els[i],
				val = $exec(fn, {
					args: [el, i].concat(conf.args),
					scope: conf.scope || el
				});

			if (val === false) {
				return;
			}
		}
	}
}

/**
 * Translate items in an array or selection to new array
 *
 * @param {($|Array|HTMLElement|string)} target - array or selector
 * @param {function} fn
 * @param {object} [options]
 * @param {Array} [options.args]
 * @param {object} [options.scope]
 * @returns {Array}
 */
export function $map(target, fn, options) {
	if (! Array.isArray(target)) {
		target = _selArray(target, options);
	}

	let conf = _extend({
			args: []
		}, options),
		res = [],
		i = 0;

	for (; i < target.length; i++) {
		let el = target[i],
			val = $exec(fn, {
				args: [el, i].concat(conf.args),
				scope: conf.scope || el
			});

		if (val !== false) {
			res.push(val);
		}
	}

	return res;
}

/**
 * Create document fragment from an HTML string
 *
 * @param {string} html
 * @returns {HTMLElement} element
 */
export function $parseHTML(html) {
	html = html.trim();

	if (! range) {
		range = _doc.createRange();
		range.selectNode(_body);
	}

	return range.createContextualFragment(html);
}

/**
 * Execute specified function when document is ready
 *
 * @param {(Array|function|string)} fn
 */
/**
* Execute specified function when document is ready
*
* @param {(Array|function|string)} fn
*/
export function $ready(fn) {
	let doc = _doc;

	// This is for testing only
	if (this && this.readyState) {
		doc = this;
	}

	doc.readyState === 'complete' ?
		$exec(fn) :
		doc.addEventListener('DOMContentLoaded', () => {
			$exec(fn);
		});
}

/**
 * Add ref elements to datastore
 *
 * @param {(HTMLElement|string)} [context=document]
 */
export function $setRef(context) {
	context = context ? $sel(context)[0] : _doc;

	// Clear existing refs if reset
	Object.keys(refs).forEach(function(val) {
		refs[val] = refs[val].filter(function(el) {
			return ! (
				! _contains(_doc, el) ||
				(_contains(context, el) && context !== el)
			);
		});
	});

	// Set refs from DOM
	$each('[data-ref]', function(el) {
		el.getAttribute('data-ref').split(/\s+/)
			.forEach(function(val) {
				refs[val] = refs[val] || [];
				refs[val].push(el);
			});
	}, {
		context: context
	});
}

/**
 * Create new array with only unique values from source array
 *
 * @param {Array} array
 * @returns {Array} unique values
 */
export function $unique(array) {
	return array.reverse().filter((el, i, arr) => {
		return arr.indexOf(el, i + 1) < 0;
	}).reverse();
}