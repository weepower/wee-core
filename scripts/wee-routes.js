import pathToRegExp from 'path-to-regexp';
import { _castString, $isArray, $isFunction, $isString, $isObject } from 'core/types';
import { $exec } from 'core/core';
import { parseLocation } from 'routes/location';
import Handler from 'routes/route-handler';
import { getRouteMap, mapRoutes, resetRouteMap } from 'routes/route-map';
import History from './routes/history';

let _filters = {};
let _history = {};

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
	let run = true;

	if ($isArray(filter)) {
		let length = filter.length;

		for (let i = 0; i < length; i++) {
			run = _processFilter(filter[i], params, uri);

			if (run === false) {
				break;
			}
		}
	} else {
		run = _processFilter(filter, params, uri);
	}

	return run;
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

/**
 * Set base configurations for router
 *
 * @param {Object} config
 */
function router(config = {history: true}) {
	if (config.history) {
		_history = new History();
	}

	return router;
}

/**
 * Add a filter or array of filters to internal filter registry
 *
 * @param {string|Array} name
 * @param {Function} [callback]
 */
router.addFilter = function addFilter(name, callback) {
	if ($isObject(name)) {
		_addFilters(name);
	} else {
		_addFilter(name, callback)
	}

	return this;
}

/**
 * Retrieve current route
 *
 * @returns {Object}
 */
router.currentRoute = function currentRoute() {
	return _history.current;
}

/**
 * Return all registered filters
 *
 * @returns {Object}
 */
router.filters = function filters() {
	return _filters;
}

// TODO: Change map to register
/**
 * Register routes
 *
 * @param {Array} routes
 * @returns {Object}
 */
router.map = function routerMap(routes) {
	mapRoutes(routes);

	// Ensure we are on the current URL/evaluate routes
	_history.navigate(this.uri().full);

	return this;
}

/**
 * Reset all routes and filters - mainly for testing purposes
 */
router.reset = function reset() {
	resetRouteMap();
}

/**
 * Retrieve all routes or specific route by name/path
 *
 * @param {string} [value]
 * @param {string} keyType
 * @returns {Object|Array}
 */
router.routes = function routes(key, keyType = 'path') {
	let routeMaps = getRouteMap();
	let map;

	if (keyType === 'path') {
		map = routeMaps.pathMap;
	} else if (keyType === 'name') {
		map = routeMaps.nameMap;
	} else {
		return null;
	}

	if (key) {
		return map[key];
	}

	return map;
}

// TODO: Perhaps break out location methods into own module
/**
 * Retrieve the current path's segments as an array or segment by index
 *
 * @param index
 * @returns {Array|string}
 */
router.segments = function uriSegments(index) {
	const segments = this.uri().segments;

	if (index >= 0 && segments[index]) {
		return segments[index];
	}

	return segments;
}

/**
 * Retrieve information about current location
 *
 * @param {string} [value]
 * @returns {Object}
 */
router.uri = function uri(value) {
	return parseLocation(value);
}

export default router;
export const RouteHandler = Handler;