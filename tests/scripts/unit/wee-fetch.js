import sinon from 'sinon';
import $fetch from 'wee-fetch';
import sample from '../helpers/fetch';

describe('fetch', () => {
	let xhr;
	let server;

	it('should be a function', () => {
		expect($fetch).to.be.a('function');
	});

	describe('request', () => {
		let state = false;

		beforeEach(() => {
			server = sinon.fakeServer.create();
		});

		afterEach(() => {
			server.restore();
			state = false;
		});

		it('should get and parse JSON', done => {
			server.respondWith('GET', '/sample.json', [200, {}, sample.json.get]);

			$fetch({
				url: '/sample.json',
				json: true
			}).then((data, xhr) => {
				expect(data).to.deep.equal(sample.jsonResults.get);
				expect(server.requests.length).to.be.equal(1);
			}).then(done, done);

			server.respond();
		});

		// TODO: Add config option for parsing HTML into DOM
		it('should get HTML string', done => {
			server.respondWith('GET', '/sample.html', [200, {}, sample.html]);

			$fetch({
				url: '/sample.html'
			}).then((data, xhr) => {
				expect(data).to.deep.equal(sample.html);
				expect(server.requests.length).to.be.equal(1);
			}).then(done, done);

			server.respond();
		});

		it('should get and parse XML', done => {
			server.respondWith('GET', '/sample.xml', [200, {}, sample.xml]);

			$fetch({
				url: '/sample.xml',
				responseType: 'document'
			}).then(data => {
				expect(data).to.deep.equal(sample.xmlResults);
				expect(server.requests.length).to.be.equal(1);
			}).then(done, done);

			server.respond();
		});
	});

	describe('create', () => {
		it('should create a new instance of fetch', () => {
			const instance = $fetch.create();

			expect(instance).to.be.a('function');
			expect(instance.request).to.be.a('function');
		});
	});
});