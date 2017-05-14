import { $unserialize } from 'core/types';
import { _doc } from 'core/variables';
const REMOVE_SLASHES_REGEXP = /^\/|\/$/g;

/**
 * Parse url and return results
 *
 * @param {string} [value]
 * @returns {Object}
 * @private
 */
export function parseLocation(value) {
	const a = _doc.createElement('a');
	a.href = value || window.location;

	const search = a.search;
	const path = a.pathname.replace(REMOVE_SLASHES_REGEXP, '');

	return {
		full: '/' + path + search + a.hash,
		hash: a.hash.slice(1),
		path: '/' + path,
		query: search ? $unserialize(search) : {},
		segments: path.split('/'),
		url: a.href,
		port: a.port
	};
}