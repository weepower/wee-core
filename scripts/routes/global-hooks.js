let beforeEach = [];
let afterEach = [];

/**
 * Add beforeEach function to registry
 *
 * @param {function} fn
 */
export function addBeforeEach(fn) {
	beforeEach.push(fn);
}

/**
 * Get all registered functions
 *
 * @returns {Object}
 */
export function getHooks() {
	return {
		beforeEach,
		afterEach
	};
}

/**
 * Reset all hooks
 */
export function resetHooks() {
	beforeEach = [];
	afterEach = [];
}