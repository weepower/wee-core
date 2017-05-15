import PathToRegexp from 'path-to-regexp';

let pathList = [];
let pathMap = {};
let nameMap = {};

/**
 * Register new route
 *
 * @param {Object} route
 * @param {Object} [parent]
 * @private
 */
function _addRouteRecord(route, parent) {
	const { path, name, handler } = route;
	const record = {
		name,
		parent,
		handler,
		path: _normalizePath(path, parent),
		regex: PathToRegexp(path),
		// redirect, TODO: Look into redirect functionality further
		beforeInit: route.beforeInit,
		beforeUpdate: route.beforeUpdate,
		init: route.init,
		update: route.update,
		meta: route.meta || {},
		once: route.once === true,
		processed: false
	};

	if (route.children && route.children.length) {
		let i = 0;
		let length = route.children.length;

		for (; i < length; i++) {
			_addRouteRecord(route.children[i], route);
		}
	}

	if (! pathMap[record.path]) {
		pathList.push(record.path);
		pathMap[record.path] = record;
	}

	if (name && ! nameMap[name]) {
		nameMap[name] = record;
	}
}

/**
 * Find full path of route
 *
 * @param {string} path
 * @param {Object} [parent]
 * @returns {*}
 * @private
 */
function _normalizePath (path, parent) {
	if (path === '/') {
		return path;
	}

	path = path.replace(/\/$/, '');

	// If path begins with / then assume it is independent route
	if (path[0] === '/') {
		return path;
	}

	// If no parent, and route doesn't start with /, then prepend /
	if (! parent) {
		return '/' + path;
	}

	return _cleanPath(`${parent.path}/${path}`);
}

/**
 * Strip unnecessary forward slashes from path
 *
 * @param {string} path
 */
function _cleanPath (path) {
	return path.replace(/\/\//g, '/');
}

/**
 * Generate mappings to be used in router
 *
 * @param {Array} routes
 * @returns {Object}
 */
export function mapRoutes(routes) {
	const count = routes.length;

	for (let i = 0; i < count; i++) {
		_addRouteRecord(routes[i]);
	}
}

/**
 * Retrieve current route mapping objects
 *
 * @returns {Object}
 */
export function getRouteMap() {
	return {
		pathList,
		pathMap,
		nameMap
	};
}

/**
 * Reset all map objects
 */
export function resetRouteMap() {
	pathList = [];
	pathMap = {};
	nameMap = {};
}