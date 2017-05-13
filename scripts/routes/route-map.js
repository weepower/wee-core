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
		path: _normalizePath(path),
		regex: PathToRegexp(path),
		// redirect, TODO: Look into redirect functionality further
		beforeEnter: route.before,
		beforeUpdate: route.beforeUpdate,
		meta: route.meta || {}
	};

	if (route.children) {
		// TODO: Call _addRouteRecord with parent added
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

	if (path[0] === '/') {
		return path;
	}

	if (! parent) {
		return path;
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

	return getRouteMapping();
}

export function getRouteMapping() {
	return {
		pathList,
		pathMap,
		nameMap
	};
}