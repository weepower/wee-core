import { $exec } from './core/core';
import { _doc , U} from './core/variables';
import { $toArray, $extend } from './core/types';
import { $each } from 'core/dom';

const groups = {};
const loaded = {};
let root = '';
let groupId = 1;

export const _load = {
	js(path, conf) {
		const js = _doc.createElement('script');

		js.async = conf.async === true;
		js.onload = () => {
			loaded[js.src] = js;
			_done(conf.group);
		};

		js.onerror = () => {
			_fail(conf.group);
		};

		js.src = path;
		_doc.head.appendChild(js);
	},

	/**
	 * Request stylesheet
	 *
	 * @private
	 * @param {string} path
	 * @param {Object} conf
	 * @param {string} conf.group
	 */
	css(path, conf) {
		const link = _doc.createElement('link');

		link.rel = 'stylesheet';
		link.href = path;

		link.addEventListener('load', () => {
			loaded[link.href] = link;
			_done(conf.group);
		}, false);

		link.addEventListener('error', () => {
			_fail(conf.group);
		}, false);

		_doc.head.appendChild(link);
	},

	/**
	 * Request image
	 *
	 * @private
	 * @param {string} path
	 * @param {Object} conf
	 * @param {string} conf.group
	 */
	img(path, conf) {
		let img = new Image();

		img.onload = function() {
			_done(conf.group);
		};

		img.onerror = function() {
			_fail(conf.group);
		};

		img.src = path;
	}
}

/**
 * Increment failed asset count
 *
 * @private
 * @param {string} group
 */
function _fail(group) {
	groups[group][2]++;
	_done(group);
};


/**
 * Decrement remaining asset count
 *
 * @private
 * @param {string} group
 */
function _done(group) {
	groups[group][0]--;
	assetModule.ready(group, {}, false);
}

const assetModule = {
	/**
	 * Get current asset root or set with specified value
	 *
	 * @param {string} [value]
	 * @returns {string} root
	 */
	root(value) {
		if (typeof value === 'string') {
			root = value;
		}

		return root;
	},

	/**
	 * Load specified assets with set options
	 *
	 * @param {Object} options
	 * @param {boolean} [options.async=false]
	 * @param {boolean} [options.cache=false]
	 * @param {(Array|string)} [options.styles]
	 * @param {(Array|function|string)} [options.error]
	 * @param {(Array|string)} [options.files]
	 * @param {string} [options.group]
	 * @param {(Array|string)} [options.images]
	 * @param {(Array|string)} [options.scripts]
	 * @param {string} [options.root]
	 * @param {(Array|function|string)} [options.success]
	 */
	load(options) {
		const files = $toArray(options.files);
		const js = $toArray(options.scripts);
		const css = $toArray(options.styles);
		const img = $toArray(options.images);
		const root = options.root !== U ? options.root : this.root();
		let assets = {};
		let i = 0;
		let type;

		// Create group name if not specified
		if (! options.group) {
			options.group = 'g' + groupId++;
		}

		// Determine file type
		for (; i < files.length; i++) {
			let ext = files[i].split('.').pop().split(/#|\?/)[0];
			type = ext === 'js' || ext === 'css' ?
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
		for (let file in assets) {
			if (assets.hasOwnProperty(file)) {
				let noCache = options.cache === false;
				let a = _doc.createElement('a');

				type = assets[file];
				a.href = (root && /^(https?:)?\/\//i.test(file) ? '' : root) +
					file;
				file = a.href;

				if (! loaded[file] || noCache) {
					if (noCache) {
						file += (file.indexOf('?') < 0 ? '?' : '&') + Date.now();
					}

					_load[type](file, options);
				} else {
					_done(options.group);
				}
			}
		}
	},

	/**
	 * Remove one or more files from the DOM
	 *
	 * @param {(Array|string)} files
	 * @param {string} [root='']
	 */
	remove(files, root = '') {
		files = $toArray(files);

		const a = _doc.createElement('a');
		let i = 0;

		for (; i < files.length; i++) {
			let src = root + files[i];
			a.href = src;
			src = a.href;

			let el = loaded[src];

			if (el !== U) {
				el.parentNode.removeChild(el);
				el = null;
				delete loaded[src];
			}
		}
	},

	/**
	 * Execute callback when specified references are ready
	 *
	 * @param {string} group
	 * @param {Object} [options]
	 * @param {Array} [options.args]
	 * @param {(Array|function|string)} [options.error]
	 * @param {Object} [options.scope]
	 * @param {(Array|function|string)} [options.success]
	 * @param {boolean} [poll=false]
	 * @returns {boolean} ready
	 */
	ready(group, options, poll) {
		let set = groups[group];
		let complete = set && ! set[0];

		if (options === U) {
			return complete;
		}

		if (complete) {
			let conf = $extend(set[1], options);
			let hasErrors = set[2];
			options = {
				args: conf.args,
				scope: conf.scope
			};

			if (conf.error && hasErrors) {
				$exec(conf.error, options);
			} else if (conf.success && ! hasErrors) {
				$exec(conf.success, options);
			}
		} else if (poll) {
			setTimeout(() => {
				this.ready(group, options, true);
			}, 20);
		}
	}
}

/**
 * Cache existing CSS and JavaScript assets
 */
$each('link[rel="stylesheet"], script[src]', el => loaded[el.src || el.href] = el);

export default assetModule;