import { getRouteMap } from './route-map';
import { parseLocation } from './location';
import { createRoute } from './route';

/**
 * Match route against current path and assign params
 *
 * @param {RegExp} regex
 * @param {string} path
 * @param {Object} [params]
 * @returns {boolean}
 */
export function matchRoute (regex, path, params) {
	const match = path.match(regex);
	let i = 0;
	let length;

	if (! match) {
		return false;
	} else if (! params) {
		return true;
	}

	length = match.length;

	for (; i < length; i++) {
		const key = regex.keys[i - 1];
		const val = typeof match[i] === 'string' ? decodeURIComponent(match[i]) : match[i];

		if (key) {
			params[key.name] = val;
		}
	}

	return true
}

/**
 * Evaluate given path against registered route records
 *
 * @param {string} [path]
 * @returns {Object}
 */
export function match(path) {
	const { pathList, pathMap } = getRouteMap();
	const location = parseLocation(path);
	const matches = [];
	let i = 0;
	let routeCount = pathList.length;

	location.params = {};

	for (; i < routeCount; i++) {
		const path = pathList[i];
		const record = pathMap[path];

		if (matchRoute(record.regex, location.path, location.params)) {
			matches.push(record);
		}
	}

	location.matches = matches;

	return createRoute(location);
}