/**
 * Print warning to console if under development and condition is not met
 *
 * @param {*} condition
 * @param {string} message
 */
export function warn (message) {
	if (process.env.NODE_ENV !== 'production') {
		typeof console.warn(`[wee-routes] ${message}`);
	}
}