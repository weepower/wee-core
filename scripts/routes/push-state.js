import { _win } from 'core/variables';
import { genTimeKey } from './key';
import { saveScrollPosition } from './scroll';

let _key = genTimeKey();

export const supportsPushState = _win.history && _win.history.pushState;

/**
 * Get state key
 *
 * @returns {string}
 */
export function getStateKey() {
	return _key;
}

/**
 * Set state key
 *
 * @param {string} key
 */
export function setStateKey(key) {
	_key = key;
}

/**
 * Either replace existing History entry or add new entry
 *
 * @param {string} url
 * @param {boolean} replace=false
 */
export function pushState(url, replace = false) {
	// Save scroll position for current URL before navigating elsewhere
	saveScrollPosition();

	try {
		if (replace) {
			_win.history.replaceState({ key: _key }, '', url);
		} else {
			_key = genTimeKey();
			_win.history.pushState({ key: _key }, '', url);
		}
	} catch(e) {
		// Fallback if something goes wrong
		let win = _win;

		if (this && this.location) {
			win = this;
		}

		win.location[replace ? 'replace' : 'assign'](url);
	}
}

/**
 * Replace entry in History
 *
 * @param {string} url
 */
export function replaceState(url) {
	pushState(url, true);
}