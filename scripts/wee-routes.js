import pathToRegExp from 'path-to-regexp';
import { _castString, $isArray, $isFunction, $isString, $isObject, $unserialize } from 'core/types';
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
	for (let filter in filters) {
		if (filters.hasOwnProperty(filter)) {
			_addFilter(filter, filters[filter]);
		}
	}
}

/**
 * Evaluate filter
 *
 * @param [Function|string] filter
 * @returns {boolean}
 * @private
 */
function _processFilter(filter) {
	if ($isString(filter) && _filters[filter]) {
		return $exec(_filters[filter]);
	}

	return $exec(filter);
}

/**
 * Process filters
 *
 * @param filter
 * @returns {boolean}
 * @private
 */
function _processFilters(filter) {
	let shouldExec = true;

	if ($isArray(filter)) {
		let length = filter.length;

		for (let i = 0; i < length; i++) {
			shouldExec = _processFilter(filter[i]);

			if (shouldExec === false) {
				break;
			}
		}
	} else {
		shouldExec = _processFilter(filter);
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
 * Process the handler
 *
 * @param handler
 * @param params
 * @private
 */
function _process(handler, params) {
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
					shouldExec = _processFilters(route.filter);
				}

				if (shouldExec) {
					let handler = route.handler;

					if ($isArray(handler)) {
						handler.forEach(h => _process(h, params));
					} else {
						_process(handler, params);
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
		if ($isObject(name)) {
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