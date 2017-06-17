import $router from 'wee-routes';
import { RouteHandler } from 'wee-routes';
import sinon from 'sinon';

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

const testUri = 'https://www.weepower.com:9000/scripts?foo=bar&baz=qux#hash';

function setPath(path) {
	window.history.replaceState(0, '', path);
}

describe('Router', () => {
	describe('afterEach', () => {
		let state = false;

		beforeEach(() => {
			$router.reset();
			$router.map(basicRoutes);
		});
		afterEach(() => {
			state = false;
		});

		it('should register global after hook', () => {
			$router.afterEach(() => {
				state = true;
			}).run();

			expect(state).to.be.true;
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

		beforeEach($router.reset);

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
			it('should accept RouteHandler', () => {
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
				]).run();

				expect(state).to.be.true;
			});

			it('should accept array of route handlers', () => {
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
				]).run();

				expect(stateArray).to.deep.equal(['handler 1', 'handler 2', 'handler 3']);
			});
		});
	});

	describe('notFound', () => {
		let state = false;
		let stateArray = [];

		afterEach(() => {
			$router.reset();
			state = false;
			stateArray = [];
		});

		it('should register wildcard route record to evaluate if no match found', () => {
			setPath('/asdf');

			$router.map(basicRoutes)
				.notFound({ init() { state = true; } })
				.run();

			expect(state).to.be.true;
		});
	});

	describe('routes', () => {
		afterEach($router().reset);

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

		afterEach(() => {
			$router.reset();
			state = false;
			stateArray = [];
		});

		it('should match one route', () => {
			setPath('/');
			$router.map(basicRoutes).run();

			expect($router.currentRoute().path).to.equal('/');
		});

		it('should not evaluate identical route two times in a row', () => {
			setPath('/');
			$router.map([
				{ path: '/', init() { stateArray.push('init'); }, update() { stateArray.push('update'); } }
			]).run();

			$router.run();

			expect(stateArray).to.deep.equal(['init']);
		});

		it('should match child route before parent', () => {
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
			])).run();

			expect($router.currentRoute().matched.length).to.equal(2);
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

		it('should evaluate wildcard routes and run functions accordingly', () => {
			setPath('/test/test2/3');
			$router().map([
				{
					path: '/test/*',
					init(to, from) {
						expect(to.params[0]).to.equal('test2/3');
						stateArray.push(1);
					}
				}
			]).run();

			expect(stateArray.length).to.equal(1);
		});

		it('should create and maintain "current" object', () => {
			const handler = function() {};
			setPath('/path/to/stuff?key=value&key2=value2#hash');

			$router().map([
				{ name: 'home', path: '/path/to/:place', handler: handler, meta: {test: 'meta'} }
			]).run();

			expect($router.currentRoute()).to.deep.equal({
				name: 'home',
				meta: {test: 'meta'},
				path: '/path/to/stuff',
				hash: 'hash',
				query: {key: 'value', key2: 'value2'},
				params: {place: 'stuff'},
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
				]
			});
		});

		describe('before hooks', () => {
			it('should evaluate before hook of matched route record', () => {
				setPath('/');

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
				setPath('/test');

				$router.map([
					{
						path: '/test',
						before(to, from, next) {
							setTimeout(() => {
								state = true;
								next();
							}, 250);
						}
					}
				]).run();

				setTimeout(() => {
					expect(state).to.be.true;
					done();
				}, 300);
			});

			it('should evaluate global before hooks', () => {
				setPath('/');
				$router.beforeEach((to, from, next) => {
					stateArray.push('before each');
				}).run();

				expect(stateArray).to.deep.equal(['before each']);
			});

			it('should evaluate before hook(s) in specific order', () => {
				let stateArray = [];

				setPath('/test/1');
				$router.map([
					{
						path: '/test/:id',
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
				}).run();

				setPath('/test/2');
				$router.run();

				expect(stateArray).to.deep.equal(['beforeEach', 'before', 'beforeInit', 'init', 'handlerInit', 'beforeEach', 'before', 'beforeUpdate', 'handlerUpdate']);
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

			it('should stop processing of routes if false is passed to "next"', () => {
				setPath('/asdf');
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

				expect(beforeState).to.equal(1);
				expect(initState).to.equal(0);
			});
		});

		it('should parse url variable parameters and pass to functions', () => {
			setPath('/blog/5');
			$router().map([
				{
					path: '/blog/:id',
					init(to, from) {
						state = true;
						expect(to.params.id).to.equal(5);
					}
				}
			]).run();

			expect(state).to.be.true;
		});

		describe('after hooks', () => {
			it('should evaluate global after hooks', () => {
				setPath('/');
				$router.afterEach((to, from, next) => {
					stateArray.push('after each');
				}).run();

				expect(stateArray).to.deep.equal(['after each']);
			});

			it('should evaluate after hook of matched route record', () => {
				setPath('/test');
				$router.map([
					{
						path: '/test',
						after() { state = true; }
					}
				]).run();

				expect(state).to.be.true;
			});

			it('should evaluate after hook(s) in specific order', () => {
				setPath('/test/1');
				$router.map([
					{
						path: '/test/:id',
						after(to, from) {
							stateArray.push('after');
						},
						init(to, from) {
							stateArray.push('init');
						}
					}
				]).afterEach((to, from) => {
					stateArray.push('after each');
				}).run();

				expect(stateArray).to.deep.equal(['init', 'after', 'after each']);
			});

			it('should all be passed "to" and "from" parameters', () => {
				let toRoutes = [];
				let fromRoutes = [];

				setPath('/test');
				$router.map([
					{
						path: '/test',
						after(to, from) {
							toRoutes.push(to);
							fromRoutes.push(from);
						}
					}
				]).afterEach((to, from) => {
					toRoutes.push(to);
					fromRoutes.push(from);
				}).run();

				expect(toRoutes.length).to.equal(2);
				expect(fromRoutes.length).to.equal(2);
				toRoutes.forEach(to => {
					expect(to.path).to.equal('/test');
				});
				fromRoutes.forEach(from => {
					expect(from.path).to.equal('/');
				});
			});

			it('should evaluate parent after hooks before children', () => {
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
				])).run();

				expect(stateArray).to.deep.equal(['parent', 'child']);
			});
		});

		// TODO: Requires events, screen, and store before being finished
		describe('unload', () => {
			it('should evaluate function when leaving route', () => {
				setPath('/test');
				$router.map([
					{ path: '/', init() { stateArray.push('home'); } },
					{ path: '/test', unload() { stateArray.push('test unload'); } }
				]).run();

				// Leave /test to trigger unload
				setPath('/');
				$router.run();

				expect(stateArray).to.deep.equal(['test unload', 'home']);
			});

			it('should pass unload functions "to" and "from" parameters', () => {
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
				]).run();

				// Leave /test to trigger unload
				setPath('/');
				$router.run();

				expect(stateArray).to.deep.equal(['/', '/test', 'home']);
			});
		});

		describe('init', () => {
			it('should execute when route is first matched', () => {
				setPath('/1');
				$router.map([
					{ path: '/:id', init() { state = stateArray.push('init'); } }
				]).run();

				// Should not run init twice in this scenario
				setPath('/2');
				$router.run();

				expect(stateArray).to.deep.equal(['init']);
			});
		});

		describe('update', () => {
			it('should execute if newly matched route is same as current matched route', () => {
				setPath('/route/1');
				$router.map([
					{ path: '/route/:id', init() { stateArray.push('init'); }, update() { stateArray.push('update'); } }
				]).run();

				setPath('/route/2');
				$router.run();
				setPath('/route/3');
				$router.run();

				expect(stateArray).to.deep.equal(['init', 'update', 'update']);
			});
		});

		describe('route handler', () => {
			it('should evaluate after route record callbacks have executed', () => {
				setPath('/test');
				$router.map([
					{
						path: '/test',
						before(to, from, next) { stateArray.push('before'); next(); },
						init() { stateArray.push('init'); },
						handler: new RouteHandler({
							init() { stateArray.push('handler init'); }
						})
					}
				]).run();

				expect(stateArray).to.deep.equal(['before', 'init', 'handler init']);
			});

			it('should process update functions when part of both "from" and "to" route records', () => {
				const handler = new RouteHandler({
					init() { stateArray.push('handler init'); },
					update() { stateArray.push('handler update'); }
				});

				setPath('/test');
				$router.map([
					{ path: '/test', handler: handler },
					{ path: '/other', handler: handler }
				]).run();

				setPath('/other');
				$router.run();

				expect(stateArray).to.deep.equal(['handler init', 'handler update']);
			});

			describe('beforeInit/init', () => {
				it('should execute on initial route match', () => {
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
					]).run();

					// Should not run init twice
					setPath('/2');
					$router.run();

					expect(stateArray).to.deep.equal(['before init', 'init']);
				});
			});

			describe('beforeUpdate/update', () => {
				it('should execute on subsequent route matches', () => {
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
					]).run();

					setPath('/2');
					$router.run();
					setPath('/3');
					$router.run();

					expect(stateArray).to.deep.equal(['before update', 'update', 'before update', 'update']);
				});

				it('should execute multiple handlers', () => {
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
					]).run();

					setPath('/2');
					$router.run();

					expect(stateArray).to.deep.equal(['before1', 'before2', 'update1', 'update2']);
				});
			});

			describe('unload', () => {
				it('should evaluate unload function when deactivating handler', () => {
					setPath('/test');
					$router.map([
						{ path: '/', init() { stateArray.push('home'); } },
						{
							path: '/test',
							handler: new RouteHandler({
								unload(to, from) {
									stateArray.push('unload test');
								}
							})
						}
					]).run();

					// Leave /test to trigger unload
					setPath('/');
					$router.run();

					expect(stateArray).to.deep.equal(['unload test', 'home']);
				});

				it('should evaluate unload function of multiple handlers', () => {
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
					]).run();

					// Leave /test to trigger unload
					setPath('/');
					$router.run();

					expect(stateArray).to.deep.equal(['unload1', 'unload2', 'home']);
				});
			});
		});

		describe('meta', () => {
			it('should be accessible through route objects passed to all callbacks', () => {
				const meta = { testProp: 'inject' };

				setPath('/test')
				$router.map([
					{
						path: '/test',
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
				]).run();

				expect(stateArray).to.deep.equal(['before', 'before init', 'init', 'handler init']);
			});
		});
	});

	describe('segments', () => {
		afterEach($router().reset);

		it('should return the current path as an array of it\'s segments', () => {
			setPath('/one/two/three/four');

			expect($router().segments()).to.be.an('array');
			expect($router().segments().length).to.equal(4);
			expect($router().segments()[0]).to.equal('one');
			expect($router().segments()[1]).to.equal('two');
			expect($router().segments()[2]).to.equal('three');
			expect($router().segments()[3]).to.equal('four');
		});

		it('should return the segment by index of the current path', () => {
			setPath('/one/two/three/four');

			expect($router().segments(0)).to.equal('one');
			expect($router().segments(1)).to.equal('two');
			expect($router().segments(2)).to.equal('three');
			expect($router().segments(3)).to.equal('four');
		});
	});

	describe('uri', () => {
		before(() => {
			$router().map(basicRoutes);
			setPath('/test2?foo=bar&baz=qux#hash');
		});
		after($router().reset);

		it('should return the hash', () => {
			expect($router().uri().hash).to.equal('hash');
		});

		it('should return the full path', () => {
			expect($router().uri().fullPath).to.equal('/test2?foo=bar&baz=qux#hash');
		});

		it('should return the path', () => {
			expect($router().uri().path).to.equal('/test2');
		});

		it('should return the query', () => {
			expect($router().uri().query).to.be.an('object');
			expect($router().uri().query).to.include.keys(['foo', 'baz']);
			expect($router().uri().query.foo).to.equal('bar');
			expect($router().uri().query.baz).to.equal('qux');
		});

		it('should return an array of segments', () => {
			setPath('/test2/foo/bar/baz');

			expect($router().uri().segments).to.be.an('array');
			expect($router().uri().segments[0]).to.equal('test2');
			expect($router().uri().segments[1]).to.equal('foo');
			expect($router().uri().segments[2]).to.equal('bar');
			expect($router().uri().segments[3]).to.equal('baz');
		});

		it('should return the full url', () => {
			expect($router().uri().url).to.equal(window.location.href);
		});

		describe('parse', () => {
			it('should parse a given url', () => {
				const result = $router().uri(testUri);
				expect(result).to.be.an('object');
			});

			it('should return the hash', () => {
				const result = $router().uri(testUri);
				expect(result.hash).to.equal('hash');
			});

			it('should return the full path', () => {
				const result = $router().uri(testUri);
				expect(result.fullPath).to.equal('/scripts?foo=bar&baz=qux#hash');
			});

			it('should return the path', () => {
				const result = $router().uri(testUri);
				expect(result.path).to.equal('/scripts');
			});

			it('should return the query', () => {
				const result = $router().uri(testUri);
				expect(result.query).to.be.an('object');
				expect(result.query).to.include.keys(['foo']);
				expect(result.query.foo).to.equal('bar');
				expect(result.query).to.include.keys(['baz']);
				expect(result.query.baz).to.equal('qux');
			});

			it('should return an array of segments', () => {
				const result = $router().uri(testUri);
				expect(result.segments).to.be.an('array');
				expect(result.segments[0]).to.equal('scripts');
			});

			it('should return the full url', () => {
				const result = $router().uri(testUri);
				expect(result.url).to.equal('https://www.weepower.com:9000/scripts?foo=bar&baz=qux#hash');
			});
		});
	});

	describe('push', () => {
		let homeSpy;
		let page1Spy;
		let page2Spy;

		beforeEach(() => {
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

		it('should navigate to a new URL', () => {
			return $router.push('page1').then(() => {
				expect(page1Spy.calledOnce).to.be.true;
				expect(window.location.pathname).to.equal('/page1');
			});
		});

		it('should add to browser history', done => {
			// Ensure that history.length is not at max of 50 entries
			while (window.history.length > 49) {
				window.history.back();
			}

			const initial = window.history.length;

			$router.push('page2').then(() => {
				expect(window.history.length).to.equal(initial + 1);
			}).then(done, done);
		});

		it('should navigate to a new URL with query string', () => {
			return $router.push('page1?test=value').then(() => {
				expect(page1Spy.calledOnce).to.be.true;
				expect(window.location.pathname).to.equal('/page1');
			});
		});

		it('should navigate to a new URL with hash', () => {
			return $router.push('page1#section-a').then(() => {
				expect(page1Spy.calledOnce).to.be.true;
				expect(window.location.pathname).to.equal('/page1');
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