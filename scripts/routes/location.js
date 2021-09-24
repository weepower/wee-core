import { $isObject, $serialize, $unserialize } from '../core/types';
import { _doc, _win } from '../core/variables';

const REMOVE_SLASHES_REGEXP = /^\/|\/$/g;

/**
 * Parse url and return results
 *
 * @param {string|Object} [value]
 * @returns {Object}
 * @private
 */
export function parseLocation(value) {
    if ($isObject(value)) {
        let path = value.path;

        if ($isObject(value.query)) {
            path += `?${$serialize(value.query)}`;
        }

        if (value.hash) {
            path += `#${value.hash}`;
        }

        value = path;
    }

    const a = _doc.createElement('a');
    a.href = value || window.location;

    const search = a.search;
    const path = a.pathname.replace(REMOVE_SLASHES_REGEXP, '');
    const origin = a.href.split('/');

    return {
        fullPath: `/${path}${search}${a.hash}`,
        hash: a.hash.slice(1),
        path: `/${path}`,
        search,
        query: search ? $unserialize(search) : {},
        segments: path.split('/'),
        url: a.href,
        origin: `${origin[0]}//${origin[2]}`,
        protocol: origin[0].replace(':', ''),
        port: a.port,
    };
}
