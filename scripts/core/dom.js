import { _doc, _body } from 'core/variables';
import { $exec } from 'core/core';

let range;

/**
 * Create document fragment from an HTML string
 *
 * @param {string} html
 * @returns {HTMLElement} element
 */
export const $parseHTML = html => {
	let el;
	html = html.trim();

	if (! range) {
		range = _doc.createRange();
		range.selectNode(_body);
	}

	if (range && range.createContextualFragment) {
		el = range.createContextualFragment(html);
	} else {
		let div = _doc.createElement('div'),
			child;
		el = _doc.createDocumentFragment();

		div.innerHTML = html;

		while (child = div.firstChild) {
			el.appendChild(child);
		}
	}

	return el;
};

/**
 * Execute specified function when document is ready
 *
 * @param {(Array|function|string)} fn
 */
export const ready = fn => {
	_doc.readyState == 'complete' ?
		$exec(fn) :
		_doc.addEventListener('DOMContentLoaded', function() {
			$exec(fn);
		});
};