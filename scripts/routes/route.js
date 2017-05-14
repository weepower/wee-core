/**
 * Aggregate meta properties from many route records
 *
 * @param {Array} records
 * @returns {Object}
 * @private
 */
function _getMetaFromRecords(records) {
	const meta = {};
	const count = records.length;
	let i = 0;

	for (; i < count; i++) {
		const recordMeta = records[i].meta;

		Object.keys(recordMeta).forEach(prop => {
			meta[prop] = recordMeta[prop];
		});
	}

	return meta;
}

export const START = createRoute({ path: '/' });

/**
 * Create final immutable route object
 *
 * @param {Object} location
 * @returns {Object}
 */
export function createRoute(location) {
	if (! location.matches) {
		location.matches = [];
	}

	const route = {
		name: location.matches.length === 1 ? location.matches[0].name : null,
		meta: _getMetaFromRecords(location.matches),
		path: location.path,
		hash: location.hash,
		query: location.query,
		segments: location.segments,
		params: location.params || {},
		full: location.full,
		matches: location.matches
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
export function isSameRoute(newRoute, oldRoute) {
	if (oldRoute === START) {
		return newRoute === oldRoute;
	}

	return newRoute.full === oldRoute.full;
}