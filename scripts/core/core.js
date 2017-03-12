import { _extend, $isFunction, $toArray, $type } from 'core/types';
import { _slice } from 'core/variables';

export const isBrowser = typeof window === 'object';

let env;

/**
 * Get value from function or directly
 *
 * @private
 * @param {*} val
 * @param {object} [options]
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
 * @param {object} [rules]
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
 * @param {array|function} fn
 * @param {object} [options]
 * @param {array} [options.args]
 * @param {object} [options.scope]
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

/**
 * Extend target object with source object(s)
 *
 * @param {(boolean|object)} deep - extend nested properties else target object
 * @param {object} [obj] - target object
 * @param {...object} [obj] - merged objects
 * @returns {object}
 */
export const $extend = function (deep) {
	let bool = typeof deep == 'boolean',
		args = _slice.call(arguments).slice(bool ? 1 : 0),
		target = args[0] || {};
	deep = bool ? deep : false;

	args.slice(1).forEach(function(source) {
		target = _extend(target, source, deep);
	});

	return target;
};