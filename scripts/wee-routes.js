import pathToRegExp from 'path-to-regexp';
import { _castString, $isArray, $unserialize } from 'core/types';
import { _doc } from 'core/variables';
import { $exec } from 'core/core';

const REMOVE_SLASHES_REGEXP = /^\/|\/$/g;
let _routes = [];
let _filters = {};

/**
 * Add a route to routes array
 *
 * @param routes
 * @private
 */
function _addRoutes(routes) {
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
		let route = _routes[i];

		if (route.path === value || route.name === value) {
			return {
				route: route,
				index: i
			};
		}
	}

	return null;
}

/**
 * Parse url and return results
 *
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

/**
 * Extract parameters from current URL based on matching route
 *
 * @param {string} path
 * @param {string} location
 * @returns {Object}
 * @private
 */
function _getParams(path, location) {
	let keys = [],
		params = {},
		results = pathToRegExp(path, keys).exec(location);

	if ($isArray(results)) {
		results.slice(1)
			.forEach((segment, j) => params[keys[j].name] = _castString(segment));
	}

	return Object.keys(params).length ? params : null;
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
		const uri = this.uri();
		const length = _routes.length;

		for (let i = 0; i < length; i++) {
			let path = _routes[i].path;
			let params = _getParams(path, uri.full);

			if (params) {
				let toPath = pathToRegExp.compile(path);
				path = toPath(params);
			}

			if (uri.full === path) {
				$exec(_routes[i].handler, {
					args: [params]
				});
				break;
			}
		}
	},

	/**
	 * Retrieve information about current location
	 *
	 * @param {string} [value]
	 * @returns {Object}
	 */
	uri(value) {
		return _parseUrl(value);
	},

	/**
	 * Add a filter or array of filters to internal filter registry
	 *
	 * @param {string|Array} name
	 * @param {Function} [callback]
	 */
	addFilter(name, callback) {
		if ($isArray(name)) {
			_addFilters(name);
		} else {
			_addFilter(name, callback)
		}

		return this;
	},

	/**
	 * Return all registered filters
	 * 
	 * @returns {{}}
	 */
	filters() {
		return _filters;
	}
};