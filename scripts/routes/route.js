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

/**
 * Check top level object equality
 *
 * @param {Object} a
 * @param {Object} b
 * @returns {boolean}
 * @private
 */
function _isObjectEqual (a = {}, b = {}) {
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);

	if (aKeys.length !== bKeys.length) {
		return false
	}

	return aKeys.every(key => String(a[key]) === String(b[key]));
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
 * @param {Object} newRoute
 * @param {Object} oldRoute
 * @returns {boolean}
 */
export function isSameRoute(a, b) {
	if (b === START) {
		return a === b;
	} else if (! b) {
		return false;
	} else if (a.path && b.path) {
		return (
			a.path.replace(TRAILING_SLASH, '') === b.path.replace(TRAILING_SLASH, '') &&
			a.hash === b.hash &&
			_isObjectEqual(a.query, b.query)
		)
	} else {
		return false;
	}

	return a.full === b.full;
}