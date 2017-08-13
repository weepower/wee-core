import { parseLocation } from 'routes/location';

function getOrigin() {
	return window.location.href.split('/').slice(0, 3).join('/');
}

describe('Router: location', () => {
	before(() => {
		window.history.replaceState(0, '', '/');
	});

	describe('parseLocation', () => {
		before(() => {
			window.history.replaceState(0, '', '/path/a?some=value&other=value#section-a');
		});

		it('should generate location object based on current location', () => {
			const location = parseLocation();

			expect(location.path).to.equal('/path/a');
			expect(location.fullPath).to.equal('/path/a?some=value&other=value#section-a');
			expect(location.hash).to.equal('section-a');
			expect(location.query).to.deep.equal({ some: 'value', other: 'value' });
			expect(location.segments).to.deep.equal(['path', 'a']);
			expect(location.url).to.equal(window.location.href);
			expect(location.origin).to.equal(getOrigin());
			expect(location.protocol).to.equal('http');
		});

		it('should generate location from passed in path', () => {
			// Ensure we are on different page from what is being passed into parseLocation
			window.history.replaceState(0, '', '/');

			const location = parseLocation('/path/a?some=value&other=value#section-a');

			expect(location.path).to.equal('/path/a');
			expect(location.fullPath).to.equal('/path/a?some=value&other=value#section-a');
			expect(location.hash).to.equal('section-a');
			expect(location.query).to.deep.equal({ some: 'value', other: 'value' });
			expect(location.segments).to.deep.equal(['path', 'a']);
			expect(location.url).to.equal(window.location.href + 'path/a?some=value&other=value#section-a');
			expect(location.origin).to.equal(getOrigin());
			expect(location.protocol).to.equal('http');
		});

		it('should generate location object from object', () => {
			const location = parseLocation({ path: '/path/a', query: { some: 'value', other: 'value' }, hash: 'section-a' });

			expect(location.path).to.equal('/path/a');
			expect(location.fullPath).to.equal('/path/a?some=value&other=value#section-a');
			expect(location.hash).to.equal('section-a');
			expect(location.query).to.deep.equal({ some: 'value', other: 'value' });
			expect(location.segments).to.deep.equal(['path', 'a']);
			expect(location.url).to.equal(window.location.href + 'path/a?some=value&other=value#section-a');
			expect(location.origin).to.equal(getOrigin());
			expect(location.protocol).to.equal('http');
		});

		it('should build array from array style query params', () => {
			const url = '/path?state[]=US';
			const oneQuery = parseLocation(url);
			const multipleQuery = parseLocation(url + '&state[]=CA');

			expect(multipleQuery.query).to.deep.equal({
				state: ['US', 'CA']
			});
			expect(oneQuery.query).to.deep.equal({ state: ['US'] });
		});
	});
});