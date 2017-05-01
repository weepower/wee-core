import pathToRegExp from 'path-to-regexp';
import { _castString, $isArray, $isFunction, $isString, $unserialize } from 'core/types';
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
 * Add a filter to the filter registry
 *
 * @param name
 * @param handler
 * @private
 */
function _addFilter(name, handler) {
	_filters[name] = handler;
}

/**
 * Add multiple filters to filter registry
 * @param filters
 * @private
 */
function _addFilters(filters) {
	filters.forEach(filter => _addFilter(filter.name, filter.handler));
}

/**
 * Evaluate filter
 *
 * @param {Function|string} filter
 * @param {Object|null} params
 * @param {Object} uri
 * @returns {boolean}
 * @private
 */
function _processFilter(filter, params, uri) {
	if ($isString(filter) && _filters[filter]) {
		return $exec(_filters[filter], {
			args: [params, uri]
		});
	}

	return $exec(filter, {
		args: [params, uri]
	});
}

/**
 * Process filters
 *
 * @param {Array|Function|string} filter
 * @param {Object|null} params
 * @param {Object} uri
 * @returns {boolean}
 * @private
 */
function _processFilters(filter, params, uri) {
	let shouldExec = true;

	if ($isArray(filter)) {
		let length = filter.length;

		for (let i = 0; i < length; i++) {
			shouldExec = _processFilter(filter[i], params, uri);

			if (shouldExec === false) {
				break;
			}
		}
	} else {
		shouldExec = _processFilter(filter, params, uri);
	}

	return shouldExec;
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

/**
 * Process matched route
 *
 * @param {RouteHandler|Function} handler
 * @param {Object|null} params
 * @private
 */
function _processRoute(handler, params) {
	if (handler instanceof RouteHandler) {
		$exec(handler.init, {
			// TODO: Need to inspect if route/RouteHandler has already been executed
			args: [params]
		});
	} else if ($isFunction(handler)) {
		$exec(handler, {
			// TODO: Need to inspect if route/RouteHandler has already been executed
			args: [params]
		});
	}
}

// Class to be used as handler for routes
export class RouteHandler {
	constructor(conf) {
		this.init = conf.init;
	}
}

export default {
	/**
	 * Register routes
	 *
	 * @param {Array} routes
	 * @returns {Object}
	 */
	map(routes) {
		_addRoutes(routes);

		return this;
	},

	/**
	 * Reset all routes and filters - mainly for testing purposes
	 */
	reset() {
		_routes = [];
		_filters = {};
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
		let shouldExec = true;

		for (let i = 0; i < length; i++) {
			let route = _routes[i];
			let path = route.path;
			let params = _getParams(path, uri.full);

			if (params) {
				path = pathToRegExp.compile(path)(params);
			}

			// If route matches, execute handler
			if (uri.full === path) {
				if (route.filter) {
					shouldExec = _processFilters(route.filter, params, uri);
				}

				if (shouldExec) {
					let handler = route.handler;

					if ($isArray(handler)) {
						handler.forEach(h => _processRoute(h, params));
					} else {
						_processRoute(handler, params);
					}

					break;
				}
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