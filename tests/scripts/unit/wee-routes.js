import router from 'wee-routes';

const basicRoutes = [
	{
		path: '/',
		handler() {
			//
		}
	},
	{
		path: '/about',
		handler() {
			//
		}
	}
];

const testUri = 'https://www.weepower.com:9000/scripts?foo=bar#hash';

function setPath(path) {
	window.history.pushState({}, 'Title', path);
}

describe('Routes', () => {
	describe('map', () => {
		beforeEach(router.reset);

		it('should accept an array of objects', () => {
			router.map(basicRoutes);

			expect(router.routes()).to.be.an('array');
		});

		it('should overwrite existing path object', () => {
			router.map(basicRoutes)
				.map([
					{ path: '/', handler: 'new handler' }
				]);

			let routes = router.routes();

			expect(routes.length).to.equal(2);
			expect(routes[0].handler).to.equal('new handler');
			expect(routes[1].path).to.equal('/about');
		});
	});

	describe('routes', () => {
		afterEach(router.reset);

		it('should return route array', () => {
			router.map(basicRoutes);

			expect(router.routes()).to.be.an('array');
			expect(router.routes()[0].path).to.equal('/');
		});

		it('should return the route with specific path', () => {
			router.map(basicRoutes);

			expect(router.routes().length).to.be.greaterThan(0);
			expect(router.routes('/')).to.be.an('object');
			expect(router.routes('/about').path).to.equal('/about');
		});

		it('should return the route with specific name', () => {
			router.map([{ path: '/other', name: 'other', handler: () => {} }].concat(basicRoutes));

			expect(router.routes('other').path).to.equal('/other');
		});
	});

	describe('run', () => {
		let state = false;
		afterEach(() => {
			router.reset();
			state = false;
		});

		it('should evaluate existing routes against current URL', () => {
			setPath('/');
			router.map([
				{
					path: '/',
					handler() {
						state = true;
					}
				}
			]).run();

			expect(state).to.equal(true);
		});

		it('should pass any url variable parameters to handler', () => {
			setPath('/blog/5');
			router.map([
				{
					path: '/blog/:id',
					handler(params) {
						state = true;
						expect(params.id).to.equal(5);
					}
				}
			]).run();

			expect(state).to.equal(true);
		});
	});

	describe('uri - parse', () => {
		it('should parse a given url', () => {
			const result = router.uri(testUri);
			expect(result).to.be.an('object');
		});

		it('should return the hash', () => {
			const result = router.uri(testUri);
			expect(result.hash).to.equal('hash');
		});

		it('should return the full path', () => {
			const result = router.uri(testUri);
			expect(result.full).to.equal('/scripts?foo=bar#hash');
		});

		it('should return the path', () => {
			const result = router.uri(testUri);
			expect(result.path).to.equal('/scripts');
		});

		it('should return the query', () => {
			const result = router.uri(testUri);
			expect(result.query).to.be.an('object');
			expect(result.query).to.include.keys(['foo']);
			expect(result.query.foo).to.equal('bar');
		});

		it('should return an array of segments', () => {
			const result = router.uri(testUri);
			expect(result.segments).to.be.an('array');
			expect(result.segments[0]).to.equal('scripts');
		});

		it('should return the full url', () => {
			const result = router.uri(testUri);
			expect(result.url).to.equal('https://www.weepower.com:9000/scripts?foo=bar#hash');
		});
	});

	describe('uri', () => {
		before(() => {
			router.map(basicRoutes);
			setPath('/test2?foo=bar&baz=qux#hash');
		});
		after(router.reset);

		it('should return the hash', () => {
			expect(router.uri().hash).to.equal('hash');
		});

		it('should return the full path', () => {
			expect(router.uri().full).to.equal('/test2?foo=bar&baz=qux#hash');
		});

		it('should return the path', () => {
			expect(router.uri().path).to.equal('/test2');
		});

		it('should return the query', () => {
			expect(router.uri().query).to.be.an('object');
			expect(router.uri().query).to.include.keys(['foo', 'baz']);
			expect(router.uri().query.foo).to.equal('bar');
			expect(router.uri().query.baz).to.equal('qux');
		});

		it('should return an array of segments', () => {
			setPath('/test2/foo/bar/baz');

			expect(router.uri().segments).to.be.an('array');
			expect(router.uri().segments[0]).to.equal('test2');
			expect(router.uri().segments[1]).to.equal('foo');
			expect(router.uri().segments[2]).to.equal('bar');
			expect(router.uri().segments[3]).to.equal('baz');
		});

		it('should return the full url', () => {
			expect(router.uri().url).to.equal(window.location.href);
		});
	});
});