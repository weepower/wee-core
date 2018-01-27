/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
export function parseHeaders(headers) {
    const parsed = {};

    if (! headers) {
        return parsed;
    }

    headers.split('\n').forEach((line) => {
        const i = line.indexOf(':');
        const key = line.substr(0, i).trim().toLowerCase();
        const val = line.substr(i + 1).trim();

        if (key) {
            parsed[key] = parsed[key] ? `${parsed[key]}, ${val}` : val;
        }
    });

    return parsed;
}

/**
 * Ensure proper formatting for header name
 *
 * @param {Object} headers
 * @param {string} normalizedName
 */
export function normalizeHeader(headers, normalizedName) {
    Object.keys(headers).forEach((name) => {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
            headers[normalizedName] = headers[name];
            delete headers[name];
        }
    });
}
