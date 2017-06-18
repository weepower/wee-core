import { parseLocation } from 'routes/location';
import Handler from 'routes/route-handler';
import { getRouteMap, mapRoutes, resetRouteMap, setNotFound } from 'routes/route-map';
import History from './routes/history';
import { addAfterEach, addBeforeEach, resetHooks } from './routes/global-hooks';
import pjax from './routes/pjax';
import { $ready } from 'core/dom';

export let history = new History();
let hasPjax = false;
let settings = {
	onError() {}
};

/**
 * Set base configurations for router
 *
 * @param {Object} config
 * @returns {router}
 */
function router(config = {}) {
	return router;
}

/**
 * Register global after hook
 *
 * @param {Function} fn
 * @returns {router}
 */
router.afterEach = function registerAfterEach(fn) {
	addAfterEach(fn);

	return this;
}

/**
 * Register global before hook
 *
 * @param {Function} fn
 * @returns {router}
 */
router.beforeEach = function registerBeforeEach(fn) {
	addBeforeEach(fn);

	return this;
};

/**
 * Retrieve current route
 *
 * @returns {Object}
 */
router.currentRoute = function currentRoute() {
	return history.current;
}

// TODO: Change map to register
/**
 * Register routes
 *
 * @param {Array} routes
 * @returns {router}
 */
router.map = function routerMap(routes) {
	mapRoutes(routes);

	return this;
}

/**
 * Set the catch all route that is matched if no other routes match
 *
 * @param {Object} route
 * @returns {router}
 */
router.notFound = function notFound(route) {
	route.path = '*';
	route.name = 'notFound';

	setNotFound(route);

	return this;
}

/**
 * Configure and initialize pjax navigation
 *
 * @param {Object} config
 * @returns {router}
 */
router.pjax = function initPjax(config = {}) {
	// Prevent initializing pjax multiple times
	if (! hasPjax) {
		hasPjax = pjax.init(config);

		if (hasPjax) {
			// Prep pjax after initialization of routes
			this.onReady(() => {
				pjax.onTrigger = function onPjaxTrigger(destination) {
					// TODO: Handle PJAX specific errors here? history.push returns promise
					history.push(destination);
				};

				history.begin = pjax.go;
				history.replacePage = pjax.replace;
			});
		}
	}

	return this;
}

/**
 * Register onError method
 *
 * @param {Function} error
 */
router.onError = function onError(error) {
	settings.onError = error;

	return this;
}

/**
 * Register callbacks to be executed on ready
 *
 * @param {Function} success
 */
router.onReady = function onReady(success) {
	history.onReady(success);

	return this;
}

/**
 * Navigate to URL and add item to history
 *
 * @param {string|Object} path
 * @returns {*}
 */
router.push = function push(path) {
	return history.push(path);
}

/**
 * Navigate to URL and add item to history
 *
 * @param {string|Object} path
 * @returns {*}
 */
router.replace = function replace(path) {
	return history.replace(path);
}

/**
 * Reset all routes - mainly for testing purposes
 */
router.reset = function reset() {
	resetRouteMap();
	resetHooks();
	hasPjax = false;
	pjax.reset();
	window.removeEventListener('popstate', history.popstate);
	history = new History();
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

	if (key) {
		if (routeMaps.pathMap.hasOwnProperty(key)) {
			return routeMaps.pathMap[key];
		} else if (routeMaps.nameMap.hasOwnProperty(key)) {
			return routeMaps.nameMap[key];
		} else {
			return null;
		}
	}

	if (keyType === 'path') {
		map = routeMaps.pathMap;
	} else if (keyType === 'name') {
		map = routeMaps.nameMap;
	} else if (keyType === 'list') {
		map = routeMaps.pathList;
	}

	return map;
}

/**
 * Evaluate mapped routes against current or provided URL
 *
 * @returns {router}
 */
router.run = function runRoutes() {
	// Process routes when document is loaded
	$ready(() => {
		history.navigate(this.uri().fullPath)
			.catch(settings.onError);
	});

	return this;

	// TODO: This is going to set the state of the current route in history
	// TODO: I don't think that will be desirable
	// TODO: Do we need a way to evaluate routes without changing history state?
	// const { pathMap, nameMap } = getRouteMap();
	//
	// if (pathMap[value]) {
	// 	history.navigate(value);
	// } else if (nameMap[value]) {
	// 	history.navigate(value);
	// }
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