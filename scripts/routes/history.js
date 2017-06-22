// TODO: May need to move promise polyfill to an entry point file if building dist version of Wee
import 'es6-promise/auto';
import { match, noMatch } from './route-matcher';
import { isSameRoute, START } from './route';
import RouteHandler from './route-handler';
import runQueue from './async-queue';
import { getHooks } from './global-hooks';
import { $isFunction, $isString } from '../core/types';
import { warn } from './warn';
import { _win } from 'core/variables';
import { pushState, replaceState } from './push-state';
import { QueueError, SameRouteError } from './error';
import { parseLocation } from './location';
import $router from 'wee-routes';
import { handleScroll, saveScrollPosition } from './scroll';
import { setStateKey } from './push-state';

export default class History {
	constructor(scrollBehavior) {
		this.ready = false;
		this.current = START;
		this.previous = null;
		this.begin = function(to, from, next) { next(); };
		this.replacePage = function() {};
		this.readyQueue = [];
		this.resetReady = function resetReady() {
			this.readyQueue = [];
		}
		this.scrollBehavior = scrollBehavior;
		this.popstate = (e) => {
			let location = parseLocation();
			let scroll = $router.settings.scrollBehavior;

			// Leave hash navigation alone
			if (location.path === this.current.path && location.search === this.current.search) {
				// TODO: Verbose
				// warn('hash change caused popstate. popstate callback halted.');
				return;
			}

			if (scroll) {
				// Update scroll position for URL that was navigated away from
				saveScrollPosition();

				// Update state key now that we have navigated to different url
				if (e.state && e.state.key) {
					setStateKey(e.state.key);
				}
			}

			this.navigate().then(route => {
				handleScroll(route, this.previous, $router.settings.scrollBehavior, true);
			}).catch(error => {
				// TODO: What to do with this error?
				// TODO: Register onError callbacks from routes
			});
		};

		// TODO: Bind popstate for scrolling
		_win.addEventListener('popstate', this.popstate);
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
		const afterQueue = this.extract(records.activated, 'after')
			.concat(afterEach);

		return {
			beforeQueue,
			queue,
			unloadQueue,
			afterQueue
		}
	}

	/**
	 * Make sure that URL matches history state
	 */
	ensureUrl() {
		if (this.current !== START) {
			replaceState(this.current.fullPath);
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
	 * Process routes against new path
	 *
	 * @param {string|Object} [path]
	 */
	navigate(path) {
		return new Promise((resolve, reject) => {
			const route = match(path);

			// Do not navigate if destination is same as current route
			if (isSameRoute(route, this.current)) {
				this.ensureUrl();
				warn('attempted to navigate to current URL');
				return reject(new SameRouteError('attempted to navigate to ' + route.fullPath));
			} else if (noMatch(route)) {
				this.ensureUrl();
				warn('no route match was found and notFound has not been registered.');
				return;
			}

			const records = this.resolveRecords(route.matched, this.current.matched);
			const handlers = this.resolveHandlers(records.updated, records.activated, records.deactivated);

			const queues = this.buildQueues(records, handlers);
			const iterator = (hook, next) => {

				hook(route, this.current, to => {
					if (to === false) {
						to = new QueueError('queue stopped prematurely');
					}

					next(to);
				});
			};

			// Register global before hook, if necessary - PJAX
			queues.beforeQueue.unshift(this.begin);

			// Before hooks
			runQueue(queues.beforeQueue, iterator, error => {
				// Ensure we are where we started
				if (error) {
					this.ensureUrl();
					warn(error.message);
					return reject(error);
				}

				// Do not process unload hooks on initialization
				// No assets exist to be unloaded, and could cause errors
				if (this.ready) {
					// Unload hooks
					queues.unloadQueue.forEach(unload => {
						if ($isString(unload)) {
							// TODO: Destroy events, screen map, and store based on namespace
						} else if ($isFunction(unload)) {
							unload(route, this.current);
						}
					});
				}

				// Global DOM replacement, if needed
				this.replacePage();

				// Init/update hooks
				queues.queue.forEach(fn => fn(route, this.current));

				// After hooks
				this.updateRoute(route, queues.afterQueue);

				// Execute ready callbacks
				if (! this.ready) {
					this.ready = true;
					this.readyQueue.forEach(cb => cb());
					this.resetReady();
				}

				resolve(route);

				// TODO: ensureURL? Is there a case for the need to check to make sure that onComplete is updating the URL?
				// TODO: If history can be turned off, then it may make sense (no popstate binding, no push, replace, etc)
			});
		});
	}

	/**
	 * Execute callback(s) after history has been initialized
	 *
	 * @param {Function} success
	 */
	onReady(success) {
		if (this.ready) {
			success();
		} else {
			this.readyQueue.push(success);
		}
	}

	/**
	 * Navigate and add record to history
	 *
	 * @param {string|Object} path
	 */
	push(path) {
		return this.navigate(path)
			.then(route => {
				pushState(route.fullPath);
				handleScroll(route, this.previous, $router.settings.scrollBehavior);
			});
	}

	/**
	 * Navigate and replace current history record
	 *
	 * @param {string|Object} [path]
	 */
	replace(path) {
		return this.navigate(path)
			.then(route => {
				replaceState(route.fullPath);
				handleScroll(route, this.previous, $router.settings.scrollBehavior);
			});
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
			if (map.activate.hasOwnProperty(handler.id) && ! map.deactivate[handler.id]) {
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
		for (i = 0; i < deactivatedRecords.length; i++) {
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
	 * Update the current route and execute after hooks
	 *
	 * @param {*|Object} route - Route object
	 * @param {Array} [afterQueue]
	 */
	updateRoute(route, afterQueue) {
		this.previous = this.current;
		this.current = route;

		if (afterQueue) {
			afterQueue.forEach(fn => fn(route, this.previous));
		}
	}
}