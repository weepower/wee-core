import { _doc, _win } from 'core/variables';
import { $exec } from 'core/core';
import { $extend, $isFormData, $isString, $serialize } from 'core/types';
import { parseHeaders } from 'fetch/headers';
import { createError } from 'fetch/error';

export default function fetchFactory(defaults) {
	let version = 1;
	let headerKeys = Object.keys(defaults.headers);

	/**
	 * Process the readyState change event
	 *
	 * @private
	 * @param {XMLHttpRequest} request
	 * @param {object} conf
	 * @returns {*}
	 */
	const _settle = function _settle(request, config, resolve, reject) {
		if (request.readyState === 4) {
			let response = _prepareResponse(config, request);
			let exec = {
					args: response.config.args.slice(0),
					scope: response.config.scope
				};
			let responseUrl = request.responseURL;

			// The request errored out and we didn't get a response, this will be handled by onerror instead
			// With one exception: request that using file: protocol, most browsers
			// will return status as 0 even though it's a successful request
			if (response.status === 0 && ! (responseUrl && responseUrl.indexOf('file:') === 0)) {
				return;
			}

			// TODO: validateStatus method with ability to customize status code
			if (response.status >= 200 && response.status < 400) {
				exec.args.unshift(response);

				$exec(resolve, exec);
			} else {
				exec.args.unshift(createError(
					'Request failed with status code ' + response.status,
					response.config,
					null,
					response.request,
					response
				));

				$exec(reject, exec);
			}
		}
	}

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
			statusText
		};
	}

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
			config.headers || {}
		);

		// Remove get, post, etc properties from config.headers
		headerKeys.forEach(method => {
			delete config.headers[method];
		})

		return config.headers;
	}

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
			url = baseUrl.replace(/\/$/, '') + '/' +
				url.replace(/^\//, '');
		}

		// Build onto query string with params object
		if (config.params && Object.keys(config.params).length) {
			url += (url.indexOf('?') < 0 ? '?' : '&') +
				$serialize(config.params);
		}

		// If no protocol, make url relative
		if (url[0] !== '/' && ! /^https?:\/\//i.test(url)) {
			url = '/' + url;
		}

		return url;
	}

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
			fn = 'jsonp' + version;
			version++;
		}

		_win[fn] = function(data) {
			config.args.unshift(_prepareResponse(config, data));

			resolve.apply(config.scope, config.args);
		};

		config.params[
			config.jsonp === true ?
				'callback' :
				config.jsonp
			] = fn;

		el.onerror = function() {
			config.args.unshift(createError('JSONP request failed', config, null, null, null));

			reject.apply(config.scope, config.args);
		};

		el.src = _getUrl(config);

		_doc.head.appendChild(el);
	};

	return {
		// Set instance defaults
		defaults,

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
		 * @param {boolean} [options.json=false] - evaluate the response as JSON and return object
		 * @param {(boolean|string)} [options.jsonp=false] - boolean or callback query parameter override
		 * @param {string} [options.jsonpCallback] - override the name of the JSONP callback function
		 * @param {string} [options.method=get] - request verb
		 * @param {boolean} [options.processData=true] - post data in the body
		 * @param {string} [options.responseType] - set the type of the response
		 * @param {string} [options.baseUrl=''] - prepended request path
		 * @param {object} [options.scope] - callback scope
		 * @param {(Array|function|string)} [options.send] - executed before Ajax call
		 * @param {(Array|function|string)} [options.success] - callback if request succeeds
		 * @param {string} [options.type] - form, html, json, or xml
		 * @param {string} options.url - endpoint to request
		 */
		request(options) {
			return new Promise((resolve, reject) => {
				// Account for possibility of options being URL string
				if ($isString(options)) {
					let url = options;

					options = {
						url
					};
				}

				let config = $extend(true, {}, this.defaults, options);
				let requestData = config.processData ?
					config.transformRequest(config.data, config.headers) :
					config.data;
				let requestHeaders = _flattenHeaders(config);

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
						scope: config.scope
					});
				}

				// Listen for and settle response
				request.onreadystatechange = function() {
					_settle(request, config, resolve, reject);
				};

				// Listen for network errors
				request.onerror = function handleError() {
					reject(createError('Network Error', config, null, request));
				};

				request.open(config.method.toUpperCase(), config.url, true);

				// Add X-Requested-With header for same domain requests
				// This is a security measure for CORS as it is not an allowed
				// header by default on cross-origin requests
				let a = _doc.createElement('a');
				a.href = config.url;

				if (! a.host || a.host === location.host) {
					requestHeaders['X-Requested-With'] = 'XMLHttpRequest';
				}

				// Set request headers
				for (var key in requestHeaders) {
					var val = requestHeaders[key];

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

				request.send(requestData);
			});
		},

		/**
		 * Generate final URL
		 *
		 * @private
		 * @param {object} config
		 */
		_getUrl: _getUrl
	};
}