// TODO: May need to move promise polyfill to an entry point file if building dist version of Wee
import 'es6-promise/auto';
import { _doc, _win } from '../core/variables';
import { $exec } from '../core/core';
import { $extend, $isFormData, $isFunction, $isString, $serialize } from '../core/types';
import { parseHeaders } from './headers';
import FetchError from './error';

export default function fetchFactory(defaults) {
    let version = 1;
    const headerKeys = Object.keys(defaults.headers);

    /**
     * Process the readyState change event
     *
     * @private
     * @param {XMLHttpRequest} request
     * @param {Object} conf
     * @returns {*}
     */
    const _settle = function _settle(request, config, resolve, reject) {
        if (request.readyState === 4) {
            const response = _prepareResponse(config, request);
            const exec = {
                args: config.args.slice(0),
                scope: config.scope,
            };
            const responseUrl = request.responseURL;

            // The request errored out and we didn't get a response, this will be handled by onerror instead
            // With one exception: request that's using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (response.status === 0 && ! (responseUrl && responseUrl.indexOf('file:') === 0)) {
                return;
            }

            if (config.validateStatus(response)) {
                exec.args.unshift(response);

                $exec(resolve, exec);
            } else {
                exec.args.unshift(new FetchError(
                    `Request failed with status code ${response.status}`,
                    response.config,
                    response.request,
                    null,
                    response,
                ));

                $exec(reject, exec);
            }
        }
    };

    /**
     * Create consistent response object for resolving promise
     *
     * @param {Object} config
     * @param {XMLHttpRequest|Object} request - Either request or response data when jsonp request
     * @returns {Object} response
     * @private
     */
    const _prepareResponse = function _prepareResponse(config, request) {
        let headers = null;
        let data = request;
        let status = null;
        let statusText = null;

        if (request instanceof XMLHttpRequest) {
            headers = request.getAllResponseHeaders ?
                parseHeaders(request.getAllResponseHeaders()) :
                null;
            data = ! config.responseType || config.responseType === 'text' ?
                request.responseText :
                request.response;

            // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
            status = request.status === 1223 ? 204 : request.status;
            statusText = request.status === 1223 ? 'No Content' : request.statusText;
        }

        data = config.transformResponse(data);

        return {
            config,
            data,
            headers,
            request,
            status,
            statusText,
        };
    };

    /**
     * Merge default and specified headers and clean up headers object
     *
     * @param {Object} config
     * @returns {Object}
     * @private
     */
    const _flattenHeaders = function _flattenHeaders(config) {
        config.headers = $extend(
            {},
            config.headers.common,
            config.headers[config.method.toLowerCase()] || {},
            config.headers || {},
        );

        // Remove get, post, etc properties from config.headers
        headerKeys.forEach((method) => {
            delete config.headers[method];
        });

        return config.headers;
    };

    /**
     *
     * @param config
     * @param {string} [baseUrl]
     * @returns {*}
     * @private
     */
    const _getUrl = function _getUrl(config, baseUrl) {
        // Strip ending ? or & to prepare for building query string
        let url = config.url.replace(/[\?&]$/, '');

        // Prefix base URL to url
        if (baseUrl) {
            url = `${baseUrl.replace(/\/$/, '')}/${
                url.replace(/^\//, '')}`;
        }

        // Build onto query string with params object
        if (config.params && Object.keys(config.params).length) {
            url += (url.indexOf('?') < 0 ? '?' : '&') +
                $serialize(config.params);
        }

        // If no protocol, make url relative
        if (url[0] !== '/' && ! /^https?:\/\//i.test(url)) {
            url = `/${url}`;
        }

        return url;
    };

    /**
     * Process JSONP request
     *
     * @param {Object} config
     * @param {Function} resolve
     * @param {Function} reject
     * @private
     */
    const _jsonp = function _jsonp(config, resolve, reject) {
        const el = _doc.createElement('script');
        let fn = config.jsonpCallback;

        if (! fn) {
            fn = `jsonp${version}`;
            version++;
        }

        _win[fn] = function (data) {
            config.args.unshift(_prepareResponse(config, data));

            resolve.apply(config.scope, config.args);
        };

        config.params[
            config.jsonp === true ?
                'callback' :
                config.jsonp
        ] = fn;

        el.onerror = function () {
            config.args.unshift(new FetchError('JSONP request failed', config));

            reject.apply(config.scope, config.args);
        };

        el.src = _getUrl(config);

        _doc.head.appendChild(el);
    };

    const instance = {
        // Set instance defaults
        defaults,

        /**
         * Generate final URL
         *
         * @private
         * @param {object} config
         */
        _getUrl,

        /**
         * Complete concurrent requests at one time
         *
         * @param {Array} promises
         * @returns {Promise}
         */
        all(promises) {
            return Promise.all(promises);
        },

        /**
         * Make request based on specified options
         *
         * @param {Object|string} options
         * @param {Array} [options.args] - callback arguments appended after default values
         * @param {(Array|Function|string)} [options.complete] - callback on request completion
         * @param {boolean} [options.disableCache=false] - add query string to request to bypass browser caching
         * @param {Object} [options.data] - object to serialize and pass along with request
         * @param {(Array|Function|string)} [options.error] - callback if request fails
         * @param {Object} [options.headers] - request headers
         * @param {(boolean|string)} [options.jsonp=false] - boolean or callback query parameter override
         * @param {string} [options.jsonpCallback] - override the name of the JSONP callback function
         * @param {string} [options.method=get] - request verb
         * @param {boolean} [options.processData=true] - post data in the body
         * @param {string} [options.responseType] - set the type of the response
         * @param {string} [options.baseUrl=''] - prepended request path
         * @param {Object} [options.scope] - callback scope
         * @param {(Array|function|string)} [options.send] - executed before Ajax call
         * @param {(Array|function|string)} [options.success] - callback if request succeeds
         * @param {string} [options.type] - form, html, json, or xml
         * @param {string} options.url - endpoint to request
         */
        request(options) {
            return new Promise((resolve, reject) => {
                // Account for possibility of options being URL string
                if ($isString(options)) {
                    const url = options;

                    options = {
                        url,
                    };
                }

                const config = $extend(true, {}, this.defaults, options);
                const requestData = config.processData ?
                    config.transformRequest(config.data, config.headers) :
                    config.data;
                const requestHeaders = _flattenHeaders(config);

                // Disable browser caching
                if (config.disableCache) {
                    config.params.dt = Date.now();
                }

                // Process JSONP
                if (config.jsonp) {
                    return _jsonp(config, resolve, reject);
                }

                // Set final url
                config.url = _getUrl(config, config.baseUrl);

                const request = new XMLHttpRequest();

                // Inject XHR object as first callback argument
                config.args.unshift(request);

                if (config.send) {
                    $exec(config.send, {
                        args: config.args,
                        scope: config.scope,
                    });
                }

                request.open(config.method.toUpperCase(), config.url, true);

                // Set the request timeout in ms
                request.timeout = config.timeout;

                // Listen for and settle response
                request.onreadystatechange = function onStateChange() {
                    _settle(request, config, resolve, reject);
                };

                // Listen for network errors
                request.onerror = function handleError() {
                    reject(new FetchError('Network Error', config, request));
                };

                // Handle timeout
                request.ontimeout = function handleTimeout() {
                    reject(new FetchError(`Timeout of ${config.timeout} ms exceeded`, config, request, 'ECONNABORTED'));
                };

                // Add X-Requested-With header for same domain requests
                // This is a security measure for CORS as it is not an allowed
                // header by default on cross-origin requests
                const a = _doc.createElement('a');
                a.href = config.url;

                if (! a.host || a.host === location.host) {
                    requestHeaders['X-Requested-With'] = 'XMLHttpRequest';
                }

                // HTTP basic authentication
                if (config.auth) {
                    const username = config.auth.username || '';
                    const password = config.auth.password || '';
                    requestHeaders.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
                }

                // Set request headers
                for (const key in requestHeaders) {
                    const val = requestHeaders[key];

                    if (val !== false) {
                        request.setRequestHeader(key, val);
                    }
                }

                // Add responseType to request if needed
                if (config.responseType) {
                    try {
                        request.responseType = config.responseType;
                    } catch (e) {
                        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
                        throw e;
                    }
                }

                // Handle progress if needed
                if ($isFunction(config.onDownloadProgress)) {
                    request.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            e.progress = e.loaded / e.total;
                        }

                        config.onDownloadProgress.call(null, e);
                    });
                }

                // Not all browsers support upload events
                if ($isFunction(config.onUploadProgress) && request.upload) {
                    request.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            e.progress = e.loaded / e.total;
                        }

                        config.onUploadProgress.call(null, e);
                    });
                }

                request.send(requestData);
            });
        },

        /**
         * Spreads out array of promise resolutions/rejections - used for $fetch.all
         *
         * @param {Function} callback
         * @returns {wrap}
         */
        spread(callback) {
            return function wrap(array) {
                return callback(...array);
            };
        },
    };

    // Provide convenient verb methods
    ['get', 'delete', 'head'].forEach((method) => {
        instance[method] = function (url, config = {}) {
            config.url = url;
            config.method = method;

            return this.request(config);
        };
    });

    ['post', 'put', 'patch'].forEach((method) => {
        instance[method] = function (url, data, config = {}) {
            config.url = url;
            config.method = method;
            config.data = data;

            return this.request(config);
        };
    });

    return instance;
}
