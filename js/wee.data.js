(function(W) {
	'use strict';

	var version = 1,

		/**
		 * Process the readyState change event
		 *
		 * @private
		 * @param {XMLHttpRequest} x
		 * @param {object} conf
		 * @returns {*}
		 */
		_change = function(x, conf) {
			if (x.readyState === 4) {
				var status = x.status,
					exec = {
						args: conf.args,
						scope: conf.scope
					};

				exec.args.unshift(x);

				if (status >= 200 && status < 400) {
					if (conf.success) {
						_success(x, conf);
					}
				} else if (conf.error) {
					W.$exec(conf.error, exec);
				}

				if (conf.complete) {
					W.$exec(conf.complete, exec);
				}
			}
		},

		/**
		 * Execute the request success callback
		 *
		 * @private
		 * @param {XMLHttpRequest} x
		 * @param {object} conf
		 * @returns {boolean}
		 */
		_success = function(x, conf) {
			var resp = x.responseText,
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
			W.$exec(conf.success, exec);
		},

		/**
		 * Process JSONP request
		 *
		 * @private
		 * @param {object} conf
		 */
		_jsonp = function(conf) {
			var head = W.$('head')[0],
				el = W._doc.createElement('script');

			if (conf.success) {
				var fn = conf.jsonpCallback;

				if (! fn) {
					fn = 'jsonp' + version;
					version++;
				}

				W._win[fn] = function(data) {
					conf.args.unshift(data);

					W.$exec(conf.success, {
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

			el.src = W.data._getUrl(conf);

			if (conf.error) {
				el.onerror = function() {
					W.$exec(conf.error, {
						args: conf.args,
						scope: conf.scope
					});
				};
			}

			head.appendChild(el);
		};

	W.data = {
		/**
		 * Make request based on specified options
		 *
		 * @param {object} options
		 * @param {Array} [options.args] - callback arguments appended after default values
		 * @param {(Array|function|string)} [options.complete] - callback on request completion
		 * @param {object} [options.data] - object to serialize and pass along with request
		 * @param {(Array|function|string)} [options.error] - callback if request fails
		 * @param {object} [options.headers] - request headers
		 * @param {boolean} [options.json=false] - evaluate the response as JSON and return object
		 * @param {(boolean|string)} [options.jsonp=false] - boolean or callback query parameter override
		 * @param {string} [options.jsonpCallback] - override the name of the JSONP callback function
		 * @param {string} [options.method=get] - request verb
		 * @param {boolean} [options.processData=true] - post data in the body
		 * @param {string} [options.root=''] - prepended request path
		 * @param {object} [options.scope] - callback scope
		 * @param {(Array|function|string)} [options.send] - executed before Ajax call
		 * @param {(Array|function|string)} [options.success] - callback if request succeeds
		 * @param {string} options.url - endpoint to request
		 */
		request: function(options) {
			var conf = W.$extend({
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
				conf.url = (conf.root + '/' + conf.url).replace(/\/{2,}/g, '/');
			}

			// Process JSONP
			if (conf.jsonp) {
				return _jsonp(conf);
			}

			var x = new XMLHttpRequest();

			if (conf.send) {
				W.$exec(conf.send, {
					args: conf.args,
					scope: conf.scope
				});
			}

			x.onreadystatechange = function() {
				_change(x, conf);
			};

			var contentTypeHeader = 'Content-Type',
				method = conf.method.toUpperCase(),
				send = null,
				headers = [];

			// Format data based on specified verb
			if (method == 'GET') {
				conf.url = this._getUrl(conf);
			} else {
				send = typeof conf.data == 'string' || ! conf.processData ?
					conf.data :
					JSON.stringify(conf.data);
			}

			x.open(method, conf.url, true);

			// Add JSON headers
			if (conf.json) {
				headers[contentTypeHeader] = 'application/json';
				headers.Accept = 'application/json, text/javascript, */*; q=0.01';
			}

			// Add POST content type
			if (method == 'POST' && ! conf.json) {
				headers[contentTypeHeader] =
					'application/x-www-form-urlencoded; charset=UTF-8';
			}

			// Add X-Requested-With header for same domain requests
			var a = W._doc.createElement('a');
			a.href = conf.url;

			if (! a.hostname || a.hostname == location.hostname) {
				headers['X-Requested-With'] = 'XMLHttpRequest';
			}

			headers = W.$extend(headers, conf.headers);

			// Set request headers
			for (var key in headers) {
				var val = headers[key];

				if (val !== false) {
					x.setRequestHeader(key, val);
				}
			}

			x.send(send);
		},

		/**
		 * Generate final URL
		 *
		 * @private
		 * @param {object} conf
		 */
		_getUrl: function(conf) {
			var url = conf.url.replace(/[\?&]$/, '');

			if (conf.data && Object.keys(conf.data).length) {
				url += (url.indexOf('?') < 0 ? '?' : '&') +
					W.$serialize(conf.data);
			}

			if (url[0] != '/' && ! /^(?:[a-z]+:)?\/\//i.test(url)) {
				url = '/' + url;
			}

			return url;
		}
	};
})(Wee);