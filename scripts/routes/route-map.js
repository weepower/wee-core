import PathToRegexp from 'path-to-regexp';

let pathList = [];
let pathMap = {};
let nameMap = {};
let notFound = {};

/**
 * Register new route
 *
 * @param {Object} route
 * @param {Object} [parent]
 * @param {boolean} exclude
 * @private
 */
function _addRouteRecord(route, parent, exclude = false) {
	const { path, name, handler } = route;
	const finalPath = _normalizePath(path, parent);

	const record = {
		name,
		parent,
		handler,
		path: finalPath,
		regex: PathToRegexp(finalPath),
		// redirect, TODO: Look into redirect functionality further
		before: route.before,
		init: route.init,
		update: route.update,
		after: route.after,
		unload: route.unload,
		pop: route.pop,
		meta: route.meta || {}
	};

	// Children should be mapped before parent in case of wildcard in parent
	if (route.children && route.children.length) {
		let i = 0;
		let length = route.children.length;

		for (; i < length; i++) {
			_addRouteRecord(route.children[i], route, exclude);
		}
	}

	// Exclude from main mapping/return created route record object
	if (exclude) {
		return record;
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
function _normalizePath(path, parent) {
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
function _cleanPath(path) {
	return path.replace(/\/\//g, '/');
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
		nameMap,
		notFound
	};
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
 * Reset all map objects
 */
export function resetRouteMap() {
	pathList = [];
	pathMap = {};
	nameMap = {};
}

/**
 * Set not found route
 *
 * @param {Object} route
 */
export function setNotFound(route) {
	notFound = _addRouteRecord(route, null, true);
}