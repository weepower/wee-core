import { $exec } from '../core/core';
import { _slice, $extend, $isFunction, $isObject } from '../core/types';
import { _html, U } from '../core/variables';
import { $each, $map, $parseHTML, $sel, $setRef, $unique } from '../core/dom';

/**
 * Get class value of element
 *
 * @private
 * @param {HTMLElement} el
 * @returns {string}
 */
function _getClass(el) {
	return el instanceof SVGElement ?
		el.getAttribute('class') :
		el.className;
}

/**
 * Set class value of element
 *
 * @private
 * @param {HTMLElement} el
 * @param {string} className
 */
function _setClass(el, className) {
	el instanceof SVGElement ?
		el.setAttribute('class', className) :
		el.className = className;
}

/**
 * Add classes to each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {(function|string)} value
 */
export function $addClass(target, value) {
	let func = $isFunction(value);

	$each(target, (el, i) => {
		let cn = _getClass(el),
			name = func ?
				$exec(value, {
					args: [i, cn],
					scope: el
				}) :
				value;

		if (name) {
			let names = cn.split(' '),
				upd = name.split(' ').filter(val => {
					return names.indexOf(val) < 0;
				});

			upd.unshift(cn);

			_setClass(el, upd.join(' '));
		}
	});
}

/**
 * Insert selection or markup after each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {($|function|HTMLElement|string)} source
 * @param {boolean} [remove=false]
 */
export function $after(target, source, remove) {
	const func = $isFunction(source);

	$each(target, (el, i) => {
		let aft = func ?
			$exec(source, {
				args: [i, el.innerHTML],
				scope: el
			}) :
			source;

		if (typeof aft == 'string') {
			aft = $parseHTML(aft);
		}

		if (aft) {
			let par = el.parentNode;

			$each(aft, cel => {
				if (i > 0) {
					cel = $clone(cel)[0];
				}

				par.insertBefore(cel, el.nextSibling);

				$setRef(par);
			}, {
				reverse: true
			});
		}

		if (remove) {
			$remove(el);
		}
	});
}

/**
 * Append selection or markup after each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {($|function|HTMLElement|string)} source
 */
export function $append(target, source) {
	let func = $isFunction(source);

	$each(target, (el, i) => {
		let app = func ?
			$exec(source, {
				args: [i, el.innerHTML],
				scope: el
			}) :
			source;

		if (typeof app == 'string') {
			app = $parseHTML(app);
		}

		if (app) {
			$each(app, cel => {
				el.appendChild(cel);
			});

			$setRef(el);
		}
	});
}

/**
 * Get attribute of first matching selection or set attribute
 * of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param a
 * @param b
 * @returns {(string|undefined)}
 */
export function $attr(target, a, b) {
	let obj = $isObject(a);

	if (b !== U || obj) {
		let func = ! obj && $isFunction(b);

		$each(target, function(el, i) {
			obj ?
				Object.keys(a).forEach(function(key) {
					el.setAttribute(key, a[key]);
				}) :
				el.setAttribute(a, func ?
					$exec(b, {
						args: [i, el],
						scope: el
					}) :
					b
				);
		});
	} else {
		return $sel(target)[0].getAttribute(a);
	}
}

/**
 * Insert selection or markup before each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {($|function|HTMLElement|string)} source
 * @param {boolean} [remove=false]
 */
export function $before(target, source, remove) {
	let func = $isFunction(source);

	$each(target, function(el, i) {
		let bef = func ?
			$exec(source, {
				args: [i, el.innerHTML],
				scope: el
			}) :
			source;

		if (typeof bef == 'string') {
			bef = $parseHTML(bef);
		}

		if (bef) {
			let par = el.parentNode;

			$each(bef, function(cel) {
				if (i > 0) {
					cel = $clone(cel)[0];
				}

				par.insertBefore(cel, el);

				$setRef(par);
			}, {
				reverse: true
			});
		}

		if (remove) {
			$remove(el);
		}
	});
}

/**
 * Get unique direct children of each matching selection
 *
 * @param {($|HTMLElement|string)} parent
 * @param filter
 * @returns {Array}
 */
export function $children(parent, filter) {
	let arr = [];

	$each(parent, function(el) {
		let children = _slice.call(el.children);

		arr = arr.concat(
			filter ?
				$filter(children, filter) :
				children
		);
	});

	return $unique(arr);
}

/**
 * Clone each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @returns {Array}
 */
export function $clone(target) {
	return $map(target, el => {
		return el.cloneNode(true);
	});
}

/**
 * Get unique closest ancestors of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param filter
 * @param context
 * @returns {HTMLElement|boolean}
 */
export function $closest(target, filter, context) {
	return $unique($map(target, function(el) {
		if ($is(el, filter)) {
			return el;
		}

		while (el !== null) {
			el = el.parentNode;

			if (el === _html || el === document) {
				return false;
			}

			if ($is(el, filter)) {
				return el;
			}
		}
	}, {
		context: context
	}));
}

/**
 * Determine if any matching parent contains descendant selection
 *
 * @param {($|HTMLElement|string)} parent
 * @param descendant
 * @returns {boolean}
 */
export function $contains(parent, descendant) {
	let b = false;

	$each(parent, function(el) {
		if ($sel(descendant, el).length) {
			b = true;
			return false;
		}
	});

	return b;
}

/**
 * Get unique content of each matching selection
 *
 * @param {($|HTMLElement|string)} parent
 * @returns {Array}
 */
export function $contents(parent) {
	let arr = [];

	$each(parent, el => {
		arr = arr.concat(_slice.call(el.childNodes));
	});

	return $unique(arr);
}

/**
 * Return a filtered subset of elements from a matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param filter
 * @param [options]
 * @returns {Array} elements
 */
export function $filter(target, filter, options) {
	let func = $isFunction(filter);

	return $map(target, function(el, i) {
		let match = func ?
			$exec(filter, {
				args: [i, el],
				scope: el
			}) :
			$is(el, filter, options);

		return match ? el : false;
	});
}

/**
 * Determine if at least one matching selection matches
 * a specified criteria
 *
 * @param {($|HTMLElement|string)} target
 * @param filter
 * @param [options]
 * @returns {boolean}
 */
export function $is(target, filter, options) {
	return $map(target, function(el, i) {
			if (typeof filter == 'string' && filter.slice(0, 4) == 'ref:') {
				return $sel(filter).indexOf(el) > -1;
			}

			if ($isObject(filter)) {
				for (let key in filter) {
					if (filter[key] === el) {
						return true;
					}
				}

				return false;
			}

			if (Array.isArray(filter)) {
				return filter.indexOf(el) > -1;
			}

			if ($isFunction(filter)) {
				return $exec(filter, $extend({
					args: [i, el],
					scope: el
				}, options));
			}

			return (
				el.matches ||
				el.msMatchesSelector ||
				el.webkitMatchesSelector ||
				el.mozMatchesSelector
			).call(el, filter);
		}).length > 0;
}

/**
 * Remove each matching selection from the document
 *
 * @param {($|HTMLElement|string)} target
 * @param {($|HTMLElement|string)} [context=document]
 */
export function $remove(target, context) {
	let arr = [];

	$each(target, el => {
		let par = el.parentNode;

		arr.push(el);

		par.removeChild(el);

		$setRef(par);
	}, {
		context: context
	});

	return arr;
}