(function(W, H, U) {
	'use strict';

	/**
	 * Setup initial variables
	 */
	var support = H && H.pushState,
		entries = [],

		/**
		 * Determine if path is valid for history navigation
		 *
		 * @param {HTMLElement} el
		 */
		_isValid = function(el) {
			var exts = W.history.settings.extensions,
				host = el.hostname,
				segs = el.href.split('.'),
				ext;

			if (segs.length > 1) {
				ext = segs.pop().split(/#|\?/)[0];
			}

			return (! host || host == location.hostname) &&
				(! ext || (ext && (! exts || exts.indexOf(ext) > -1)));
		};

	W.fn.make('history', {
		/**
		 * Set the initial state and popstate event, and bind global actions
		 *
		 * @param {object} [options]
		 * @param {boolean] [options.push=true]
		 * @param {string] [options.partials='title,main']
		 * @param {string] [options.fallback='nav']
		 * @param {boolean} [options.run=true]
		 * @param {($|HTMLElement|string)} [options.bind]
		 * @param {object} [options.request]
		 * @param {array} [options.extensions]
		 */
		init: function(options) {
			if (! this.request) {
				var loc = location,
					path = loc.pathname + loc.search + loc.hash,
					settings = W.$extend({
						fallback: 'nav',
						partials: 'title,main',
						push: true,
						request: {},
						run: true
					}, options);

				this.settings = settings;
				this.request = settings.request;

				delete settings.request;

				this.root = this.request.root;

				if (support) {
					// Set current state
					H.replaceState(0, 0, path);

					// Listen for browser navigation
					W.events.on(W._win, 'popstate', function() {
						var path = loc.pathname + loc.search + loc.hash,
							conf = entries[path.replace(/^\//g, '')];

						this.go(W.$extend(
							conf || {
								request: {
									root: ''
								}
							}, {
								path: path,
								push: false,
								pop: true
							}
						));
					}, {
						scope: this
					});
				}

				// Bind PJAX actions
				this.bind(settings.bind, settings.event);
			}
		},

		/**
		 * Bind element events and form submit events to PJAX
		 *
		 * @param {object} events
		 * @param {($|HTMLElement|string)} [context=document]
		 */
		bind: function(events, context) {
			if (W.$isObject(events)) {
				var keys = Object.keys(events),
					namespace = '.history',
					i = 0;

				for (; i < keys.length; i++) {
					var event = keys[i],
						sel = events[event];

					$(sel).each(function(el) {
						var evt = event.split(' ').map(function(val) {
								return val + namespace;
							}).join(' '),
							loc = el.getAttribute('data-url'),
							a = el;

						if (loc || a.action) {
							a = W._doc.createElement('a');
							a.href = loc || el.action;
						}

						// Ensure the path exists and is local
						if (evt && _isValid(a)) {
							W.events.on(el, evt, function(e) {
								if (! e.metaKey) {
									W.history.go({
										path: a.pathname + a.search + a.hash
									});

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
		 * @param {string} [options.path=current path]
		 * @param {boolean} [options.push=true]
		 * @param {boolean} [options.run=true]
		 * @param {string} [options.title='']
		 * @param {object} [options.request]
		 * @param {($|HTMLElement|string)} [scrollTop]
		 */
		go: function(options) {
			var scope = this,
				priv = scope.$private;

			if (! scope.request) {
				scope.init();
			}

			var global = scope.settings,
				globalRequest = scope.request,
				conf = W.$extend(
					{},
					global,
					options
				),
				request = conf.request || {};

			request.root = request.root !== U ?
				request.root :
				scope.root || '';

			request.url = request.url !== U ?
				request.url :
				conf.path;

			// Navigate to external URL or in fallback nav mode
			var a = W._doc.createElement('a');
			a.href = request.root + request.url;

			if (! _isValid(a) ||
				(! support && conf.fallback == 'nav')) {
				W._win.location = request.root + W.data.$private.getUrl(request);
				return;
			}

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
					if (partials) {
						html = W.$parseHTML('<i>' + html + '</i>');

						// Make partial replacements from response
						W.$each(partials.split(','), function(sel) {
							W.$each(sel, function(el) {
								var target = W.$(sel)[0],
									parent = target.parentNode;

								if (target) {
									conf.action == 'append' ?
										parent.appendChild(el) :
										parent.replaceChild(el, target);
								}

								priv.reset(parent);
							}, {
								context: html
							});
						});
					} else {
						targets.innerHTML = html;

						priv.reset(targets);
					}
				});

				if (request.success) {
					successEvents.push(request.success);
				}

				if (globalRequest.success) {
					successEvents.push(globalRequest.success);
				}

				successEvents.push(function() {
					// Scroll vertically to target
					if (conf.scrollTop !== U) {
						W._body.scrollTop = typeof conf.scrollTop == 'number' ?
							conf.scrollTop :
							W.$(conf.scrollTop)[0].getBoundingClientRect().top +
								W._win.pageYOffset;
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
						priv.process(conf);
					}
				});

				request.complete = completeEvents;

				// Make Ajax request
				request.args = request.args || [];
				request.args.unshift(targets);

				W.data.request(request);
			} else {
				priv.process(conf);
			}
		}
	}, {
		/**
		 * Reset references and variables for a given selector
		 *
		 * @param sel
		 */
		reset: function(sel) {
			var settings = this.$public.settings;

			W.$setRef(sel);
			W.$setVars(sel);

			this.$public.bind(settings.bind, settings.event, sel);
		},

		/**
		 * Process the history state of the request
		 *
		 * @param {object} conf
		 */
		process: function(conf) {
			var key = conf.path.replace(/^\//g, ''),
				request = conf.request,
				method = request.method;

			entries[key] = conf;

			if (! method || method == 'get') {
				conf.path = W.data.$private.getUrl(request);
			}

			// Add entry to HTML5 history
			if (conf.push && support) {
				H.pushState(0, 0, conf.path);
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
					W.routes.run();
				}
			}

			if (conf.push && conf.pushstate) {
				W.$exec(conf.pushstate);
			}

			if (conf.pop && conf.popstate) {
				W.$exec(conf.popstate);
			}

			if (conf.callback) {
				W.$exec(conf.callback);
			}
		}
	});
})(Wee, history, undefined);