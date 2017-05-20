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
		let beforeQueue = [];
		let queue = [];
		let unloadQueue = [];
		// TODO: Determine if these are needed
		// const preloadQueue = [];
		// const popQueue = [];

		for(let i = 0; i < count; i++) {
			const record = records[i];
			const handler = record.handler;

			// Parent callbacks registered before
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

		this.pending = route;
		const recordQueues = this.resolveRecords(route.matched, this.current.matched);

		// Are there route handlers in 'deactivated' records that exist in either activated or updated?
		// If so, remove them from 'deactivation' list and move to 'updated' if in 'activated'
		const handlerQueues = this.resolveHandlers(recordQueues.updated, recordQueues.activated, recordQueues.deactivated);

		// TODO: Update buildQueues to handle new record and handler queues
		const queues = this.buildQueues(recordQueues, handlerQueues);
		const iterator = (hook, next) => {
			hook(route, this.current, to => {
				if (to === false) {
					// TODO: Any feedback necessary here to alert program of aborted navigation?
				}

				next(to);
			});
		};

		runQueue(queues.beforeQueue, iterator, error => {
			if (error) {
				// TODO: Prohibit processing of other routes
			}

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
	 * Determine which route handlers should be updated, activated, or deactivated
	 *
	 * @param {Array} update
	 * @param {Array} activate
	 * @param {Array} deactivate
	 * @returns {Object}
	 */
	resolveHandlers(updatedRecords, activatedRecords, deactivatedRecords) {
		let handlers = {
			update: [],
			activate: [],
			deactivate: []
		};
		let map = { update: {}, activate: {}, deactivate: {} };
		let i;
		const addHandler = function addHandler(h, type = 'update') {
			if (! map[type][h.id]) {
				map[type][h.id] = handlers[type].length;
				handlers[type].push(h);
			}
		}
		const resolveDeactivated = function resolveDeactivated(handler) {
			if (map.activate[handler.id] && ! map.deactivate[handler.id]) {
				// Move from activate to update if handler exists in activated and deactivated records
				handlers.activate[map.activate[handler.id]] = false;
				addHandler(handler);
			} else {
				handlers.deactivate.push(handler);
				map.deactivate[handler.id] = handler;
			}
		}
		const resolveActivate = function resolveActivate() {
			// Remove all handlers that were changed to false by resolveDeactivated
			return  handlers.activate.filter(h => h);
		}

		// Evaluate handlers in records to be updated
		for (i = 0; i < updatedRecords.length; i++) {
			const handler = updatedRecords[i].handler;

			if (Array.isArray(handler)) {
				handler.forEach(h => addHandler(h));
			} else if (handler instanceof RouteHandler) {
				addHandler(handler);
			}
		}

		// Evaluate handlers in records to be activated
		// If handler is already in map, it should only be updated
		for (i = 0; i < activatedRecords.length; i++) {
			const handler = activatedRecords[i].handler;

			if (Array.isArray(handler)) {
				handler.forEach(h => {
					if (! map.update[h.id]) {
						addHandler(h, 'activate');
					}
				});
			} else if (handler instanceof RouteHandler) {
				if (! map.update[handler.id]) {
					addHandler(handler, 'activate');
				}
			}

			handlers.activate = resolveActivate();
		}

		// Evaluate handlers in records to be deactivated
		for (; i < deactivatedRecords.length; i++) {
			const handler = deactivatedRecords[i].handler;

			if (Array.isArray(handler)) {
				const handlerCount = handler.length;
				let j = 0;

				for (; j < handlerCount; j++) {
					resolveDeactivated(handler[j]);
				}
			} else if (handler instanceof RouteHandler) {
				resolveDeactivated(handler);
			}
		}

		return handlers;
	}

	/**
	 * Determine which route records should be updated, activated, or deactivated
	 *
	 * @param {Object} to
	 * @param {Object} from
	 * @returns {Object}
	 */
	resolveRecords(to, from) {
		const max = Math.max(from.length, to.length);
		let i = 0;

		// Determine at what record the two sets of route records diverge
		for (; i < max; i++) {
			if (from[i] !== to[i]) {
				break;
			}
		}

		return {
			updated: to.slice(0, i),
			activated: to.slice(i),
			deactivated: from.slice(i)
		};
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