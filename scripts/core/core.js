import { $isFunction, $toArray } from 'core/types';

export const isBrowser = typeof window === 'object';

let env;

/**
 * Extend object storage with object or key -> val
 *
 * @protected
 * @param {object} obj
 * @param {(object|string)} a
 * @param {*} [b]
 */
const _extend = (obj, a, b) => {
	let val = a;

	if (typeof a == 'string') {
		val = [];
		val[a] = b;
	}

	_extend(obj, val);
};

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