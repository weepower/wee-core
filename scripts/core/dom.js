import { _doc } from 'core/variables';
import { $exec } from 'core/core';

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