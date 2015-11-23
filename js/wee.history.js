/* jshint maxparams: 5 */

(function(W, D, E, H, U) {
	'use strict';

	var support = H && H.pushState,
		entries = [],
		settings = {},
		root = '',
		path = '',

		/**
		 * Return current path
		 *
		 * @private
		 * @param {object} loc
		 * @returns {string}
		 */
		_path = function(loc) {
			loc = loc || location;
			return loc.pathname + loc.search + loc.hash;
		},

		/**
		 * Determine if path is valid for history navigation
		 *
		 * @private
		 * @param {HTMLElement} el
		 */
		_isValid = function(el) {
			var host = el.hostname,
				path = el.pathname,
				loc = location;

			if (! el.href ||
				(host && host != loc.hostname) ||
				(el.hash && path == loc.pathname)) {
				return false;
			}

			var exts = settings.extensions,
				segs = path.split('.'),
				ext;

			if (segs.length > 1) {
				ext = segs.pop().split(/#|\?/)[0];
			}

			return ! ext || (exts && exts.indexOf(ext) > -1);
		},

		/**
		 * Reset references and variables for a given selector
		 *
		 * @private
		 * @param sel
		 */
		_reset = function(sel) {
			W.$setRef(sel);
			W.$setVar(sel);

			W.history.bind();
		},

		/**
		 * Process the history state of the request
		 *
		 * @private
		 * @param {object} conf
		 */
		_process = function(conf) {
			var key = conf.path.replace(/^\//g, ''),
				request = conf.request,
				method = request.method;

			entries[key] = conf;

			if (! method || method == 'get') {
				conf.path = D._getUrl(request);
			}

			var obj = {
				args: [
					{
						dir: conf.push ? 1 : -1,
						path: conf.path,
						prev: path
					}
				]
			};

			// Add entry to HTML5 history
			if (conf.push && support) {
				H.pushState(0, '', conf.path);
			}

			// Update document title
			if (conf.title) {
				W._doc.title = conf.title;
			}

			if (W.routes) {
				// Update current path
				W.routes.uri(conf.path);
				W.routes.uri({
					history: true
				});

				// Evaluate routes against updated path
				if (conf.run) {
					W.routes.run({
						event: 'pop',
						path: path
					});

					W.routes.run({
						path: conf.path
					});
				}

				path = conf.path;
			}

			if (conf.push && conf.pushstate) {
				W.$exec(conf.pushstate, obj);
			}

			if (conf.pop && conf.popstate) {
				W.$exec(conf.popstate, obj);
			}

			if (conf.end) {
				W.$exec(conf.end, obj);
			}
		};

	W.history = {
		/**
		 * Set the initial state and popstate event, and bind global actions
		 *
		 * @param {object} [options]
		 * @param {($|HTMLElement|string)} [options.bind]
		 * @param {array} [options.extensions]
		 * @param {string] [options.partials='title,main']
		 * @param {boolean] [options.push=true]
		 * @param {object} [options.request]
		 * @param {boolean} [options.run=true]
		 */
		init: function(options) {
			if (! this.request) {
				path = _path();
				settings = W.$extend({
					partials: 'title,main',
					push: true,
					request: {},
					run: true,
					scrollTop: 0
				}, options);
				root = settings.request.root || '';

				this.request = settings.request;
				delete settings.request;

				if (support) {
					// Set current state
					H.replaceState(0, '', path);

					// Listen for browser navigation
					E.on(W._win, 'popstate.history', function(e) {
						if (e.state !== null) {
							var url = _path(),
								prevConf = entries[path.replace(/^\//g, '')],
								conf = W.$extend(
									entries[url.replace(/^\//g, '')] || {
										request: {
											root: ''
										}
									}, {
										path: url,
										push: false,
										pop: true
									}
								);
							conf.partials = prevConf.partials;

							W.history.go(conf);
						}
					});
				}

				// Bind PJAX actions
				this.bind();
			}
		},

		/**
		 * Bind element events and form submit events to PJAX
		 *
		 * @param {(boolean|object)} [events]
		 * @param {($|HTMLElement|Object|string)} [a] - settings or context
		 * @param {($|HTMLElement|string)} [context=document]
		 */
		bind: function(events, a, context) {
			events = events || settings.bind;

			if (events === true) {
				events = {
					click: 'a',
					submit: 'form'
				};
			}

			if (support && typeof events == 'object') {
				var keys = Object.keys(events),
					i = 0;

				if (typeof a !== 'object') {
					context = a;
					a = {};
				}

				for (; i < keys.length; i++) {
					var event = keys[i],
						sel = events[event];

					$(sel).each(function(el) {
						var evt = event.split(' ').map(function(val) {
								return val + '.history';
							}).join(' '),
							loc = el.getAttribute('data-url'),
							l = el;

						if (loc || el.action) {
							l = W._doc.createElement('a');
							l.href = loc || el.action;
						}

						// Ensure the path exists and is local
						if (evt && _isValid(l)) {
							var options = W.$extend(true, {}, a);

							// Remove existing history events
							E.off(el, evt);

							E.on(el, evt, function(e, el) {
								if (! e.metaKey && ! el.hasAttribute('data-static')) {
									options.path = _path(l);

									W.history.go(options);
									e.preventDefault();
								}
							});
						}
					}, {
						context: context
					});
				}
			}
		},

		/**
		 * Navigate to a new path or within the browser history
		 *
		 * @param {object} options
		 * @param {string} [options.action='replace']
		 * @param {array} [options.extensions]
		 * @param {string] [options.partials='title,main']
		 * @param {string} [options.path=current path]
		 * @param {boolean} [options.push=true]
		 * @param {object} [options.request]
		 * @param {boolean} [options.run=true]
		 * @param {($|HTMLElement|number|string)} [options.scrollTop]
		 * @param {string} [options.title]
		 */
		go: function(options) {
			var scope = this;

			if (! scope.request) {
				scope.init();
			}

			var globalRequest = scope.request,
				conf = W.$extend(
					{},
					settings,
					options
				),
				request = conf.request || {};

			request.root = request.root !== U ? request.root : root;
			request.url = request.url !== U ? request.url : conf.path;

			// Navigate to external URL or if history isn't supported
			var a = W._doc.createElement('a');
			a.href = request.root + request.url;

			if (! support || ! _isValid(a)) {
				W._win.location = request.url;
				return false;
			}

			if (conf.begin && W.$exec(conf.begin, {
					args: [conf]
				}) === false) {
				return;
			}

			// Reset URL to exclude root
			a.href = request.url;

			request.url = _path(a);
			conf.request = request;

			// Request partial Ajax
			if (request.url) {
				var sendEvents = [],
					successEvents = [],
					errorEvents = [],
					completeEvents = [],
					partials = conf.partials,
					targets = W.$(partials);

				// Set Pjax header
				request.headers = request.headers || {};
				request.headers['X-PJAX'] = 'true';

				// Process send events
				if (request.send) {
					sendEvents.push(request.send);
				}

				if (globalRequest.send) {
					sendEvents.push(globalRequest.send);
				}

				request.send = sendEvents;

				// Compile success events
				successEvents.push(function(html) {
					if (conf.replace) {
						html = W.$exec(conf.replace, {
							args: [html]
						}) || html;
					}

					// Evaluate unload routes against updated path
					if (W.routes && conf.run) {
						W.routes.run({
							event: 'unload',
							path: path
						});
					}

					if (partials) {
						html = W.$parseHTML('<i>' + html + '</i>').firstChild;

						// Make partial replacements from response
						W.$each(partials.split(','), function(sel) {
							W.$each(sel, function(el) {
								var target = W.$(sel)[0];

								if (target) {
									var parent = target.parentNode;

									conf.action == 'append' ?
										parent.appendChild(el) :
										parent.replaceChild(el, target);

									_reset(parent);
								}
							}, {
								context: html
							});
						});
					} else {
						targets.innerHTML = html;

						_reset(targets);
					}
				});

				if (request.success) {
					successEvents.push(request.success);
				}

				if (globalRequest.success) {
					successEvents.push(globalRequest.success);
				}

				successEvents.push(function() {
					var st = conf.scrollTop;

					// Scroll vertically to target
					if (st !== false) {
						var top = a.hash ? W.$offset(a.hash).top : 0,
							anim = W.animate;

						if (! top) {
							top = typeof st == 'number' ?
								st :
								W.$(st)[0].getBoundingClientRect().top +
									W._win.pageYOffset;
						}

						if (anim) {
							anim.tween(W._body, {
								scrollTop: top
							});
						} else {
							W._body.scrollTop = top;
						}
					}
				});

				request.success = successEvents;

				// Compile error events
				if (request.error) {
					errorEvents.push(request.error);
				}

				if (globalRequest.error) {
					errorEvents.push(globalRequest.error);
				}

				request.error = errorEvents;

				// Compile complete events
				if (request.complete) {
					completeEvents.push(request.complete);
				}

				if (globalRequest.complete) {
					completeEvents.push(globalRequest.complete);
				}

				completeEvents.push(function(xhr) {
					if (xhr.status == 200) {
						_process(conf);
					}
				});

				request.complete = completeEvents;

				// Make Ajax request
				request.args = request.args || [];
				request.args.unshift(targets);

				D.request(request);
			} else {
				_process(conf);
			}
		}
	};
})(Wee, Wee.data, Wee.events, history, undefined);