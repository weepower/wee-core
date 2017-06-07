import sinon from 'sinon';
import $fetch from 'wee-fetch';
import sample from '../helpers/fetch';
import { $copy, $extend } from 'core/types';
import defaults from 'fetch/defaults';
import { createError } from 'fetch/error';
import { normalizeHeader } from 'fetch/headers';
import mockCreateElement from '../helpers/script';

describe('fetch', () => {
	let xhr;
	let server;

	it('should be a function', () => {
		expect($fetch).to.be.a('function');
	});

	describe('defaults', () => {
		let defaultHeaders;

		before(() => {
			defaultHeaders = $copy($fetch.defaults.headers);
		});

		beforeEach(() => {
			server = sinon.fakeServer.create();
			server.respondWith('GET', '/sample', [200, {}, '']);
		});

		afterEach(() => {
			server.restore();
			$fetch.defaults.headers = defaultHeaders;
		});

		it('should use GET headers', done => {
			$fetch.defaults.headers.get['X-CUSTOM-HEADER'] = 'foo';

			$fetch('/sample').then(response => {
				expect(response.request.requestHeaders['X-CUSTOM-HEADER']).to.equal('foo');
				expect(response.request.requestHeaders['Accept']).to.equal('application/json, text/plain, */*');
			}).then(done, done);

			delete $fetch.defaults.headers.get['X-CUSTOM-HEADER'];

			server.respond();
		});

		it('should use POST headers', done => {
			$fetch.defaults.headers.post['X-CUSTOM-HEADER'] = 'foo';

			server.respondWith('POST', '/sample', [200, {}, '']);

			$fetch({
				url: '/sample',
				method: 'post'
			}).then(response => {
				expect(response.request.requestHeaders['X-CUSTOM-HEADER']).to.equal('foo');
			}).then(done, done);

			delete $fetch.defaults.headers.post['X-CUSTOM-HEADER'];

			server.respond();
		});

		it('should use header config', function (done) {
			const instance = $fetch.create({
				headers: {
					common: {
						'X-COMMON-HEADER': 'commonHeaderValue'
					},
					get: {
						'X-GET-HEADER': 'getHeaderValue'
					},
					post: {
						'X-POST-HEADER': 'postHeaderValue'
					}
				}
			});

			instance({
				url: '/sample',
				headers: {
					'X-FOO-HEADER': 'fooHeaderValue',
					'X-BAR-HEADER': 'barHeaderValue'
				}
			}).then(response => {
				expect(response.request.requestHeaders).to.deep.equal(
					{
						'X-Requested-With': 'XMLHttpRequest',
						'Content-Type': 'text/plain;charset=utf-8',
						'X-COMMON-HEADER': 'commonHeaderValue',
						'X-GET-HEADER': 'getHeaderValue',
						'X-FOO-HEADER': 'fooHeaderValue',
						'X-BAR-HEADER': 'barHeaderValue'
					}
				);
			}).then(done, done);

			server.respond();
		});

		it('should be used by custom instance if set before instance created', done => {
			server.respondWith('GET', 'http://example.org/sample', [200, {}, '']);

			$fetch.defaults.baseURL = 'http://example.org/';

			const instance = $fetch.create();

			instance('http://example.org/sample').then(response => {
				expect(response.request.url).to.equal('http://example.org/sample');
			}).then(done, done);

			$fetch.defaults.baseURL = '';
			server.respond();
		});

		it('should not affect custom instance if set after instance was created', done => {
			server.respondWith('GET', 'http://example.org/sample', [200, {}, '']);

			var instance = $fetch.create();
			$fetch.defaults.baseURL = 'http://new-example.org/';

			instance('http://example.org/sample').then(response => {
				expect(response.request.url).to.equal('http://example.org/sample');
			}).then(done, done);

			$fetch.defaults.baseURL = '';
			server.respond();
		});

		describe('transformRequest', () => {
			it('should transform data to json and set content-type header', done => {
				const data = {
					key: 'value'
				};
				server.respondWith('POST', '/sample', [200, {'Content-Type': 'application/json'}, 'OK']);

				$fetch({
					url: '/sample',
					method: 'post',
					data: data
				}).then(response => {
					expect(response.request.requestBody).to.deep.equal(JSON.stringify(data));
					expect(response.request.requestHeaders['Content-Type']).to.equal('application/json;charset=utf-8');
				}).then(done, done);

				server.respond();
			});

			it('should extract buffer data', done => {
				const data = new DataView(new ArrayBuffer(10));
				server.respondWith('POST', '/sample', [200, {'Content-Type': 'application/json'}, 'OK']);

				$fetch({
					url: '/sample',
					method: 'post',
					data: data
				}).then(response => {
					expect(response.request.requestBody).to.deep.equal(data.buffer);
					expect(response.request.requestHeaders['Content-Type']).to.equal('application/x-www-form-urlencoded;charset=utf-8');
				}).then(done, done);

				server.respond();
			});

			it('should be customizable', done => {
				const instance = $fetch.create({
					transformRequest(data, headers) {
						return 'new value';
					}
				});

				server.respondWith('POST', '/sample', [200, {'Content-Type': 'application/json'}, 'OK']);

				instance({
					url: '/sample',
					method: 'post',
					data: {
						test: 'value'
					}
				}).then(response => {
					expect(response.request.requestBody).to.deep.equal('new value');
					expect(response.request.requestHeaders['Content-Type']).to.equal('application/x-www-form-urlencoded;charset=utf-8');
				}).then(done, done);

				server.respond();
			});
		});
	});

	describe('request', () => {
		beforeEach(() => {
			server = sinon.fakeServer.create();
		});

		afterEach(() => {
			server.restore();
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
			server.respondWith('GET', '/sample', [200, {'Content-Type': 'application/json'}, sample.json.get]);

			$fetch({
				url: '/sample'
			}).then(response => {
				expect(response.data).to.deep.equal(sample.jsonResults.get);
				expect(response.headers).to.deep.equal({'content-type': 'application/json'});
				expect(server.requests.length).to.be.equal(1);
			}).then(done, done);

			server.respond();
		});

		it('should assume url is argument when passed string', done => {
			server.respondWith('GET', '/sample', [200, {}, sample.json.get]);

			$fetch('/sample').then(response => {
				expect(response.data).to.deep.equal(sample.jsonResults.get);
				expect(server.requests.length).to.be.equal(1);
			}).then(done, done);

			server.respond();
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
				expect(response.data).to.equal(sample.html);
				expect(server.requests.length).to.be.equal(1);
			}).then(done, done);

			server.respond();
		});

		it('should return parsed HTML', done => {
			server.respondWith('GET', '/sample.html', [200, {}, sample.html]);

			$fetch({
				url: '/sample.html',
				responseType: 'document'
			}).then((response) => {
				expect(response.data).to.be.instanceOf(Document);
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

		it('should return blob', done => {
			server.respondWith('GET', '/sample.png', [200, {}, 'randomstring']);

			$fetch({
				url: '/sample.png',
				responseType: 'blob'
			}).then(response => {
				expect(response.data).to.be.instanceOf(Blob);
				expect(server.requests.length).to.be.equal(1);
			}).then(done, done);

			server.respond();
		});

		it('should return array buffer', done => {
			server.respondWith('GET', '/sample.png', [200, {}, 'randomstring']);

			$fetch({
				url: '/sample.png',
				responseType: 'arraybuffer'
			}).then(response => {
				expect(response.data).to.be.instanceOf(ArrayBuffer);
				expect(server.requests.length).to.be.equal(1);
			}).then(done, done);

			server.respond();
		});
		describe('params', () => {
			it('should add query string to request', done => {
				server.respondWith('GET', 'https://test.com/sample?name=Donald+Draper', [200, {}, 'OK']);

				$fetch({
					url: 'https://test.com/sample',
					params: {
						name: 'Donald Draper'
					}
				}).then(response => {
					expect(response.request.url).to.equal('https://test.com/sample?name=Donald+Draper');
					expect(server.requests.length).to.be.equal(1);
				}).then(done, done);

				server.respond();
			});
		});

		describe('headers', () => {
			it('POST', done => {
				server.respondWith('POST', '/sample', [200, {}, 'randomstring']);

				$fetch({
					url: '/sample',
					method: 'post',
					data: new FormData()
				}).then(response => {
					expect(response.request.requestHeaders).to.deep.equal({
						'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
						'Accept': 'application/json, text/plain, */*',
						'X-Requested-With': 'XMLHttpRequest'
					});
				}).then(done, done);

				server.respond();
			});

			it('PUT', done => {
				server.respondWith('PUT', '/sample', [200, {}, 'randomstring']);

				$fetch({
					url: '/sample',
					method: 'put',
					data: new FormData()
				}).then(response => {
					expect(response.request.requestHeaders).to.deep.equal({
						'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
						'Accept': 'application/json, text/plain, */*',
						'X-Requested-With': 'XMLHttpRequest'
					});
				}).then(done, done);

				server.respond();
			});

			it('PATCH', done => {
				server.respondWith('PATCH', '/sample', [200, {}, 'randomstring']);

				$fetch({
					url: '/sample',
					method: 'patch',
					data: new FormData()
				}).then(response => {
					expect(response.request.requestHeaders).to.deep.equal({
						'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
						'Accept': 'application/json, text/plain, */*',
						'X-Requested-With': 'XMLHttpRequest'
					});
				}).then(done, done);

				server.respond();
			});

			it('GET', done => {
				server.respondWith('GET', '/sample', [200, {}, 'randomstring']);

				$fetch({
					url: '/sample'
				}).then(response => {
					expect(response.request.requestHeaders).to.deep.equal({
						'Content-Type': 'text/plain;charset=utf-8',
						'Accept': 'application/json, text/plain, */*',
						'X-Requested-With': 'XMLHttpRequest'
					});
				}).then(done, done);

				server.respond();
			});

			it('DELETE', done => {
				server.respondWith('DELETE', '/sample', [200, {}, 'randomstring']);

				$fetch({
					url: '/sample',
					method: 'delete'
				}).then(response => {
					expect(response.request.requestHeaders).to.deep.equal({
						'Content-Type': 'text/plain;charset=utf-8',
						'Accept': 'application/json, text/plain, */*',
						'X-Requested-With': 'XMLHttpRequest'
					});
					expect(server.requests.length).to.be.equal(1);
				}).then(done, done);

				server.respond();
			});

			it('HEAD', done => {
				server.respondWith('HEAD', '/sample', [200, {}, '']);

				$fetch({
					url: '/sample',
					method: 'head'
				}).then(response => {
					expect(response.request.requestHeaders).to.deep.equal({
						'Accept': 'application/json, text/plain, */*',
						'X-Requested-With': 'XMLHttpRequest'
					});
					expect(server.requests.length).to.be.equal(1);
				}).then(done, done);

				server.respond();
			});

			it('should not add X-Requested-With if cross-origin request', done => {
				server.respondWith('GET', 'http://test.com/sample', [200, {}, '']);

				$fetch({
					url: 'http://test.com/sample'
				}).then(response => {
					expect(response.request.requestHeaders).to.deep.equal({
						'Accept': 'application/json, text/plain, */*',
						'Content-Type': 'text/plain;charset=utf-8'
					});
				}).then(done, done);

				server.respond();
			});
		});
	});

	describe('error', () => {
		it('should create new error', () => {
			const error = createError('This is a new error', 'config', 'ERRORCODE', 'request', 'response');

			expect(error).to.be.an('error');
			expect(error.message).to.equal('This is a new error');
			expect(error.config).to.equal('config');
			expect(error.code).to.equal('ERRORCODE');
			expect(error.request).to.equal('request');
			expect(error.response).to.equal('response');
		});
	});

	describe('normalizeHeader', () => {
		it('should update header with consistent name', () => {
			let headers = {
				'content-type': 'application/json'
			};

			normalizeHeader(headers, 'Content-Type')

			expect(headers).to.deep.equal(
				{
					'Content-Type': 'application/json'
				}
			)
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