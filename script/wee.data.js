/* global JSON */

(function(W) {
	'use strict';

	/**
	 * Setup initial variables
	 */
	var version = 1;

	W.fn.make('data', {
		/**
		 * Make Ajax request based on specified options
		 *
		 * @param {object} options
		 * @param {string} options.url - endpoint to request
		 * @param {string} [options.root=''] - prepended request path
		 * @param {(Array|function|string)} [options.send] - executed before Ajax call
		 * @param {(Array|function|string)} [options.success] - callback if request succeeds
		 * @param {(Array|function|string)} [options.error] - callback if request fails
		 * @param {(Array|function|string)} [options.complete] - callback on request completion
		 * @param {Array} [options.args] - callback arguments appended after default values
		 * @param {object} [options.data] - object to serialize and pass along with request
		 * @param {object} [options.headers] - request headers
		 * @param {boolean} [options.json=false] - evaluate the response as JSON and return object
		 * @param {(boolean|string)} [options.jsonp=false] - boolean or override name for callback query string parameter
		 * @param {string} [options.jsonpCallback] - override the name of the JSONP callback function
		 * @param {string} [options.method=get] - request verb
		 * @param {object} [options.scope] - callback scope
		 * @param {string} [options.template] - template string to parse response JSON
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
				conf.url = conf.root + conf.url;
			}

			// Process JSONP
			if (conf.jsonp) {
				return this.$private.jsonp(conf);
			}

			var scope = this,
				x = new XMLHttpRequest();

			if (conf.send) {
				W.$exec(conf.send, {
					args: conf.args,
					scope: conf.scope
				});
			}

			x.onreadystatechange = function() {
				scope.$private.change(x, conf);
			};

			var contentTypeHeader = 'Content-Type',
				method = conf.method.toUpperCase(),
				send = null,
				headers = [];

			// Format data based on specified verb
			if (method == 'GET') {
				conf.url = this.$private.getUrl(conf);
			} else {
				if (method == 'POST') {
					headers[contentTypeHeader] =
						'application/x-www-form-urlencoded; charset=UTF-8';
				}

				send = typeof conf.data == 'string' ?
					conf.data :
					JSON.stringify(conf.data);
			}

			x.open(method, conf.url, true);

			// Add JSON headers
			if (conf.json) {
				headers[contentTypeHeader] = 'application/json';
				headers.Accept = 'application/json, text/javascript, */*; q=0.01';
			}

			// Add X-Requested-With header for same domain requests
			var xrw = 'X-Requested-With',
				a = W._doc.createElement('a');
			a.href = conf.url;

			if (! a.hostname || a.hostname == location.hostname) {
				headers[xrw] = 'XMLHttpRequest';
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
		}
	}, {
		/**
		 * Process the readyState change event
		 *
		 * @param {XMLHttpRequest} x
		 * @param {object} conf
		 * @returns {*}
		 */
		change: function(x, conf) {
			if (x.readyState === 4) {
				var status = x.status,
					exec = {
						args: conf.args,
						scope: conf.scope
					};

				exec.args.unshift(x);

				if (status >= 200 && status < 400) {
					if (conf.success) {
						this.success(x, conf);
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
		 * @param {XMLHttpRequest} x
		 * @param {object} conf
		 * @returns {boolean}
		 */
		success: function(x, conf) {
			var resp = x.responseText,
				orig = resp,
				exec = {
					args: conf.args.slice(0),
					scope: conf.scope
				};

			// Parse JSON response if specified
			if (conf.json || conf.template) {
				try {
					resp = JSON.parse(resp);
				} catch (e) {
					resp = {};
				}

				if (conf.template) {
					resp = W.view.render(conf.template, resp);
					exec.args.unshift(orig);
				}
			}

			exec.args.unshift(resp);

			// Execute success callback if specified
			W.$exec(conf.success, exec);
		},

		/**
		 * Process JSONP request
		 *
		 * @param {object} conf
		 */
		jsonp: function(conf) {
			var head = W.$('head')[0];

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

			var el = W._doc.createElement('script');
			el.src = this.getUrl(conf);

			if (conf.error) {
				el.onerror = function() {
					W.$exec(conf.error, {
						args: conf.args,
						scope: conf.scope
					});
				};
			}

			head.appendChild(el);
		},

		/**
		 * Generate final URL
		 *
		 * @param {object} conf
		 */
		getUrl: function(conf) {
			var url = conf.url.replace(/[\?&]$/, '');

			if (conf.data && Object.keys(conf.data).length) {
				url += (url.indexOf('?') < 0 ? '?' : '&') +
					W.$serialize(conf.data);
			}

			return url;
		}
	});
})(Wee);