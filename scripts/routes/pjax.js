import $events from 'wee-events';
import { _doc, _win } from 'core/variables';
import { $copy, $extend, $isObject } from 'core/types';
import { $exec } from 'core/core';
import { $each, $parseHTML, $setRef } from 'core/dom';
import { $serializeForm } from 'dom/index';
import { supportsPushState } from './push-state';
import $fetch from 'wee-fetch';
import $ from 'wee-dom';

let defaults = {
	bind: {
		click: 'a',
		submit: 'form'
	},
	context: 'document',
	fetch: $fetch.create(),
	partials: 'title,main',
	request: {
		method: 'get',
		responseType: 'text',
		headers: {
			'X-PJAX': 'true'
		}
	},
	replace: null
};
let settings = $copy(defaults);
let response = null;

/**
 * Determine if path is valid for history navigation
 *
 * @param {HTMLElement} el
 * @param {string} [currentPath]
 * @returns {boolean}
 * @private
 */
function _isValid(el, currentPath) {
	// TODO: Add warnings to reasons for invalid URL
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

	if (! currentPath) { return true; }

	// TODO: Remove whitelisting logic
	let exts = settings.extensions;
	let segs = currentPath.split('.');
	let ext;

	if (segs.length > 1) {
		ext = segs.pop().split(/#|\?/)[0];
	}

	// No file extension in URL or extension is whitelisted
	return ! ext || (exts && exts.indexOf(ext) > -1);
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
	// TODO: Uncomment when $setVar is added
	// $setVar(sel);

	pjax.bind(sel);
}

const pjax = {
	// Empty callback - will be defined by router.pjax
	onTrigger() {},

	/**
	 * Bind element events and form submit events to callback
	 *
	 * @param {($|HTMLElement|string)} [context=document]
	 */
	bind(context) {
		const events = settings.bind;
		context = context || settings.context;

		if (supportsPushState) {
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
					if (! evts || ! _isValid(destination)) {
						// TODO: Warn user that no events were provided or that URL was not valid
						// TODO: Split out conditional
						return;
					}

					// TODO: Make this reset optional so we can use 'bind' dynamically
					// Remove existing pjax events
					$events.off(el, '.pjax');

					// Bind designated events
					$events.on(el, evts, (e, el) => {
						// TODO: Add warnings
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
		let request = settings.request;

		// Navigate to external URL or if history isn't supported
		let a = _doc.createElement('a');
		a.href = to.url;

		if (! supportsPushState || ! _isValid(a, from.fullPath)) {
			_win.location = to.fullPath;
			return false;
		}

		request.url = to.fullPath;

		settings.fetch(request)
			.then(res => {
				response = res;
				next();
			})
			.catch(error => {
				// TODO: What to do if AJAX request fails?
				next(false);
			});
	},

	/**
	 * Apply configuration
	 *
	 * @param {Object} options
	 */
	init(options) {
		if (supportsPushState) {
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
	 * Replace target partials on DOM
	 */
	replace() {
		let html = response.data;
		let modHtml;

		if (settings.replace) {
			modHtml = $exec(settings.replace, {
				args: [html, settings]
			});

			// Returning false prevents PJAX replacement
			// No explicit return will leave original html alone
			html = html === false ? false : modHtml || html;
		}

		// TODO: Warn that route will not replace partials
		if (html === false) {
			return;
		}

		html = $parseHTML('<i>' + html + '</i>').firstChild;

		// Make partial replacements from response
		// TODO: Change string format to array
		$each(settings.partials.split(','), sel => {
			$each(sel, function(el) {
				const target = $(sel)[0];

				if (target) {
					const parent = target.parentNode;

					settings.action === 'append' ?
						parent.appendChild(el) :
						parent.replaceChild(el, target);

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
	}
};

export default pjax;