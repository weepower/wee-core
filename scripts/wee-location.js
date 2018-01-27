import { parseLocation } from 'routes/location';

/**
 * Retrieve information about current location or provided URL
 *
 * @param {string} [value]
 * @returns {Object}
 */
export function uri(value) {
    return parseLocation(value);
}

/**
 * Retrieve the current path's segments as an array or segment by index
 *
 * @param index
 * @returns {Array|string}
 */
export function segments(index) {
    const segments = uri().segments;

    if (index >= 0 && segments[index]) {
        return segments[index];
    }

    return segments;
}

export default {
    uri,
    segments,
};
