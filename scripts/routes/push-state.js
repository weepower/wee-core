import { _win } from 'core/variables';
import { genTimeKey } from './key';

let _key = genTimeKey();

export const supportsPushState = _win.history && _win.history.pushState;

/**
 * Either replace existing History entry or add new entry
 *
 * @param {string} url
 * @param {boolean} replace=false
 */
export function pushState(url, replace = false) {
	// TODO: Save scroll position when pushState is executed
	// https://github.com/vuejs/vue-router/blob/dev/src/util/push-state.js
	// saveScrollPosition();

	try {
		if (replace) {
			_win.history.replaceState({ key: _key }, '', url);
		} else {
			_key = genTimeKey();
			_win.history.pushState({ key: _key }, '', url);
		}
	} catch(e) {
		// Fallback if something goes wrong
		_win.location[replace ? 'replace' : 'assign'](url);
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