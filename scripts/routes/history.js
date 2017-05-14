import { match } from './route-matcher';
import { isSameRoute, START } from './route';

export default class History {
	constructor() {
		this.support = history && history.pushState;
		this.current = START;
	}

	/**
	 * Navigate with HTML5 history
	 *
	 * @param {string} path
	 */
	navigate(path) {
		const route = match(path);
		const matchCount = route.matches.length;
		let i = 0;

		if (isSameRoute(route, this.current)) {
			// TODO: Is a notification needed here?
			return;
		}

		// TODO: Process all callbacks
		for (; i < matchCount; i++) {
			let record = route.matches[i];

			if (record.handler) {
				record.handler(route.params);
			}
		}

		this.updateRoute(route);
	}

	/**
	 * Update the current route
	 *
	 * @param route
	 */
	updateRoute(route) {
		this.current = route;
	}
}