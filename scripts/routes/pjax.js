import $events from 'wee-events';
import { _doc, _win } from 'core/variables';
import { $copy, $extend, $isObject } from 'core/types';
import { $exec } from 'core/core';
import { $each, $parseHTML, $setRef } from 'core/dom';
import { $serializeForm } from 'dom/index';
import { supportsPushState } from './push-state';
import $fetch from 'wee-fetch';
import $ from 'wee-dom';
import { warn } from 'core/warn';
import { parseLocation } from './location';
import { $setVar } from 'wee-store';

let defaults = {
	action: 'replace',
	bind: {
		click: 'a'
	},
	context: 'document',
	fetch: $fetch.create(),
	partials: ['title', 'main'],
	request: {
		method: 'get',
		responseType: 'text',
		headers: {
			'X-PJAX': 'true'
		}
	},
	replace: null
};
let overrides = {
	partials: false,
	action: false
};
let settings = $copy(defaults);
let response = null;
let paused = false;

/**
 * Determine if path is valid for history navigation
 *
 * @param {HTMLElement} el
 * @param {string} [currentPath]
 * @returns {boolean}
 * @private
 */
function _isValid(el, currentPath) {
	// Link has no destination URL
	if (! el.href) { return false; }

	// Link opens a new browser window
	if (el.target === '_blank') { return false; }

	// Link is not absolute URL
	if (! /https?:/.test(el.href)) { return false; }

	// Link is a download
	if (el.hasAttribute('download')) { return false; }

	// Link is supposed to be ignored
	if (el.hasAttribute('data-static')) { return false; }

	// Link is external URL
	if (el.host && el.host !== location.host) { return false; }

	// Link is current page, but with a hash added
	if (el.hash && el.pathname === currentPath) { return false; }

	return true;
}

/**
 * Return current path
 *
 * @private
 * @param {object} [loc]
 * @returns {string}
 */
function _path(loc) {
	loc = loc || location;
	return loc.pathname + loc.search + loc.hash;
}

/**
 * Reset references and variables for a given selector
 *
 * @private
 * @param sel
 */
function _reset(sel) {
	response = null;
	$setRef(sel);
	$setVar(sel);

	pjax.bind(sel);
}

const pjax = {
	_setWindowLocation(location) {
		_win.location = location;
	},

	// Empty callbacks - will be defined by router.pjax
	onError() {},
	onTrigger() {},

	/**
	 * Bind element events and form submit events to callback
	 *
	 * @param {($|HTMLElement|string)} [context=document]
	 */
	bind(context) {
		const current = parseLocation();
		const events = settings.bind;
		context = context || settings.context;

		if (supportsPushState()) {
			const keys = Object.keys(events);
			let i = 0;

			// Iterate through events to be bound
			for (; i < keys.length; i++) {
				const event = keys[i];
				const sel = events[event];

				$each(sel, el => {
					const evts = event.split(' ').map(val => {
							return val + '.pjax';
						}).join(' ');

					// Retrieve data-url off of element
					// Used if element is not <a> tag
					const loc = el.getAttribute('data-url');
					let destination = el;

					// Create <a> tag for validation of URL
					if (loc) {
						let attrs = el.attributes;
						let j = 0;
						let attr;

						destination = _doc.createElement('a');

						// Clone attributes from bound element to new a tag
						for (; j < attrs.length; j++) {
							attr = attrs[j];
							destination.setAttribute(attr.name, attr.value);
						}

						// Set URL
						destination.href = loc;
					}

					// Ensure the path exists and is local
					if (! evts || ! _isValid(destination, current.path)) {
						// TODO: Make this print as verbose only
						// warn('routes', 'PJAX: no events provided or invalid destination URL ' + destination.href);
						return;
					}

					// TODO: Make this reset optional so we can use 'bind' dynamically
					// Remove existing pjax events
					$events.off(el, '.pjax');

					// Bind designated events
					$events.on(el, evts, e => {
						if (paused) {
							warn('routes', 'pjax has been paused - will not trigger navigation');
							return;
						}

						// Don't navigate with control keys
						if (e.metaKey || e.ctrlKey || e.shiftKey) { return; }

						// Don't navigate when preventDefault already called
						if (e.defaultPrevented) { return; }

						// Don't navigate on right click
						if (e.button !== undefined && e.button !== 0) { return; }

						let path = _path(destination);

						e.preventDefault();

						this.onTrigger(path);
					});
				}, {
					context: context
				});
			}
		}
	},

	go(to, from, next) {
		if (paused) {
			warn('routes', 'pjax has been paused - will not request partials');
			return next();
		}

		let request = settings.request;

		// Navigate to external URL or if history isn't supported
		let a = _doc.createElement('a');
		a.href = to.url;

		if (! supportsPushState() || ! _isValid(a, from.fullPath)) {
			// Will trigger full page reload
			this._setWindowLocation(to.fullPath);
			return false;
		}

		request.url = to.fullPath;

		settings.fetch(request)
			.then(res => {
				response = res;
				next();
			})
			.catch(error => {
				next(error);
			});
	},

	/**
	 * Apply configuration
	 *
	 * @param {Object} options
	 */
	init(options = {}) {
		if (supportsPushState()) {
			if (options.onError) {
				this.onError = options.onError;
				delete options.onError;
			}

			settings = $extend(settings, options);

			// https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
			if ('scrollRestoration' in _win.history) {
				_win.history.scrollRestoration = 'manual';
			}

			// Bind all designated elements to trigger navigation
			this.bind();

			return true;
		}

		return false;
	},

	/**
	 * Inform if pjax is currently paused
	 *
	 * @returns {boolean}
	 */
	isPaused() {
		return paused;
	},

	/**
	 * Override partials to be replaced
	 *
	 * @param partials
	 */
	override(options) {
		if (options.partials) {
			overrides.partials = options.partials;
		}

		if (options.action) {
			overrides.action = options.action;
		}
	},

	/**
	 * Pause previously bound pjax from triggering
	 */
	pause() {
		paused = true;
	},

	/**
	 * Replace target partials on DOM
	 */
	replace() {
		let partials = overrides.partials || settings.partials;

		if (paused) {
			warn('routes', 'pjax has been paused - will not replace partials');
			return;
		}

		if (! response) {
			warn('routes', 'no response to use for partial replacement');
			return;
		}

		let html = response.data;

		if (settings.replace) {
			$exec(settings.replace, {
				args: [html, settings]
			});
		}

		html = $parseHTML('<i>' + html + '</i>').firstChild;

		// Make partial replacements from response
		$each(partials, sel => {
			$each(sel, function(el) {
				const target = $(sel)[0];

				// Retain any classes added dynamically to container
				el.className = target.className;

				if (target) {
					const parent = target.parentNode;

					target.innerHTML = el.innerHTML

					_reset(parent);
				}
			}, {
				context: html
			});
		});
	},

	/**
	 * Reset module back to default settings
	 */
	reset() {
		settings = $copy(defaults);
	},

	/**
	 * Resume pjax to normal operating status
	 */
	resume() {
		paused = false;
		overrides = {
			action: false,
			partials: false
		};
	}
};

export default pjax;