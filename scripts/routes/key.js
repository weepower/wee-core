import { _win } from '../core/variables';

const TIME = _win.performance && _win.performance.now ? _win.performance : Date;

/**
 * Generate key based on timestamp
 *
 * @returns {string}
 */
function genTimeKey() {
	return TIME.now().toFixed(3);
}

/**
 * Generate mock UUID
 *
 * @returns {string}
 */
export function genKey() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}

	return `${s4()}-${s4()}-${s4()}-${s4()}`;
}