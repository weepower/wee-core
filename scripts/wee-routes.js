import { $unserialize } from 'core/types';
import { _doc } from 'core/variables';

const PARAMETER_REGEXP = /([:*])(\w+)/g;
const WILDCARD_REGEXP = /\*/g;
const REPLACE_VARIABLE_REGEXP = '([^\/]+)';
const REPLACE_WILDCARD = '(?:.*)';
const FOLLOWED_BY_SLASH_REGEXP = '(?:\/$|$)';
const MATCH_REGEXP_FLAGS = '';
const REMOVE_SLASHES_REGEXP = /^\/|\/$/g;
let _routes = [];

/**
 * Add a route to routes array
 *
 * @private
 * @param routes
 */
function _add(routes) {
	routes.forEach(route => {
		_routes.push(route);
	});
}

/**
 * Parse url and return results
 *
 * @private
 * @param value
 * @returns {{full: string, hash: (Blob|string|*|ArrayBuffer|Array.<T>|$), path: string, query: {}, segments: Array, url: (*|Location|String|string), port}}
 * @private
 */
function _parseUrl(value) {
	const a = _doc.createElement('a');
	a.href = value || window.location;

	const search = a.search,
		path = a.pathname.replace(REMOVE_SLASHES_REGEXP, '');

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

export default {
	map(routes) {
		_add(routes);

		return this;
	},
	routes(index) {
		if (index && _routes[index]) {
			return _routes[index];
		}

		return _routes;
	},
	run() {
		//
	},
	uri(value) {
		return _parseUrl(value);
	}
};