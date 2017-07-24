/**
 * Print warning to console if under development and condition is not met
 *
 * @param {*} condition
 * @param {string} module
 * @param {string} message
 */
export function warn(module, message) {
	if (process.env.NODE_ENV !== 'production') {
		typeof console.warn(`[wee-${module}] ${message}`);
	}
}