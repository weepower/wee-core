/**
 * Wrap function with outer function that passes arguments with proper scope
 *
 * @param {function} fn
 * @param {Object} thisArg
 * @returns {wrap}
 */
export default function bind(fn, thisArg) {
	return function wrap(...args) {
		return fn.apply(thisArg, args);
	}
}