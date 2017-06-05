import { _doc, _win } from 'core/variables';
import { $exec } from 'core/core';
import { $extend, $serialize } from 'core/types';
import { parseHeaders } from 'fetch/headers';
import { createError } from 'fetch/error';

export default function fetchFactory() {
	let version = 1;

	/**
	 * Process the readyState change event
	 *
	 * @private
	 * @param {XMLHttpRequest} request
	 * @param {object} conf
	 * @returns {*}
	 */
	const _settle = function _settle(response, resolve, reject) {
		if (response.request.readyState === 4) {
			let exec = {
					args: response.config.args.slice(0),
					scope: response.config.scope
				};
			let responseUrl = response.request.responseURL;

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
	 * @param {XMLHttpRequest} request
	 * @param {Object} config
	 * @returns {Object} response
	 * @private
	 */
	const _prepareResponse = function _prepareResponse(request, config) {
		const headers = 'getAllResponseHeaders' in request ?
			parseHeaders(request.getAllResponseHeaders()) :
			null;
		let data = ! config.responseType || config.responseType === 'text' ?
			request.responseText :
			request.response;

		// Parse JSON response if specified
		if (config.json) {
			try {
				data = JSON.parse(data);
			} catch (e) {
				data = {};
			}
		}

		return {
			config,
			data,
			headers,
			request,
			// IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
			status: request.status === 1223 ? 204 : request.status,
			statusText: request.status === 1223 ? 'No Content' : request.statusText
		};
	}

	const _getUrl = function _getUrl(conf) {
		var url = conf.url.replace(/[\?&]$/, '');

		if (conf.data && Object.keys(conf.data).length) {
			url += (url.indexOf('?') < 0 ? '?' : '&') +
				$serialize(conf.data);
		}

		if (url[0] != '/' && ! /^https?:\/\//i.test(url)) {
			url = '/' + url;
		}

		return url;
	}

	/**
	 * Process JSONP request
	 *
	 * @private
	 * @param {object} conf
	 */
	const _jsonp = function _jsonp(conf, resolve, reject) {
		const el = _doc.createElement('script');
		let fn = conf.jsonpCallback;

		if (! fn) {
			fn = 'jsonp' + version;
			version++;
		}

		_win[fn] = function(data) {
			conf.args.unshift(data);

			resolve.apply(conf.scope, conf.args);
		};

		conf.data[
			conf.jsonp === true ?
				'callback' :
				conf.jsonp
			] = fn;

		el.src = _getUrl(conf);

		el.onerror = function() {
			reject.apply(conf.scope, conf.args);
		};

		_doc.head.appendChild(el);
	};

	return {
		/**
		 * Make request based on specified options
		 *
		 * @param {object} options
		 * @param {Array} [options.args] - callback arguments appended after default values
		 * @param {(Array|function|string)} [options.complete] - callback on request completion
		 * @param {boolean} [options.disableCache=false] - add query string to request to bypass browser caching
		 * @param {object} [options.data] - object to serialize and pass along with request
		 * @param {(Array|function|string)} [options.error] - callback if request fails
		 * @param {object} [options.headers] - request headers
		 * @param {boolean} [options.json=false] - evaluate the response as JSON and return object
		 * @param {(boolean|string)} [options.jsonp=false] - boolean or callback query parameter override
		 * @param {string} [options.jsonpCallback] - override the name of the JSONP callback function
		 * @param {string} [options.method=get] - request verb
		 * @param {boolean} [options.processData=true] - post data in the body
		 * @param {string} [options.responseType] - set the type of the response
		 * @param {string} [options.root=''] - prepended request path
		 * @param {object} [options.scope] - callback scope
		 * @param {(Array|function|string)} [options.send] - executed before Ajax call
		 * @param {(Array|function|string)} [options.success] - callback if request succeeds
		 * @param {string} [options.type] - form, html, json, or xml
		 * @param {string} options.url - endpoint to request
		 */
		request: function(options) {
			return new Promise((resolve, reject) => {
				var conf = $extend({
					args: [],
					data: {},
					disableCache: false,
					headers: {},
					method: 'get',
					root: ''
				}, options);

				if (conf.disableCache) {
					conf.data.dt = Date.now();
				}

				// Prefix root path to url
				if (conf.root) {
					conf.url = conf.root.replace(/\/$/, '') + '/' +
						conf.url.replace(/^\//, '');
				}

				// Process JSONP
				if (conf.jsonp) {
					return _jsonp(conf, resolve, reject);
				}

				var request = new XMLHttpRequest();

				// Inject XHR object as first callback argument
				conf.args.unshift(request);

				if (conf.send) {
					$exec(conf.send, {
						args: conf.args,
						scope: conf.scope
					});
				}

				request.onreadystatechange = function() {
					_settle(_prepareResponse(request, conf), resolve, reject);
				};

				request.onerror = function handleError() {
					reject(createError('Network Error', conf, null, request));
				};

				var contentTypeHeader = 'Content-Type',
					method = conf.method.toUpperCase(),
					str = typeof conf.data == 'string',
					send = null,
					headers = [];

				if (! str && ! conf.type) {
					conf.type = 'json';
				}

				// Format data based on specified verb
				if (method == 'GET') {
					conf.url = this._getUrl(conf);
				} else {
					send = str || conf.processData === false ?
						conf.data :
						conf.type == 'json' ?
							JSON.stringify(conf.data) :
							$serialize(conf.data);
				}

				request.open(method, conf.url, true);

				// Add content type header
				if (conf.type == 'json') {
					headers[contentTypeHeader] = 'application/json';
				} else if (conf.type == 'xml') {
					headers[contentTypeHeader] = 'text/xml';
				} else if (method == 'POST' || conf.type == 'form') {
					headers[contentTypeHeader] =
						'application/x-www-form-urlencoded';
				}

				// Accept JSON header
				if (conf.json) {
					headers.Accept = 'application/json, text/javascript, */*; q=0.01';
				}

				// Add X-Requested-With header for same domain requests
				var a = _doc.createElement('a');
				a.href = conf.url;

				if (! a.host || a.host == location.host) {
					headers['X-Requested-With'] = 'XMLHttpRequest';
				}

				// Append character set to content type header
				headers[contentTypeHeader] += '; charset=UTF-8';

				// Extend configured headers into defaults
				headers = $extend(headers, conf.headers);

				// Set request headers
				for (var key in headers) {
					var val = headers[key];

					if (val !== false) {
						request.setRequestHeader(key, val);
					}
				}

				// Set response type
				if (conf.responseType) {
					request.responseType = conf.responseType;
				}

				request.send(send);
			});
		},

		/**
		 * Generate final URL
		 *
		 * @private
		 * @param {object} conf
		 */
		_getUrl: _getUrl
	};
}