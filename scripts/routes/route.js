import { $isString, $isObject } from 'core/types';
import Transition from './transitions';

export const START = createRoute({ path: '/' });

/**
 * Create final immutable route object
 *
 * @param {Object} location
 * @param {Object} record
 * @returns {Object}
 */
export function createRoute(location, record = {}) {
    const route = {
        name: record.name,
        meta: record.meta || {},
        path: location.path,
        hash: location.hash,
        query: location.query,
        search: location.search,
        segments: location.segments,
        params: location.params || {},
        fullPath: location.fullPath,
        // TODO: Revisit and remove the need for array here
        matched: [record],
        transition: record.transition ? new Transition(record.transition) : null,
    };

    return Object.freeze(route);
}

/**
 * Determine if value is intended to be redirect
 *
 * @param value
 * @returns {*}
 */
export function isRedirect(value) {
    return $isString(value) || ($isObject(value) && ($isString(value.path) || $isString(value.name)));
}

/**
 * Compare route equality
 *
 * @param {Object} a - route to be compared
 * @param {Object} b - route to be compared
 * @returns {boolean}
 */
export function isSameRoute(a, b) {
    if (b === START) {
        return a === b;
    }

    return a.fullPath === b.fullPath;
}
