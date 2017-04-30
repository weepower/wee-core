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
	const count = routes.length;

	for (let i = 0; i < count; i++) {
		let route = _getRoute(routes[i].path);

		if (route) {
			_routes[route.index] = routes[i];
			break;
		}

		_routes.push(routes[i]);
	}
}

/**
 * Retrieve existing route with associated index
 *
 * @param {string} value
 * @param {string} key
 * @returns {Object}
 * @private
 */
function _getRoute(value) {
	const count = _routes.length;

	for (let i = 0; i < count; i++) {
		if (_routes[i].path === value || _routes[i].name === value) {
			return {
				route: _routes[i],
				index: i
			};
		}
	}

	return null;
}

/**
 * Parse url and return results
 *
 * @private
 * @param {string} value
 * @returns {Object}
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
	/**
	 * Register routes
	 *
	 * @param {Array} routes
	 * @returns {Object}
	 */
	map(routes) {
		_add(routes);

		return this;
	},

	/**
	 * Reset all routes - mainly for testing purposes
	 */
	reset() {
		_routes = [];
	},

	/**
	 * Retrieve all routes or specific route by name/path
	 *
	 * @param {string} [value]
	 * @returns {Object|Array}
	 */
	routes(value) {
		if (value) {
			let result = _getRoute(value);

			if (result) {
				return result.route;
			}
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