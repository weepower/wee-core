import * as $location from 'wee-location';
import $router from 'wee-routes';

const testUri = 'https://www.weepower.com:9000/scripts?foo=bar&baz=qux#hash';

function setPath(path) {
	window.history.replaceState(0, '', path);
}

describe('location', () => {
	describe('segments', () => {
		before(() => {
			setPath('/one/two/three/four');
		});
		beforeEach($router.reset);

		it('should return the current path as an array of it\'s segments', () => {
			expect($location.segments()).to.be.an('array');
			expect($location.segments().length).to.equal(4);
			expect($location.segments()[0]).to.equal('one');
			expect($location.segments()[1]).to.equal('two');
			expect($location.segments()[2]).to.equal('three');
			expect($location.segments()[3]).to.equal('four');
		});

		it('should return the segment by index of the current path', () => {
			expect($location.segments(0)).to.equal('one');
			expect($location.segments(1)).to.equal('two');
			expect($location.segments(2)).to.equal('three');
			expect($location.segments(3)).to.equal('four');
		});
	});

	describe('uri', () => {
		before(() => {
			setPath('/test2/foo/bar?foo=bar&baz=qux#hash');
		});
		after($router.reset);

		it('should return the hash', () => {
			expect($location.uri().hash).to.equal('hash');
		});

		it('should return the full path', () => {
			expect($location.uri().fullPath).to.equal('/test2/foo/bar?foo=bar&baz=qux#hash');
		});

		it('should return the path', () => {
			expect($location.uri().path).to.equal('/test2/foo/bar');
		});

		it('should return the query', () => {
			expect($location.uri().query).to.be.an('object');
			expect($location.uri().query).to.include.keys(['foo', 'baz']);
			expect($location.uri().query.foo).to.equal('bar');
			expect($location.uri().query.baz).to.equal('qux');
		});

		it('should return an array of segments', () => {
			expect($location.uri().segments).to.be.an('array');
			expect($location.uri().segments[0]).to.equal('test2');
			expect($location.uri().segments[1]).to.equal('foo');
			expect($location.uri().segments[2]).to.equal('bar');
		});

		it('should return the full url', () => {
			expect($location.uri().url).to.equal(window.location.href);
		});

		describe('parse', () => {
			it('should parse a given url', () => {
				const result = $location.uri(testUri);
				expect(result).to.be.an('object');
			});

			it('should return the hash', () => {
				const result = $location.uri(testUri);
				expect(result.hash).to.equal('hash');
			});

			it('should return the full path', () => {
				const result = $location.uri(testUri);
				expect(result.fullPath).to.equal('/scripts?foo=bar&baz=qux#hash');
			});

			it('should return the path', () => {
				const result = $location.uri(testUri);
				expect(result.path).to.equal('/scripts');
			});

			it('should return the query', () => {
				const result = $location.uri(testUri);
				expect(result.query).to.be.an('object');
				expect(result.query).to.include.keys(['foo']);
				expect(result.query.foo).to.equal('bar');
				expect(result.query).to.include.keys(['baz']);
				expect(result.query.baz).to.equal('qux');
			});

			it('should return an array of segments', () => {
				const result = $location.uri(testUri);
				expect(result.segments).to.be.an('array');
				expect(result.segments[0]).to.equal('scripts');
			});

			it('should return the full url', () => {
				const result = $location.uri(testUri);
				expect(result.url).to.equal('https://www.weepower.com:9000/scripts?foo=bar&baz=qux#hash');
			});
		});
	});
});