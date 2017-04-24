import router from 'routes';

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

describe('Routes', () => {
	describe('map', () => {
		it('should accept an array of objects', () => {
			router.map(basicRoutes);

			expect(router.routes()).to.be.an('array');
		});
	});

	describe('routes', () => {
		it('should return route array', () => {
			router.map(basicRoutes);

			expect(router.routes()).to.be.an('array');
		});

		it('should return the route at indicated index', () => {
			router.map(basicRoutes);

			expect(router.routes().length).to.be.greaterThan(0);
			expect(router.routes(1)).to.be.an('object');
			expect(router.routes(2).path).to.equal('/');
		});
	});

	describe('parse', () => {
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
		router.map(basicRoutes);
		window.history.pushState('page2', 'Title', '/test2?foo=bar&baz=qux#hash');

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
			window.history.pushState('page2', 'Title', '/test2/foo/bar/baz');

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