import pathToRegExp from 'path-to-regexp';
import { _castString, $isArray, $isFunction, $isString, $isObject } from 'core/types';
import { $exec } from 'core/core';
import { parseLocation } from 'routes/location';
import Handler from 'routes/route-handler';
import { getRouteMap, mapRoutes, resetRouteMap } from 'routes/route-map';
import History from './routes/history';

let _history = new History();

/**
 * Set base configurations for router
 *
 * @param {Object} config
 */
function router(config = {}) {
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