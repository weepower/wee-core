import { $isFunction, $toArray, $type } from 'core/types';

export const isBrowser = typeof window === 'object';

let env;

/**
 * Extend target object with source object(s)
 *
 * @private
 * @param {object} target
 * @param {object} object
 * @param {boolean} [deep=false]
 * @param {Array} [_set=[]]
 * @returns object
 */
const _extend = (target, object, deep, _set = []) => {
	if (! object) {
		return target;
	}

	for (let key in object) {
		let src = object[key],
			type = $type(src);

		if (deep && type == 'object') {
			let len = _set.length,
				i = 0,
				val;

			for (; i < len; i++) {
				if (_set[i] === src) {
					val = src;
					break;
				}
			}

			if (val) {
				target[key] = val;
			} else {
				_set.push(src);
				target[key] = _extend(target[key] || {}, src, deep, _set);
			}
		} else if (src !== undefined) {
			target[key] = type == 'array' ? src.slice(0) : src;
		}
	}

	return target;
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