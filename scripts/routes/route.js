const TRAILING_SLASH = /\/?$/;

/**
 * Find all ancestor routes
 *
 * @param {Object} record
 * @returns {Array}
 */
function _createMatched(record) {
	let result = [];

	while (record) {
		result.unshift(record);
		record = record.parent;
	}

	return result;
}

export const START = createRoute({ path: '/' });

/**
 * Create final immutable route object
 *
 * @param {Object} location
 * @param {Object} record
 * @returns {Object}
 */
export function createRoute(location, record = {}) {
	const route = {
		name: record.name,
		meta: record.meta || {},
		path: location.path,
		hash: location.hash,
		query: location.query,
		segments: location.segments,
		params: location.params || {},
		full: location.full,
		matched: _createMatched(record)
	};

	return Object.freeze(route);
}

/**
 * Compare route equality
 *
 * @param {Object} a - route to be compared
 * @param {Object} b - route to be compared
 * @returns {boolean}
 */
export function isSameRoute(a, b) {
	if (b === START) {
		return a === b;
	}

	return a.full === b.full;
}