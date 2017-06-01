import { _doc, _win } from 'core/variables';
import { $exec } from 'core/core';
import { $extend, $serialize } from 'core/types';

export default function fetchFactory() {
	let version = 1;

	/**
	 * Process the readyState change event
	 *
	 * @private
	 * @param {XMLHttpRequest} x
	 * @param {object} conf
	 * @returns {*}
	 */
	const _change = function _change(x, conf) {
		if (x.readyState === 4) {
			var code = x.status,
				exec = {
					args: conf.args,
					scope: conf.scope
				};

			if (code >= 200 && code < 400) {
				if (conf.success) {
					_success(x, conf);
				}
			} else if (conf.error) {
				$exec(conf.error, exec);
			}

			if (conf.complete) {
				$exec(conf.complete, exec);
			}
		}
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
	 * Execute the request success callback
	 *
	 * @private
	 * @param {XMLHttpRequest} x
	 * @param {object} conf
	 * @returns {boolean}
	 */
	const _success = function _success(x, conf) {
		var resp = ! conf.responseType || conf.responseType == 'text' ?
				x.responseText :
				x.response,
			exec = {
				args: conf.args.slice(0),
				scope: conf.scope
			};

		// Parse JSON response if specified
		if (conf.json) {
			try {
				resp = JSON.parse(resp);
			} catch (e) {
				resp = {};
			}
		}

		exec.args.unshift(resp);

		// Execute success callback if specified
		$exec(conf.success, exec);
	}

	/**
	 * Process JSONP request
	 *
	 * @private
	 * @param {object} conf
	 */
	const _jsonp = function _jsonp(conf) {
		var el = _doc.createElement('script');

		if (conf.success) {
			var fn = conf.jsonpCallback;

			if (! fn) {
				fn = 'jsonp' + version;
				version++;
			}

			_win[fn] = function(data) {
				conf.args.unshift(data);

				$exec(conf.success, {
					args: conf.args,
					scope: conf.scope
				});
			};

			conf.data[
				conf.jsonp === true ?
					'callback' :
					conf.jsonp
				] = fn;
		}

		el.src = _getUrl(conf);

		if (conf.error) {
			el.onerror = function() {
				$exec(conf.error, {
					args: conf.args,
					scope: conf.scope
				});
			};
		}

		_doc.head.appendChild(el);
	};

	return {
		/**
		 * Make request based on specified options
		 *
		 * @param {object} options
		 * @param {Array} [options.args] - callback arguments appended after default values
		 * @param {(Array|function|string)} [options.complete] - callback on request completion
		 * @param {boolean} [options.cache=true] - disable automatic cache-busting query string
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
			var conf = $extend({
				args: [],
				data: {},
				headers: {},
				method: 'get',
				root: ''
			}, options);

			if (conf.cache === false) {
				conf.data.dt = Date.now();
			}

			// Prefix root path to url
			if (conf.root) {
				conf.url = conf.root.replace(/\/$/, '') + '/' +
					conf.url.replace(/^\//, '');
			}

			// Process JSONP
			if (conf.jsonp) {
				return _jsonp(conf);
			}

			var x = new XMLHttpRequest();

			// Inject XHR object as first callback argument
			conf.args.unshift(x);

			if (conf.send) {
				$exec(conf.send, {
					args: conf.args,
					scope: conf.scope
				});
			}

			x.onreadystatechange = function() {
				_change(x, conf);
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

			x.open(method, conf.url, true);

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
					x.setRequestHeader(key, val);
				}
			}

			// Set response type
			if (conf.responseType) {
				x.responseType = conf.responseType;
			}

			x.send(send);
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