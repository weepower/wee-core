import { match } from './route-matcher';
import { isSameRoute, START } from './route';
import RouteHandler from './route-handler';
import runQueue from './async-queue';
import { getHooks } from './global-hooks';

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
	 * @param {Object} records
	 * 	@param {Array} records.updated
	 * 	@param {Array} records.activated
	 * 	@param {Array} records.deactivated
	 * @param {Object} handlers
	 * 	@param {Array} handlers.updated
	 * 	@param {Array} handlers.activated
	 * 	@param {Array} handlers.deactivated
	 * @returns {Object}
	 */
	buildQueues(records, handlers) {
		const { beforeEach, afterEach } = getHooks();

		const beforeQueue = beforeEach
			.concat(this.extract(records.updated, 'before'))
			.concat(this.extract(records.activated, 'before'))
			.concat(this.extract(handlers.updated, 'beforeUpdate'))
			.concat(this.extract(handlers.activated, 'beforeInit'));
		const unloadQueue = this.extract(handlers.deactivated, 'unload')
			.concat(this.extract(records.deactivated, 'unload'));
		const queue = this.extract(records.updated, 'update')
			.concat(this.extract(records.activated, 'init'))
			.concat(this.extract(handlers.updated, 'update'))
			.concat(this.extract(handlers.activated, 'init'));
		const afterQueue = afterEach;

		return {
			beforeQueue,
			queue,
			unloadQueue,
			afterQueue
		}
	}

	/**
	 * Extract specific callback from all objects provided
	 *
	 * @param {Array} records
	 * @param {string} type
	 * @returns {Array}
	 */
	extract(records, type) {
		const recordCount = records.length;
		let result = [];
		let i = 0;

		for (; i < recordCount; i++) {
			if (records[i][type]) {
				result.push(records[i][type]);
			}
		}

		return result;
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
		const records = this.resolveRecords(route.matched, this.current.matched);
		const handlers = this.resolveHandlers(records.updated, records.activated, records.deactivated);

		const queues = this.buildQueues(records, handlers);
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
				return false;
			}

			queues.queue.forEach(fn => fn(route, this.current));
			// TODO: Finish queues
			queues.afterQueue.forEach(fn => fn(route, this.current));
		});

		// TODO: How to know to update URL?
		// TODO: How to know to do PJAX?

		this.updateRoute(route);
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
		// If handler has already been mapped, it should only be updated
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
		}

		// Evaluate handlers in records to be deactivated
		// If route handler is in activate and deactivate, move to update instead
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

			// Clean up activated handlers moved to updated
			handlers.activate = resolveActivate();
		}

		return {
			updated: handlers.update,
			activated: handlers.activate,
			deactivated: handlers.deactivate
		};
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