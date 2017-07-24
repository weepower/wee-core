import { isIE } from './browsers';
import $events from 'wee-events';

export function removeEvents() {
	let elements = document.body.getElementsByTagName('*');

	for (let i = elements.length; i--;) {
		let oldElement = elements[i];
		let newElement = oldElement.cloneNode(true);

		oldElement.parentNode.replaceChild(newElement, oldElement);
	}

	$events.off();
}

export function triggerEvent(el, type, bubbles = true, cancelable = true) {
	if (isIE()) {
		let e = document.createEvent('HTMLEvents');
		e.initEvent(type, bubbles, cancelable);
		el.dispatchEvent(e);
	} else {
		let e = new Event(type, {
			bubbles,
			cancelable
		});

		el.dispatchEvent(e);
	}
}