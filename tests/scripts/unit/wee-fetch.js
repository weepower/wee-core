import sinon from 'sinon';
import $fetch from 'wee-fetch';
import sample from '../helpers/fetch';

describe('fetch', () => {
	let xhr;
	let server;

	it('should be a function', () => {
		expect($fetch).to.be.a('function');
	});

	describe('requests', () => {
		let state = false;

		beforeEach(() => {
			server = sinon.fakeServer.create();
		});

		afterEach(() => {
			server.restore();
			state = false;
		});

		it('should return parsed JSON', done => {
			server.respondWith('GET', '/sample.json', [200, {}, sample.json.get]);

			$fetch({
				url: '/sample.json'
			}).then((response) => {
				expect(response.data).to.deep.equal(sample.jsonResults.get);
				expect(server.requests.length).to.be.equal(1);
			}).then(done, done);

			server.respond();
		});

		it('should return HTML string', done => {
			server.respondWith('GET', '/sample.html', [200, {}, sample.html]);

			$fetch({
				url: '/sample.html',
				responseType: 'text'
			}).then((response) => {
				expect(response.data).to.deep.equal(sample.html);
				expect(server.requests.length).to.be.equal(1);
			}).then(done, done);

			server.respond();
		});

		it('should return parsed XML', done => {
			server.respondWith('GET', '/sample.xml', [200, {}, sample.xml]);

			$fetch({
				url: '/sample.xml',
				responseType: 'document'
			}).then(response => {
				expect(response.data).to.deep.equal(sample.xmlResults);
				expect(server.requests.length).to.be.equal(1);
			}).then(done, done);

			server.respond();
		});

		it('should reject on network errors', () => {
			const resolveSpy = sinon.spy();
			const rejectSpy = sinon.spy();
			const finish = function() {
				expect(resolveSpy.called).to.be.false;
				expect(rejectSpy.called).to.be.true

				const error = rejectSpy.args[0][0];
				expect(error).to.be.an('error');
				expect(error.message).to.equal('Network Error');
				expect(error.config.method).to.equal('get');
				expect(error.request).to.be.an.instanceof(sinon.useFakeXMLHttpRequest());
			}

			server.respondWith('GET', '/sample.json', [500, {}, '']);

			const request = $fetch({
				url: '/sample.json'
			});

			// Trigger network error directly
			server.requests[0].error();

			return request.then(resolveSpy, rejectSpy).then(finish, finish);
		});

		it('should reject on invalid response status', () => {
			const resolveSpy = sinon.spy();
			const rejectSpy = sinon.spy();
			const finish = function() {
				expect(resolveSpy.called).to.be.false;
				expect(rejectSpy.called).to.be.true

				const error = rejectSpy.args[0][0];
				expect(error).to.be.an('error');
				expect(error.message).to.equal('Request failed with status code 404');
				expect(error.config.method).to.equal('get');
				expect(error.request).to.be.an.instanceof(sinon.useFakeXMLHttpRequest());
				expect(error.config.url).to.equal('http://thisisnotaserver.com/sample.json');
			}

			server.respondWith('GET', 'http://thisisnotaserver.com/sample.json', [404, {}, '']);

			const request = $fetch({
				baseUrl: 'http://thisisnotaserver.com',
				url: '/sample.json'
			});

			// Trigger network error directly
			server.respond();

			return request.then(resolveSpy, rejectSpy).then(finish, finish);
		});

		it('should resolve when valid status', done => {
			server.respondWith('GET', '/sample', [200, {}, sample.json.get]);

			$fetch({
				url: '/sample'
			}).then(response => {
				expect(response.data).to.deep.equal(sample.jsonResults.get);
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