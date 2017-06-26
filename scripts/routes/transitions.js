import { $each } from 'core/dom';
import { _doc } from 'core/variables';
import { _slice } from 'core/types';
import { $addClass, $removeClass } from 'dom/index';

let complete = 0;
let transitionEvent = _whichTransitionEvent();
let ready = true;
let pending = false;
let countEvents = function countEvents() {
	complete += 1;

	if (pending && pending.elements.length === complete) {
		ready = true;
		transition.enter(pending.config);
	}
};

/**
 * Detect what transition property to listen for
 *
 * @returns {*}
 * @private
 */
function _whichTransitionEvent() {
	const el = document.createElement('meta');
	const animations = {
		'transition': 'transitionend',
		'OTransition': 'oTransitionEnd',
		'MozTransition': 'transitionend',
		'WebkitTransition': 'webkitTransitionEnd'
	};

	for (let t in animations) {
		if (el.style[t] !== undefined){
			return animations[t];
		}
	}
}

const transition = {
	/**
	 * Enter the new page
	 *
	 * @param {Object} config
	 * @param {Object} [to]
	 * @param {Object} [from]
	 */
	enter(config, to, from) {
		if (! ready) {
			return;
		}

		if (pending && pending.elements.length) {
			pending.elements.forEach((el) => {
				el.removeEventListener(transitionEvent, countEvents);
				$removeClass(el, config.class);
			});

			this.reset();
		} else if (config.target && config.class) {
			$each(config.target, (el) => {
				$removeClass(el, config.class);
			});
		}

		if (config.enter) {
			config.enter(to, from);
		}
	},

	/**
	 * Leave the current page
	 *
	 * @param {Object} config
	 * @param {Object} [to]
	 * @param {Object} [from]
	 */
	leave(config, to, from) {
		if (config.target && config.class) {
			let elements = _slice.call(_doc.querySelectorAll(config.target));

			if (elements.length) {
				ready = false;

				$each(elements, (el) => {
					el.addEventListener(transitionEvent, countEvents);

					$addClass(el, config.class);
				});

				pending = {
					config,
					elements
				};
			}
		}

		if (config.leave) {
			config.leave(to, from);
		}
	},

	/**
	 * Reset module state
	 */
	reset() {
		ready = true;
		complete = 0;
		pending = false;
	}
};

export default transition;