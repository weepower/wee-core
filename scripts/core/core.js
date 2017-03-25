import { _extend, _slice, $isFunction, $toArray, $type } from './types';

export const isBrowser = typeof window === 'object';

let env;

/**
 * Get value from function or directly
 *
 * @private
 * @param {*} val
 * @param {Object} [options]
 * @returns {*}
 */
function _val(val, options) {
	return $isFunction(val) ?
		$exec(val, options) :
		val;
}

/**
 * Get current environment or set current environment against
 * specified object
 *
 * @param {Object} [rules]
 * @param {string} [fallback=local]
 * @returns {string} environment
 */
export function $env(rules, fallback = 'local') {
	if (rules) {
		let host = location.hostname;

		for (let rule in rules) {
			let val = rules[rule];

			if (val == host || _val(val, {
					args: host
				}) === true) {
				env = rule;
				break;
			}
		}

		if (! env) {
			env = fallback;
		}
	}

	return env || fallback;
}

/**
 * Determine if the current environment is SSL encrypted
 *
 * @returns {boolean} secure
 */
export function $envSecure() {
	return location.protocol == 'https:';
}

/**
 * Reset env variable - used for testing
 */
export function $envReset() {
	env = undefined;
}

/**
 * Execute specified function or array of functions
 *
 * @param {Array|function} fn
 * @param {Object} [options]
 * @param {Array} [options.args]
 * @param {Object} [options.scope]
 * @returns {*} [response]
 */
export function $exec(fn, options = {}) {
	let fns = $toArray(fn),
		len = fns.length,
		i = 0,
		response;

	for (; i < len; i++) {
		let conf = _extend({
				args: []
			}, options);

		response = fns[i].apply(
			conf.scope,
			$toArray(conf.args)
		);

		if (len === 1) {
			return response;
		}
	}
}