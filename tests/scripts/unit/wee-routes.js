import $router from 'wee-routes';
import { history, RouteHandler } from 'wee-routes';
import sinon from 'sinon';
import $screen from 'wee-screen';
import $events from 'wee-events';
import $store from 'wee-store';

const basicRoutes = [
	{
		path: '/',
		init() {
			//
		}
	},
	{
		path: '/about',
		init() {
			//
		}
	}
];

function setPath(path) {
	window.history.replaceState(0, '', path);
}

describe('Router', () => {
	after($router.reset);

	before(() => {
		setPath('/');
	});

	it('should set scroll behavior callback', () => {
		expect($router.settings.scrollBehavior).to.be.a('function');

		$router({
			scrollBehavior: true
		});

		expect($router.settings.scrollBehavior).to.be.true;
		expect(history.scrollBehavior).to.be.true;
	});

	describe('afterEach', () => {
		let state = false;

		beforeEach(() => {
			$router.reset();
			$router.map(basicRoutes);
		});

		afterEach(() => {
			state = false;
		});

		it('should register global after hook', done => {
			$router.afterEach(() => {
				state = true;
			}).onReady(() => {
				expect(state).to.be.true;
				done();
			}).run();
		});
	});

	describe('beforeEach', () => {
		let state = false;

		beforeEach(() => {
			$router.reset();
			$router.map(basicRoutes);
		});
		afterEach(() => {
			state = false;
		});

		it('should register global before hook', () => {
			$router.beforeEach(() => {
				state = true;
			}).run();

			expect(state).to.be.true;
		});
	});

	describe('map', () => {
		let state = false;
		let stateArray = [];

		beforeEach(() => {
			$router.reset();
		});

		afterEach(() => {
			state = false;
			stateArray = [];
		});

		it('should accept an array of objects', () => {
			$router.map(basicRoutes);

			expect($router.routes(null, 'list').length).to.equal(2);
		});

		it('should not overwrite existing path object', () => {
			$router().map([
					{ path: '/', handler: 'old handler' }
				])
				.map(basicRoutes);

			let routes = $router().routes();

			expect(Object.keys(routes).length).to.equal(2);
			expect(routes['/'].handler).to.equal('old handler');
			expect(routes['/about'].path).to.equal('/about');
		});

		it('should map nested children routes', () => {
			$router().map(basicRoutes)
				.map([
					{
						path: '/parent/:id',
						handler: () => {},
						children: [
							{ path: 'child', handler: 'I am a child' },
							{ path: 'child2', handler: 'I am a second child' }
						]
					}
				]);

			const list = $router().routes(null, 'list');
			const routes = $router().routes();

			// Verify mapping objects are correct
			expect(Object.keys(routes).length).to.equal(5);
			expect(routes['/parent/:id/child']).to.be.an('object');
			expect(routes['/parent/:id/child'].path).to.equal('/parent/:id/child');
			expect(routes['/parent/:id/child'].handler).to.equal('I am a child');

			// Verify that order of mapping of child routes is correct
			expect(list[2]).to.equal('/parent/:id/child');
			expect(list[3]).to.equal('/parent/:id/child2');
			expect(list[4]).to.equal('/parent/:id');
		});

		it('should map by route name if provided', () => {
			$router().map([
					{
						name: 'home',
						path: '/',
						handler: 'this is the home route handler'
					},
					{
						name: 'parent',
						path: '/parent/:id',
						handler: () => {},
						children: [
							{ name: 'child', path: 'child', handler: 'I am a child' }
						]
					}
				]);

				let routes = $router().routes(null, 'name');

				expect(routes.home.path).to.equal('/');
				expect(routes.parent.path).to.equal('/parent/:id');
				expect(routes.child.path).to.equal('/parent/:id/child');
		});

		it('should prepend / if route has no parent', () => {
			$router().map([
				{ path: 'something', handler: () => {} }
			]);

			expect($router().routes()['/something'].path).to.equal('/something');
		});

		describe('children', () => {
			it('should prefix parent path to child path(s)', () => {
				$router.reset();
				$router.map([
					{
						path: '/parent',
						children: [
							{ name: 'child', path: 'child' },
							{ name: 'child2', path: 'child2' }
						]
					}
				]);

				expect($router.routes('child').path).to.equal('/parent/child');
				expect($router.routes('child2').path).to.equal('/parent/child2');
			});

			it('should place children before parent routes for evaluation', () => {
				$router.reset();
				$router.map([
					{
						path: '/parent',
						children: [
							{ name: 'child', path: 'child' }
						]
					}
				]);

				expect($router.routes(null, 'list')).to.deep.equal(['/parent/child', '/parent']);
			});
		});

		describe('handler', () => {
			it('should accept RouteHandler', done => {
				let state = false;

				setPath('/accepts/route-handler');
				$router().map([
					{
						path: '/accepts/route-handler',
						handler: new RouteHandler({
							init() {
								state = true;
							}
						})
					}
				]).onReady(() => {
					expect(state).to.be.true;
					done();
				}).run();
			});

			it('should accept array of route handlers', done => {
				let stateArray = [];

				setPath('/accepts/mixture');
				$router().map([
					{
						path: '/accepts/mixture',
						handler: [
							new RouteHandler({
								init() {
									stateArray.push('handler 1');
								}
							}),
							new RouteHandler({
								init() {
									stateArray.push('handler 2');
								}
							}),
							new RouteHandler({
								init() {
									stateArray.push('handler 3');
								}
							}),
						]
					}
				]).onReady(() => {
					expect(stateArray).to.deep.equal(['handler 1', 'handler 2', 'handler 3']);
					done();
				}).run();
			});
		});
	});

	describe('notFound', () => {
		let state = false;
		let stateArray = [];

		beforeEach(() => {
			$router.reset();
		});

		afterEach(() => {
			state = false;
			stateArray = [];
		});

		it('should register wildcard route record to evaluate if no match found', done => {
			setPath('/asdf');

			$router.map(basicRoutes)
				.notFound({ init() { state = true; } })
				.onReady(() => {
					expect(state).to.be.true;
					done();
				})
				.run();
		});
	});

	describe('routes', () => {
		beforeEach($router().reset);

		it('should return route path mapping', () => {
			$router.map(basicRoutes);

			expect($router.routes()).to.be.an('object');
			expect($router.routes()['/'].path).to.equal('/');
		});

		it('should return the route with specific path', () => {
			$router.map(basicRoutes);

			expect($router.routes(null, 'list').length).to.equal(2);
			expect($router.routes('/')).to.be.an('object');
			expect($router.routes('/about').path).to.equal('/about');
		});

		it('should return the route with specific name', () => {
			$router.map([
				{ path: '/other', name: 'test', handler: () => {} }
			].concat(basicRoutes));

			expect($router.routes('test').path).to.equal('/other');
		});

		it('should return null if route does not exist', () => {
			$router.map([
				{ path: '/' }
			]);

			expect($router.routes('nothing')).to.be.null;
		});

		it('should return the route name mapping', () => {
			$router.map([{ path: '/other', name: 'test', handler: () => {} }].concat(basicRoutes));

			const nameMap = $router.routes(null, 'name');

			expect(nameMap).to.be.an('object');
			expect(nameMap.test.path).to.equal('/other');
		});

		it('should return the route path list', () => {
			$router.map(basicRoutes);

			expect($router.routes(null, 'list')).to.deep.equal(['/', '/about']);
		});
	});

	describe('run', () => {
		let state = false;
		let stateArray = [];

		before(() => {
			setPath('/');
		});

		beforeEach(() => {
			$router.reset();
		});

		afterEach(() => {
			state = false;
			stateArray = [];
		});

		it('should match one route', () => {
			$router.map(basicRoutes).run();

			expect($router.currentRoute().path).to.equal('/');
		});

		it('should not evaluate identical route two times in a row', done => {
			$router.map([
				{ path: '/', init() { stateArray.push('init'); }, update() { stateArray.push('update'); } }
			]).run();

			$router.onReady(() => {
				expect(stateArray).to.deep.equal(['init']);
				done();
			}).run();
		});

		it('should match child route before parent', done => {
			let parent = false;
			let child = false;
			setPath('/parent/something/child');

			$router.map(basicRoutes.concat([
				{
					path: '/parent/:id',
					init() {},
					children: [
						{
							path: 'child',
							init() {}
						}
					]
				}
			])).onReady(() => {
				expect($router.currentRoute().matched.length).to.equal(2);
				done();
			}).run();
		});

		it('should pass multiple url variables in route objects to functions', () => {
			setPath('/blog/tech/2017/10/5/blog-title');
			$router().map([
				{
					path: '/blog/:category/:year/:month/:day/:slug',
					init(to, from) {
						const params = to.params;

						expect(params.category).to.equal('tech');
						expect(params.year).to.equal(2017);
						expect(params.month).to.equal(10);
						expect(params.day).to.equal(5);
						expect(params.slug).to.equal('blog-title');
					}
				}
			]);
		});

		it('should evaluate wildcard routes and run functions accordingly', done => {
			setPath('/test/test2/3');
			$router().map([
				{
					path: '/test/*',
					init(to, from) {
						expect(to.params[0]).to.equal('test2/3');
						stateArray.push(1);
					}
				}
			]).onReady(() => {
				expect(stateArray.length).to.equal(1);
				done();
			}).run();
		});

		it('should create and maintain "current" object', done => {
			const handler = function() {};
			setPath('/path/to/stuff?key=value&key2=value2#hash');

			$router().map([
				{ name: 'home', path: '/path/to/:place', handler: handler, meta: {test: 'meta'} }
			]).onReady(() => {
				expect($router.currentRoute()).to.deep.equal({
					name: 'home',
					meta: {test: 'meta'},
					path: '/path/to/stuff',
					hash: 'hash',
					query: {key: 'value', key2: 'value2'},
					params: {place: 'stuff'},
					search: '?key=value&key2=value2',
					segments: ['path', 'to', 'stuff'],
					fullPath: '/path/to/stuff?key=value&key2=value2#hash',
					matched: [
						{
							before: undefined,
							handler: handler,
							init: undefined,
							update: undefined,
							after: undefined,
							unload: undefined,
							pop: undefined,
							meta: {test: 'meta'},
							name: 'home',
							parent: undefined,
							path: '/path/to/:place',
							regex: /^\/path\/to\/((?:[^\/]+?))(?:\/(?=$))?$/i
						}
					],
					transition: null
				});

				done();
			}).run();
		});

		it('should parse url variable parameters and pass to functions', done => {
			setPath('/blog/5');

			$router().map([
				{
					path: '/blog/:id',
					init(to, from) {
						state = true;
						expect(to.params.id).to.equal(5);
					}
				}
			]).onReady(() => {
				expect(state).to.be.true;
				done();
			}).run();
		});

		describe('before hooks', () => {
			before(() => {
				setPath('/');
			});
			beforeEach(() => {
				$router.reset();
			});

			it('should evaluate before hook of matched route record', () => {
				$router().map([
					{
						path: '/',
						before(to, from, next) {
							state = 'home';
							next();
						}
					},
					{
						path: '*',
						before(to, from, next) {
							state = 'catch all';
							next();
						}
					}
				]).run();

				expect(state).to.equal('home');
			});

			it('should resolve before hooks asynchronously', done => {
				$router.map([
					{
						path: '/',
						before(to, from, next) {
							setTimeout(() => {
								state = true;
								next();
							}, 250);
						}
					}
				]).run().then(() => {
					expect(state).to.be.true;
				}).then(done, done);
			});

			it('should evaluate global before hooks', () => {
				$router.beforeEach((to, from, next) => {
					stateArray.push('before each');
				}).run();

				expect(stateArray).to.deep.equal(['before each']);
			});

			it('should evaluate before hook(s) in specific order', done => {
				let stateArray = [];

				$router.map([
					{
						path: '*',
						before(to, from, next) {
							stateArray.push('before');
							next();
						},
						init(to, from) {
							stateArray.push('init');
						},
						handler: new RouteHandler({
							beforeInit(to, from, next) {
								stateArray.push('beforeInit');
								next();
							},
							beforeUpdate(to, from, next) {
								stateArray.push('beforeUpdate');
								next();
							},
							init() {
								stateArray.push('handlerInit');
							},
							update() {
								stateArray.push('handlerUpdate');
							}
						})
					}
				]).beforeEach((to, from, next) => {
					stateArray.push('beforeEach');
					next();
				}).run().then(() => {
					setPath('/other');

					return $router.run();
				}).then(() => {
					expect(stateArray).to.deep.equal(['beforeEach', 'before', 'beforeInit', 'init', 'handlerInit', 'beforeEach', 'before', 'beforeUpdate', 'handlerUpdate']);
				}).then(done, done);
			});

			it('should all be passed "to", "from", and "next" parameters', () => {
				let toRoutes = [];
				let fromRoutes = [];
				let nextFns = [];

				setPath('/test');
				$router.map([
					{
						path: '/test',
						before(to, from, next) {
							toRoutes.push(to);
							fromRoutes.push(from);
							nextFns.push(next);
							next();
						},
						handler: new RouteHandler({
							beforeInit(to, from, next) {
								toRoutes.push(to);
								fromRoutes.push(from);
								nextFns.push(next);
								next();
							}
						})
					}
				]).beforeEach((to, from, next) => {
					toRoutes.push(to);
					fromRoutes.push(from);
					nextFns.push(next);
					next();
				}).run();

				expect(toRoutes.length).to.equal(3);
				expect(fromRoutes.length).to.equal(3);
				expect(nextFns.length).to.equal(3);
				toRoutes.forEach(to => {
					expect(to.path).to.equal('/test');
				});
				fromRoutes.forEach(from => {
					expect(from.path).to.equal('/');
				});
				nextFns.forEach(next => {
					expect(next).to.be.function;
				});
			});

			it('should evaluate parent before hooks before children route records', () => {
				setPath('/parent/other/child');

				$router.map(basicRoutes.concat([
					{
						path: '/parent/:id',
						before(to, from, next) {
							stateArray.push('parent');
							next();
						},
						children: [
							{
								path: 'child',
								before(to, from, next) {
									stateArray.push('child');
									next();
								}
							}
						]
					}
				])).run();

				expect(stateArray).to.deep.equal(['parent', 'child']);
			});

			it('should not resolve if "next" is not executed', () => {
				setPath('/');

				$router().map([
					{
						path: '/',
						before(to, from, next) {},
						init() {
							state = 'init';
						}
					}
				]);

				expect(state).to.be.false;
			});

			it('should stop processing of routes if false is passed to "next"', done => {
				let beforeState = 0;
				let initState = 0;

				$router().map([
					{
						path: '/',
						before(to, from, next) {
							beforeState += 1;
							next(false);
						},
						init() {
							initState += 1;
						},
						children: [
							{
								path: '*',
								before(to, from, next) {
									beforeState += 1;
									next();
								},
								beforeUpdate() {

								}
							}
						]
					}
				]).run();

				setTimeout(function() {
					expect(beforeState).to.equal(1);
					expect(initState).to.equal(0);
					done();
				}, 100);
			});

			it('should throw error if before queue is stopped', done => {
				let spy = sinon.spy();
				const finish = function() {
					expect(spy.calledOnce).to.be.true;
					expect(spy.args[0][0]).to.be.an('error');
					expect(spy.args[0][0].message).to.equal('Queue stopped prematurely');
				}

				$router.map([
					{ path: '/', before(to, from, next) { next(false); } }
				]).run().catch(spy).then(finish, finish).then(done, done);
			});

			it('should throw custom error if passed to before hook', done => {
				let spy = sinon.spy();
				const finish = function() {
					expect(spy.calledOnce).to.be.true;
					expect(spy.args[0][0]).to.be.an('error');
					expect(spy.args[0][0].message).to.equal('something went wrong with homepage');
				}

				$router.map([
					{ path: '/', before(to, from, next) { next(new Error('something went wrong with homepage')); } }
				]).run().catch(spy).then(finish, finish).then(done, done);
			});
		});

		describe('after hooks', () => {
			before(() => {
				setPath('/');
			});

			beforeEach(() => {
				$router.reset();
			});

			it('should evaluate global after hooks', done => {
				$router.afterEach((to, from, next) => {
					stateArray.push('after each');
				}).onReady(() => {
					expect(stateArray).to.deep.equal(['after each']);
					done();
				}).run();
			});

			it('should evaluate after hook of matched route record', done => {
				$router.map([
					{
						path: '/',
						after() { state = true; }
					}
				]).onReady(() => {
					expect(state).to.be.true;
					done();
				}).run();
			});

			it('should evaluate after hook(s) in specific order', done => {
				$router.map([
					{
						path: '/',
						after(to, from) {
							stateArray.push('after');
						},
						init(to, from) {
							stateArray.push('init');
						}
					}
				]).afterEach((to, from) => {
					stateArray.push('after each');
				}).onReady(() => {
					expect(stateArray).to.deep.equal(['init', 'after', 'after each']);
					done();
				}).run();
			});

			it('should all be passed "to" and "from" parameters', done => {
				let toRoutes = [];
				let fromRoutes = [];

				setPath('/');
				$router.map([
					{
						path: '/',
						after(to, from) {
							toRoutes.push(to);
							fromRoutes.push(from);
						}
					}
				]).afterEach((to, from) => {
					toRoutes.push(to);
					fromRoutes.push(from);
				}).onReady(() => {
					expect(toRoutes.length).to.equal(2);
					expect(fromRoutes.length).to.equal(2);
					toRoutes.forEach(to => {
						expect(to.path).to.equal('/');
					});
					fromRoutes.forEach(from => {
						expect(from.path).to.equal('/');
					});
					done();
				}).run();
			});

			it('should evaluate parent after hooks before children', done => {
				setPath('/parent/other/child');

				$router.map(basicRoutes.concat([
					{
						path: '/parent/:id',
						after(to, from) {
							stateArray.push('parent');
						},
						children: [
							{
								path: 'child',
								after(to, from) {
									stateArray.push('child');
								}
							}
						]
					}
				])).onReady(() => {
					expect(stateArray).to.deep.equal(['parent', 'child']);
					done();
				}).run();
			});
		});

		// TODO: Requires events, screen, and store before being finished
		describe('unload', () => {
			it('should evaluate function when leaving route', done => {
				setPath('/test');
				$router.map([
					{ path: '/', init() { stateArray.push('home'); } },
					{
						path: '/test',
						unload(to, from) {
							stateArray.push(to.path);
							stateArray.push(from.path);
						}
					}
				]).onReady(() => {
					// Leave /test to trigger unload
					setPath('/');
					$router.run().then(() => {
						expect(stateArray).to.deep.equal(['/', '/test', 'home']);
					}).then(done, done);
				}).run();
			});

			it('should unload namespaced events, screen maps, and data stores', done => {
				$router.reset();
				$events.on('body', 'click.test', () => {});
				$screen.map([
					{
						size: 4,
						callback() {},
						namespace: 'test'
					}
				]);
				$store.create('test');

				expect($screen.bound('test').length).to.equal(1);
				expect($events.bound(false, '.test').length).to.equal(1);
				expect(Object.keys($store.instances()).length).to.equal(1);

				setPath('/test');
				$router.map([
					{ path: '/', init() { } },
					{
						path: '/test',
						unload: 'test'
					}
				]).onReady(() => {
					// Leave /test to trigger unload
					setPath('/');
					$router.run().then(() => {
						expect($screen.bound('test').length).to.equal(0);
						expect($events.bound(false, '.test').length).to.equal(0);
						expect(Object.keys($store.instances()).length).to.equal(0);
					}).then(done, done);
				}).run();
			});
		});

		describe('update', () => {
			it('should execute if newly matched route is same as current matched route', done => {
				function finish() {
					expect(stateArray).to.deep.equal(['init', 'update']);
				}

				setPath('/route/1');
				$router.map([
					{ path: '/route/:id', init() { stateArray.push('init'); }, update() { stateArray.push('update'); } }
				]).onReady(() => {
					setPath('/route/2');
					$router.run().then(finish).then(done, done);
				}).run();
			});
		});

		describe('route handler', () => {
			before(() => {
				setPath('/');
			});

			it('should evaluate after route record callbacks have executed', done => {
				$router.map([
					{
						path: '/',
						before(to, from, next) { stateArray.push('before'); next(); },
						init() { stateArray.push('init'); },
						handler: new RouteHandler({
							init() { stateArray.push('handler init'); }
						})
					}
				]).onReady(() => {
					expect(stateArray).to.deep.equal(['before', 'init', 'handler init']);
					done();
				}).run();
			});

			it('should process update functions when part of both "from" and "to" route records', done => {
				const handler = new RouteHandler({
					init() { stateArray.push('handler init'); },
					update() { stateArray.push('handler update'); }
				});

				$router.map([
					{ path: '/', handler: handler },
					{ path: '/other', handler: handler }
				]).onReady(() => {
					setPath('/other');
					$router.run().then(() => {
						expect(stateArray).to.deep.equal(['handler init', 'handler update']);
					}).then(done, done);
				}).run();
			});

			describe('beforeInit/init', () => {
				it('should execute on initial route match', done => {
					setPath('/1');
					$router.map([
						{
							path: '/:id',
							handler: new RouteHandler({
								beforeInit(to, from, next) {
									stateArray.push('before init');
									next();
								},
								init(to, from) {
									stateArray.push('init');
								}
							})
						}
					]).onReady(() => {
						// Should not run init twice
						setPath('/2');
						$router.run().then(() => {
							expect(stateArray).to.deep.equal(['before init', 'init']);
						}).then(done, done);
					}).run();
				});
			});

			describe('beforeUpdate/update', () => {
				it('should execute on subsequent route matches', done => {
					setPath('/1');
					$router.map([
						{
							path: '/:id',
							handler: new RouteHandler({
								beforeUpdate(to, from, next) {
									stateArray.push('before update');
									next();
								},
								update(to, from) {
									stateArray.push('update');
								}
							})
						}
					]).onReady(() => {
						setPath('/2');
						$router.run().then(() => {
							expect(stateArray).to.deep.equal(['before update', 'update']);
						}).then(done, done);
					}).run();
				});

				it('should execute multiple handlers', done => {
					setPath('/1');
					$router.map([
						{
							path: '/:id',
							handler: [
								new RouteHandler({
									beforeUpdate(to, from, next) {
										stateArray.push('before1');
										next();
									},
									update(to, from) {
										stateArray.push('update1');
									}
								}),
								new RouteHandler({
									beforeUpdate(to, from, next) {
										stateArray.push('before2');
										next();
									},
									update(to, from) {
										stateArray.push('update2');
									}
								})
							]
						}
					]).onReady(() => {
						setPath('/2');
						$router.run().then(() => {
							expect(stateArray).to.deep.equal(['before1', 'before2', 'update1', 'update2']);
						}).then(done, done);
					}).run();
				});
			});

			describe('unload', () => {
				it('should evaluate unload function when deactivating handler', done => {
					setPath('/test');
					$router.map([
						{ path: '/', init() { stateArray.push('home'); } },
						{
							path: '/test',
							handler: [
								new RouteHandler({
									unload() {
										stateArray.push('unload1');
									}
								}),
								new RouteHandler({
									unload() {
										stateArray.push('unload2');
									}
								})
							]
						}
					]).onReady(() => {
						// Leave /test to trigger unload
						setPath('/');
						$router.run().then(() => {
							expect(stateArray).to.deep.equal(['unload1', 'unload2', 'home']);
						}).then(done, done);
					}).run();
				});
			});
		});

		describe('meta', () => {
			it('should be accessible through route objects passed to all callbacks', done => {
				const meta = { testProp: 'inject' };

				$router.map([
					{
						path: '/',
						meta: meta,
						before(to, from, next) {
							expect(to.meta).to.equal(meta);
							stateArray.push('before');
							next();
						},
						init(to, from) {
							expect(to.meta).to.equal(meta);
							stateArray.push('init');
						},
						handler: new RouteHandler({
							beforeInit(to, from, next) {
								expect(to.meta).to.equal(meta);
								stateArray.push('before init');
								next();
							},
							init(to, from) {
								expect(to.meta).to.equal(meta);
								stateArray.push('handler init');
								state = true;
							}
						})
					}
				]).onReady(() => {
					expect(stateArray).to.deep.equal(['before', 'before init', 'init', 'handler init']);
					done();
				}).run();
			});
		});
	});

	describe('push', () => {
		let homeSpy;
		let page1Spy;
		let page2Spy;

		before(() => {
			setPath('/');
		});

		beforeEach(() => {
			$router.reset();
			homeSpy = sinon.spy();
			page1Spy = sinon.spy();
			page2Spy = sinon.spy();

			$router.map([
				{ path: '/', init: homeSpy },
				{ path: '/page1', init: page1Spy },
				{ path: '/page2', init: page2Spy }
			]).run();
		});

		it('should navigate to a new URL', () => {
			return $router.push('page1').then(() => {
				expect(page1Spy.calledOnce).to.be.true;
				expect(window.location.pathname).to.equal('/page1');
			});
		});

		it('should add to browser history', () => {
			// Ensure that history.length is not at max of 50 entries
			while (window.history.length > 49) {
				window.history.back();
			}

			const initial = window.history.length;

			return $router.push('page2').then(() => {
				expect(window.history.length).to.equal(initial + 1);
			});
		});

		it('should navigate to a new URL with query string', () => {
			return $router.push('page1?test=value').then(() => {
				expect(page1Spy.called).to.be.true;
				expect(window.location.pathname).to.equal('/page1');
			});
		});

		it('should navigate to a new URL with hash', () => {
			return $router.push('/#section-a').then(() => {
				expect(homeSpy.calledOnce).to.be.true;
				expect(window.location.pathname).to.equal('/');
			});
		});

		it('should navigate to a new URL passing object', () => {
			return $router.push({ path: 'page2', query: { test: 'value' } })
				.then(() => {
					expect(page2Spy.calledOnce).to.be.true;
					expect(window.location.pathname).to.equal('/page2');
				});
		});
	});

	describe('replace', () => {
		let homeSpy;
		let page1Spy;
		let page2Spy;

		beforeEach(() => {
			let history = window.history;

			while (history.length > 49) {
				history.back();
			}

			setPath('/');
			$router.reset();
			homeSpy = sinon.spy();
			page1Spy = sinon.spy();
			page2Spy = sinon.spy();

			$router.map([
				{ path: '/', init: homeSpy },
				{ path: '/page1', init: page1Spy },
				{ path: '/page2', init: page2Spy }
			]).run();
		});

		afterEach(() => {
			$router.reset();
		});

		it('should change URL', () => {
			return $router.replace('page1').then(() => {
				expect(page1Spy.calledOnce).to.be.true;
				expect(window.location.pathname).to.equal('/page1');
			});
		});

		it('should replace current history entry', () => {
			const initial = window.history.length;

			return $router.replace('page1').then(() => {
				expect(window.history.length).to.equal(initial);
			});
		});
	});
});