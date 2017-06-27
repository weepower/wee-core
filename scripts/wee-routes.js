import Handler from 'routes/route-handler';
import { getRouteMap, mapRoutes, resetRouteMap, setNotFound } from 'routes/route-map';
import History from './routes/history';
import { addAfterEach, addBeforeEach, resetHooks } from './routes/global-hooks';
import pjax from './routes/pjax';
import { $ready } from 'core/dom';
import { $copy, $extend, $isArray } from 'core/types';
import { uri } from 'wee-location';

const defaults = {
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) {
			return savedPosition;
		} else {
			return { x: 0, y: 0 };
		}
	},
	transition: null,
	onError: []
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
						.catch(error => {
							settings.onError.forEach(callback => callback(error));
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
 * Register onError method
 *
 * @param {Function|Array} error
 */
router.onError = function onError(error) {
	if ($isArray(error)) {
		settings.onError = settings.onError.concat(error);
	} else {
		settings.onError.push(error);
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
	} else if ($isArray(modifyPjax)) {
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
	} else if ($isArray(modifyPjax)) {
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
	history = new History(settings.scrollBehavior);
	settings = $copy(defaults);
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
		history.navigate(uri().fullPath)
			.catch(error => {
				settings.onError.forEach(callback => callback(error));
			});
	});

	return this;

	// TODO: This is going to set the state of the current route in history
	// TODO: I don't think that will be desirable
	// TODO: Do we need a way to evaluate routes without changing history.current?
	// const { pathMap, nameMap } = getRouteMap();
	//
	// if (pathMap[value]) {
	// 	history.navigate(value);
	// } else if (nameMap[value]) {
	// 	history.navigate(value);
	// }
}

export default router;
export const RouteHandler = Handler;