import Handler from 'routes/route-handler';
import { getRouteMap, mapRoutes, resetRouteMap, setNotFound } from 'routes/route-map';
import History from './routes/history';
import { addAfterEach, addBeforeEach, addOnError, getErrorHandlers, resetHooks } from './routes/global-hooks';
import pjax from './routes/pjax';
import { $ready } from 'core/dom';
import { $copy, $extend, $isObject, $toArray } from 'core/types';
import { uri } from 'wee-location';

const defaults = {
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) {
			return savedPosition;
		} else {
			return { x: 0, y: 0 };
		}
	},
	transition: {
		timeout: 0
	}
};
let settings = $copy(defaults);
let hasPjax = false;

export let history = new History(settings);

/**
 * Set base configurations for router
 *
 * @param {Object} config
 * @returns {router}
 */
function router(config = {}) {
	$extend(settings, config);

	// Update scrollBehavior property in case that was changed
	history.scrollBehavior = settings.scrollBehavior;
	history.transition = settings.transition;

	return router;
}

router.settings = settings;

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
 * Register one or more error handlers
 *
 * @param {Function|Array} handlers
 */
router.onError = function addRouterError(handlers) {
	$toArray(handlers).forEach((fn) => addOnError(fn));

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
					history.push(destination)
						.catch((error) => {
							getErrorHandlers().forEach(fn => fn(error));
							pjax.onError(error);
						});
				};

				history.begin = pjax.go;
				history.replacePage = pjax.replace;
			});
		}
	}

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
 * @param {boolean|Object} modifyPjax
 */
router.push = function push(path, modifyPjax = false) {
	if (modifyPjax === true) {
		pjax.pause();
	} else if ($isObject(modifyPjax)) {
		pjax.override(modifyPjax);
	}

	return history.push(path)
		.then(pjax.resume, pjax.resume);
}

/**
 * Navigate to URL and replace item in history
 *
 * @param {string|Object} path
 * @param {boolean|Ojbect} modifyPjax
 */
router.replace = function replace(path, modifyPjax = false) {
	if (modifyPjax === true) {
		pjax.pause();
	} else if ($isObject(modifyPjax)) {
		pjax.override(modifyPjax);
	}

	return history.replace(path)
		.then(pjax.resume, pjax.resume);
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
	settings = $copy(defaults);
	history = new History(settings);
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
	return $ready().then(() => {
		return history.navigate(uri().fullPath)
			.catch((error) => {
				getErrorHandlers().forEach(fn => fn(error));
			});
	});
}

export default router;
export const RouteHandler = Handler;