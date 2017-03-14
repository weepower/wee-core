import { _extend, $isFunction, $toArray, $type } from 'core/types';
import { _slice } from 'core/variables';

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
const _val = (val, options) => {
	return $isFunction(val) ?
		$exec(val, options) :
		val;
};

/**
 * Get current environment or set current environment against
 * specified object
 *
 * @param {Object} [rules]
 * @param {string} [fallback=local]
 * @returns {string} environment
 */
export const $env = (rules, fallback = 'local') => {
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
};

/**
 * Determine if the current environment is SSL encrypted
 *
 * @returns {boolean} secure
 */
export const $envSecure = () => {
	return location.protocol == 'https:';
};

/**
 * Reset env variable - used for testing
 */
export const $envReset = () => {
	env = undefined;
};

/**
 * Execute specified function or array of functions
 *
 * @param {Array|function} fn
 * @param {Object} [options]
 * @param {Array} [options.args]
 * @param {Object} [options.scope]
 * @returns {*} [response]
 */
export const $exec = (fn, options = {}) => {
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
};