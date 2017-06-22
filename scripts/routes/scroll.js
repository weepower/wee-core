import { _win } from 'core/variables';
import { getStateKey } from './push-state';
import { $isObject } from 'core/types';
import { _doc } from 'core/variables';
import { $sel } from 'core/dom';
import { $scrollLeft, $scrollTop } from 'dom/index';

let positionStore = {};

export function _getPositionStore() {
	return positionStore;
}

/**
 * Scroll based on scrollBehavior evaluation
 *
 * @param {Object} to
 * @param {Object} from
 * @param {boolean} isPop
 */
export function handleScroll(to, from, behavior, isPop = false) {
	const shouldScroll = behavior(to, from, isPop ? getScrollPosition() : null);
	let position = shouldScroll;

	if ($isObject(shouldScroll) && shouldScroll.el) {
		position = getElementPosition(shouldScroll.el);
	}

	if (position) {
		let el = position.el ? position.el.parentNode : _win;

		$scrollLeft(el, position.x);
		$scrollTop(el, position.y);
	}
}

/**
 * Get x and y position of element
 *
 * @param {$|HTMLElement|string} sel
 * @returns {*}
 */
export function getElementPosition(sel) {
	let el;

	// Use typeof instead of $isObject - $isObject will evaluate false for DOM node
	if (typeof sel === 'object') {
		el = sel.sel ? sel[0] : sel;
	} else {
		el = _doc.querySelector(sel);
	}

	if (! el) {
		return false;
	}

	if (el === _win) {
		const docEl = _doc.documentElement;
		const docRect = docEl.getBoundingClientRect();
		const elRect = el.getBoundingClientRect();

		return {
			el,
			x: elRect.left - docRect.left,
			y: elRect.top - docRect.top
		};
	} else {
		return {
			el,
			x: el.offsetLeft,
			y: el.offsetTop
		};
	}

}

/**
 * Get scroll position
 *
 * @returns {*}
 */
export function getScrollPosition() {
	const key = getStateKey();

	if (key) {
		return positionStore[key];
	}
}

/**
 * Save current scroll position
 */
export function saveScrollPosition() {
	const key = getStateKey();

	if (key) {
		positionStore[key] = {
			x: _win.pageXOffset,
			y: _win.pageYOffset
		};
	}
}