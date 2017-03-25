import { $exec } from '../core/core';
import { $isFunction } from '../core/types';
import { $each } from '../core/dom';

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