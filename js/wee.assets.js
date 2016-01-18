(function(W, U) {
	'use strict';

	var groups = {},
		loaded = {},
		root = '',

		_load = {
			/**
			 * Request JavaScript
			 *
			 * @private
			 * @param {string} path
			 * @param {object} conf
			 * @param {string} conf.group
			 * @param {boolean} [conf.async=false]
			 */
			js: function(path, conf) {
				var js = W._doc.createElement('script'),
					fn = function() {
						loaded[js.src] = js;
						_done(conf.group);
					};

				js.async = conf.async === true;
				js.onload = fn;

				js.onerror = function() {
					_fail(conf.group);
				};

				js.src = path;
				W.$('head')[0].appendChild(js);
			},

			/**
			 * Request stylesheet
			 *
			 * @private
			 * @param {string} path
			 * @param {object} conf
			 * @param {string} conf.group
			 */
			css: function(path, conf) {
				var link = W._doc.createElement('link');

				link.rel = 'stylesheet';
				link.href = path;

				link.addEventListener('load', function() {
					loaded[link.href] = link;
					_done(conf.group);
				}, false);

				link.addEventListener('error', function() {
					_fail(conf.group);
				}, false);

				W.$('head')[0].appendChild(link);
			},

			/**
			 * Request image
			 *
			 * @private
			 * @param {string} path
			 * @param {object} conf
			 * @param {string} conf.group
			 */
			img: function(path, conf) {
				var img = new Image();

				img.onload = function() {
					_done(conf.group);
				};

				img.onerror = function() {
					_fail(conf.group);
				};

				img.src = path;
			}
		},

		/**
		 * Decrement remaining asset count
		 *
		 * @private
		 * @param {string} group
		 */
		_done = function(group) {
			groups[group][0]--;
			W.assets.ready(group, {}, false);
		},

		/**
		 * Increment failed asset count
		 *
		 * @private
		 * @param {string} group
		 */
		_fail = function(group) {
			groups[group][2]++;
			_done(group);
		};

	W.assets = {
		/**
		 * Get current asset root or set with specified value
		 *
		 * @param {string} [value]
		 * @returns {string} root
		 */
		root: function(value) {
			if (value) {
				root = value;
			}

			return root;
		},

		/**
		 * Load specified assets with set options
		 *
		 * @param {object} options
		 * @param {boolean} [options.async=false]
		 * @param {boolean} [options.cache=false]
		 * @param {(Array|string)} [options.css]
		 * @param {(Array|function|string)} [options.error]
		 * @param {(Array|string)} [options.files]
		 * @param {string} [options.group]
		 * @param {(Array|string)} [options.img]
		 * @param {(Array|string)} [options.js]
		 * @param {string} [options.root]
		 * @param {(Array|function|string)} [options.success]
		 */
		load: function(options) {
			var files = W.$toArray(options.files),
				js = W.$toArray(options.js),
				css = W.$toArray(options.css),
				img = W.$toArray(options.img),
				root = options.root !== U ? options.root : this.root(),
				now = Date.now(),
				assets = [],
				i = 0,
				type;

			// Create group name if not specified
			if (! options.group) {
				options.group = 'a' + now;
			}

			// Determine file type
			for (; i < files.length; i++) {
				var ext = files[i].split('.').pop().split(/#|\?/)[0];
				type = ext == 'js' || ext == 'css' ?
					ext : /(gif|jpe?g|png|svg|webp)$/i.test(ext) ?
						'img' : '';

				if (type) {
					assets[files[i]] = type;
				}
			}

			for (i = 0; i < js.length; i++) {
				assets[js[i]] = 'js';
			}

			for (i = 0; i < css.length; i++) {
				assets[css[i]] = 'css';
			}

			for (i = 0; i < img.length; i++) {
				assets[img[i]] = 'img';
			}

			// Set file array length to check against
			groups[options.group] = [
				Object.keys(assets).length,
				options,
				0
			];

			// Request each specified file
			for (var file in assets) {
				var noCache = options.cache === false,
					a = W._doc.createElement('a');

				type = assets[file];
				a.href = (root && /^(https?:)?\/\//i.test(file) ? '' : root) +
					file;
				file = a.href;

				if (! loaded[file] || noCache) {
					if (noCache) {
						file += (file.indexOf('?') < 0 ? '?' : '&') + now;
					}

					_load[type](file, options);
				} else {
					_done(options.group);
				}
			}
		},

		/**
		 * Remove one or more files from the DOM
		 *
		 * @param {(Array|string)} files
		 * @param {string} [root='']
		 */
		remove: function(files, root) {
			files = W.$toArray(files);
			root = root || '';

			var a = W._doc.createElement('a');

			files.forEach(function(key) {
				var src = root + files[key];
				a.href = src;
				src = a.href;

				var el = loaded[src];

				if (el !== U) {
					el.parentNode.removeChild(el);
					el = null;
					delete loaded[src];
				}
			});
		},

		/**
		 * Execute callback when specified references are ready
		 *
		 * @param {string} group
		 * @param {object} [options]
		 * @param {Array} [options.args]
		 * @param {(Array|function|string)} [options.error]
		 * @param {object} [options.scope]
		 * @param {(Array|function|string)} [options.success]
		 * @param {boolean} [poll=false]
		 * @returns {boolean} ready
		 */
		ready: function(group, options, poll) {
			var set = groups[group],
				complete = set && ! set[0];

			if (options === U) {
				return complete;
			}

			if (complete) {
				var conf = W.$extend(set[1], options),
					hasErrors = set[2];
				options = {
					args: conf.args,
					scope: conf.scope
				};

				if (conf.error && hasErrors) {
					W.$exec(conf.error, options);
				} else if (conf.success && ! hasErrors) {
					W.$exec(conf.success, options);
				}
			} else if (poll) {
				setTimeout(function() {
					W.assets.ready(group, {}, true);
				}, 20);
			}
		}
	};

	/**
	 * Cache existing CSS and JavaScript assets
	 */
	W.$each('link[rel="stylesheet"], script[src]', function(el) {
		loaded[el.src || el.href] = el;
	});
})(Wee, undefined);