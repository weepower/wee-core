import { $exec } from '../core/core';
import { $isFunction } from '../core/types';
import { $each, $map, $parseHTML, $sel, $setRef } from '../core/dom';

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

	$each(target, function(el, i) {
		let cn = _getClass(el),
			name = func ?
				$exec(value, {
					args: [i, cn],
					scope: el
				}) :
				value;

		if (name) {
			let names = cn.split(' '),
				upd = name.split(' ').filter(function(val) {
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

	$each(target, function(el, i) {
		let aft = func ?
			$exec(source, {
				args: [i, el.innerHTML],
				scope: el
			}) :
			source;

		if (typeof aft == 'string') {
			aft = $sel(aft);
		}

		if (aft) {
			let par = el.parentNode;

			$each(aft, function(cel) {
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
 * Clone each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @returns {Array}
 */
export function $clone(target) {
	return $map(target, function(el) {
		return el.cloneNode(true);
	});
}

/**
 * Remove each matching selection from the document
 *
 * @param {($|HTMLElement|string)} target
 * @param {($|HTMLElement|string)} [context=document]
 */
export function $remove(target, context) {
	let arr = [];

	$each(target, function(el) {
		let par = el.parentNode;

		arr.push(el);

		par.removeChild(el);

		$setRef(par);
	}, {
		context: context
	});

	return arr;
}