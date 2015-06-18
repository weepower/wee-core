(function(W) {
	'use strict';

	W.fn.make('data', {
		/**
		 * Make Ajax request based on specified options
		 *
		 * @param {object} options
		 * @param {string} options.url - endpoint to request
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
				}, options);;

			if (conf.cache === false) {
				conf.data.dt = Date.now();
			}

			// Prefix root path to url
			if (conf.root) {
				conf.url = conf.root + conf.url;
			}

			if (conf.jsonp) {
				var head = W._doc.getElementsByTagName('head')[0];

				if (conf.success) {
					var fn = conf.jsonpCallback;

					if (! fn) {
						var v = this.$get('v', 1);
						func = 'jsonp' + v;
						this.$set('v', v + 1);
					}

					W._win[fn] = function(data) {
						//conf.args.unshift(data);

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

				if (Object.keys(conf.data).length > 0) {
					conf.url += '?' + W.$serialize(conf.data);
				}

				var el = W._doc.createElement('script');

				el.src = conf.url;

				if (conf.error) {
					el.onerror = function() {
						W.$exec(conf.error, {
							args: conf.args,
							scope: conf.scope
						});
					};
				}

				head.appendChild(el);

				return;
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

			var send = null;

			// Post or get endpoint based on specification
			if (conf.method == 'post') {
				x.open('POST', conf.url, true);
				x.setRequestHeader(
					'Content-Type',
					'application/x-www-form-urlencoded; charset=UTF-8'
				);

				send = W.$isObject(conf.data) ?
					W.$serialize(conf.data) :
					conf.data;
			} else {
				if (Object.keys(conf.data).length > 0) {
					conf.url += '?' + W.$serialize(conf.data);
				}

				x.open(conf.method.toUpperCase(), conf.url, true);
			}

			// Add X-Requested-With header for same domain requests
			var xrw = 'X-Requested-With';

			if (! conf.headers.hasOwnProperty(xrw)) {
				var a = W._doc.createElement('a');
				a.href = conf.url;

				if (a.hostname == W._win.location.hostname) {
					conf.headers[xrw] = 'XMLHttpRequest';
				}
			}

			// Set request headers
			for (var key in conf.headers) {
				var val = conf.headers[key];

				if (val !== false) {
					x.setRequestHeader(key, val);
				}
			}

			// Send request
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
		}
	});
})(Wee);