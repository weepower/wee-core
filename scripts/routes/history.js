import { match } from './route-matcher';
import { isSameRoute, START } from './route';
import { $isArray, $isFunction } from '../core/types';
import RouteHandler from './route-handler';
import runQueue from './async-queue';

export default class History {
	constructor() {
		this.support = history && history.pushState;
		this.current = START;
	}

	/**
	 * Shared logic between route records and route handlers
	 *
	 * @param {Object|RouteHandler} obj
	 * @param {Array} beforeQueue
	 * @param {Array} queue
	 * @returns {Object|RouteHandler}
	 */
	addToQueue(obj, beforeQueue, queue) {
		if (obj.processed) {
			if (obj.beforeUpdate) {
				beforeQueue.push(obj.beforeUpdate);
			}

			if (obj.update) {
				queue.push(obj.update);
			}
		} else {
			if (obj.beforeInit) {
				beforeQueue.push(obj.beforeInit);
			}

			if (obj.init) {
				queue.push(obj.init);
			}
		}

		obj.processed = true;

		return obj;
	}

	/**
	 * Build out callback queues for processing
	 *
	 * @param {Array} records
	 */
	buildQueues(records) {
		const count = records.length;
		const beforeQueue = [];
		const queue = [];
		const unloadQueue = [];
		// TODO: Determine if these are needed
		// const preloadQueue = [];
		// const popQueue = [];

		for(let i = 0; i < count; i++) {
			let record = records[i];
			const handler = record.handler;

			// TODO: If keeping state property on each record, make sure to update both pathMap and nameMap
			if (handler) {
				if ($isArray(handler)) {
					let count = handler.length;

					for (let j = 0; j < count; j++) {
						this.processHandler(handler[j], beforeQueue, queue);
					}
				} else {
					this.processHandler(handler, beforeQueue, queue);
				}
			}

			this.addToQueue(record, beforeQueue, queue);
		}

		return {
			beforeQueue,
			queue,
			unloadQueue
		}
	}

	/**
	 * Navigate with HTML5 history
	 *
	 * @param {string} path
	 */
	navigate(path) {
		const route = match(path);

		if (isSameRoute(route, this.current)) {
			// TODO: Is a notification needed here?
			return;
		}

		const queues = this.buildQueues(route.matches);
		const iterator = (hook, next) => {
			hook(route, this.current, to => {
				next(to);
			});
		};

		runQueue(queues.beforeQueue, iterator, () => {
			// TODO: Finish queues
		});

		// TODO: How to know to update URL?
		// TODO: How to know to do PJAX?

		this.updateRoute(route);
	}

	/**
	 * Determine what to do with route record handler
	 *
	 * @param {Function|RouteHandler} handler
	 * @param {Array} beforeQueue
	 * @param {Array} queue
	 */
	processHandler(handler, beforeQueue, queue) {
		if ($isFunction(handler)) {
			queue.push(handler);
		} else if (handler instanceof RouteHandler) {
			this.addToQueue(handler, beforeQueue, queue);
		}
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