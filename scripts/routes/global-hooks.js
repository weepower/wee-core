let beforeEach = [];
let afterEach = [];
let onError = [];

/**
 * Add beforeEach function to registry
 *
 * @param {function} fn
 */
export function addBeforeEach(fn) {
    beforeEach.push(fn);
}

/**
 * Add beforeEach function to registry
 *
 * @param {function} fn
 */
export function addAfterEach(fn) {
    afterEach.push(fn);
}

/**
 * Add onError function to registry
 *
 * @param {function} fn
 */
export function addOnError(fn) {
    onError.push(fn);
}

/**
 * Get all registered functions
 *
 * @returns {Object}
 */
export function getHooks() {
    return {
        beforeEach,
        afterEach,
    };
}

/**
 * Get all registered error handlers
 *
 * @returns {Array}
 */
export function getErrorHandlers() {
    return onError;
}

/**
 * Reset all hooks
 */
export function resetHooks() {
    beforeEach = [];
    afterEach = [];
    onError = [];
}
