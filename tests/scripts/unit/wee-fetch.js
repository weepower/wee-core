import sinon from 'sinon';
import $fetch from 'wee-fetch';
import sample from '../helpers/fetch';
import { $copy, $extend } from 'core/types';
import defaults from 'fetch/defaults';
import { createError } from 'fetch/error';
import { normalizeHeader } from 'fetch/headers';
import mockCreateElement from '../helpers/mocks/createElement';

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

		describe('transformResponse', () => {
			it('should parse json response', done => {
				server.respondWith('GET', '/sample', [200, {}, sample.json.get]);

				$fetch('/sample').then(response => {
					expect(response.data).to.be.an('object');
					expect(response.data).to.deep.equal(sample.jsonResults.get);
				}).then(done, done);

				server.respond();
			});

			it('should be customizable', done => {
				const instance = $fetch.create({
					transformResponse(data) {
						if (typeof data === 'string') {
							data = JSON.parse(data);
						}

						return { firstName: data.firstName };
					}
				});

				server.respondWith('GET', '/sample', [200, {}, sample.json.get]);

				instance('/sample').then(response => {
					expect(response.data).to.be.an('object');
					expect(response.data).to.deep.equal({ firstName: 'Don' });
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

		it('should add timestamp to bypass browser cache', done => {
			server.respondWith('GET', '/sample?dt=10000', [200, {}, 'OK']);

			// Stub Date.now so I can assert the timestamp value
			let stub = sinon.stub(Date, 'now');
			stub.returns(10000);

			$fetch({
				url: '/sample',
				disableCache: true
			}).then(response => {
				expect(response.config.params.dt).to.be.a('number');
				expect(response.request.url).to.include('/sample?dt=10000');
			}).then(done, done);

			server.respond();
			stub.restore();
		});

		it('should execute "send" callback', done => {
			let sendSpy = sinon.spy();

			server.respondWith('GET', '/sample', [200, {}, 'OK']);

			$fetch({
				url: '/sample',
				send: sendSpy
			}).then(response => {
				expect(sendSpy.called).to.be.true;
				expect(sendSpy.calledWith(response.request)).to.be.true;
			}).then(done, done);

			server.respond();
		});

		it('should inject scope into callback', done => {
			let sendSpy = sinon.spy();
			const scope = { prop: 1 };

			server.respondWith('GET', '/sample', [200, {}, 'OK']);

			$fetch({
				scope,
				url: '/sample',
				send: function() {
					expect(this).to.deep.equal(scope);
				}
			}).then(() => {}).then(done, done);

			server.respond();
		});

		it('should throw Error if XMLHttpRequest 2 is not supported', () => {
			server.respondWith('GET', '/sample', [200, {}, 'OK']);

			let xhr = sinon.useFakeXMLHttpRequest();
			xhr.onCreate = function(xhr) {
				Object.defineProperty(xhr, 'responseType', {
					configurable: true,
					get: function() {
						return this._responseType || 'text';
					},

					set: function(val) {
						if (val === 'test') {
							throw new Error('Failed to set responseType');
						}

						this._responseType = val;
					}
				});
			}

			const resolveSpy = sinon.spy();
			const rejectSpy = sinon.spy();
			const finish = function() {
				expect(resolveSpy.called).to.be.false;
				expect(rejectSpy.called).to.be.true;

				const error = rejectSpy.args[0][0];
				expect(error).to.be.an('error');
				expect(error.message).to.equal('Failed to set responseType');
			}

			let promise = $fetch({
				url: '/sample',
				responseType: 'test'
			});

			server.respond();

			return promise.then(resolveSpy, rejectSpy).then(finish, finish);
		});

		it('should timeout if configured', () => {
			let resolveSpy = sinon.spy();
			let rejectSpy = sinon.spy();
			function finish() {
				expect(resolveSpy.called).to.false;
				expect(rejectSpy.called).to.true;
			}
			server.respondWith('GET', '/sample', [200, {}, sample.json.get]);

			let promise = $fetch({
				url: '/sample',
				timeout: 25
			});

			// Timeout not implemented on sinon XMLHttpRequest
			setTimeout(function() {
				server.requests[0].ontimeout();
			}, 25);

			return promise.then(resolveSpy, rejectSpy).then(finish, finish);
		});

		it('should support basic auth', done => {
			server.respondWith('GET', '/sample', [200, {}, 'OK']);

			$fetch({
				url: '/sample',
				auth: {
					username: 'nathan',
					password: 'testpass'
				}
			}).then(response => {
				expect(response.request.requestHeaders['Authorization']).to.equal('Basic bmF0aGFuOnRlc3RwYXNz');
			}).then(done, done);

			server.respond();
		});

		describe('jsonp', () => {
			let data;
			let createElement;
			let callbackName = 'callback';

			before(() => {
				data = {
					test: 'value'
				};

				createElement = document.createElement

				document.createElement = mockCreateElement(
					document.createElement,
					function (src) {
						// Find the JSONP method name and use when assigning src
						if (new RegExp(callbackName + '=([^&]+)').test(src)) {
							return RegExp.$1 + '(' + JSON.stringify(data) + ')';
						}
					}
				);
			});

			after(() => {
				// Restore document
				document.createElement = createElement;
			});

			it('should alter request strategy', done => {
				$fetch({
					url: 'jsonp',
					jsonp: true
				}).then((response) => {
					expect(response.data).to.deep.equal({ test: 'value' });
				}).then(done, done);
			});

			it('should tally jsonp method name', done => {
				$fetch({
					url: 'jsonp',
					jsonp: true
				}).then((response) => {
					expect(response.config.params.callback).to.equal('jsonp2');
				}).then(done, done);
			});

			it('should reject on bad request', () => {
				const resolveSpy = sinon.spy();
				const rejectSpy = sinon.spy();
				const finish = function() {
					expect(resolveSpy.called).to.be.false;
					expect(rejectSpy.called).to.be.true

					const error = rejectSpy.args[0][0];
					expect(error).to.be.an('error');
					expect(error.message).to.equal('JSONP request failed');
					expect(error.config.method).to.equal('get');
					expect(error.request).to.equal(null);
				}

				let promise = $fetch({
					url: '/error',
					jsonp: true
				});

				return promise.then(resolveSpy, rejectSpy).then(finish, finish);
			});

			it('should customize function name', done => {
				$fetch({
					url: 'jsonp',
					jsonp: true,
					jsonpCallback: 'testFn'
				}).then((response) => {
					expect(response.config.params.callback).to.equal('testFn');
				}).then(done, done);
			});

			it('should customize query parameter property name', done => {
				callbackName = 'cb';

				$fetch({
					url: 'jsonp',
					jsonp: 'cb'
				}).then((response) => {
					expect(Object.keys(response.config.params)).to.include('cb');
				}).then(done, done);
			});
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

		describe('progress', () => {
			it('should return download progress information', done => {
				let spy = sinon.spy();
				server.respondWith('GET', '/sample', [200, {'Content-Length': '10'}, 'somedata']);

				$fetch({
					url: '/sample',
					onDownloadProgress: spy
				}).then(response => {
					const event = spy.args[0][0];

					expect(spy.called).to.be.true;
					expect(event.progress).to.equal(1);
					expect(event.total).to.exist;
					expect(event.loaded).to.exist;
				}).then(done, done);

				server.respond();
			});

			it('should return upload progress information', done => {
				let spy = sinon.spy();
				server.respondWith('POST', '/sample', [200, {'Content-Length': '10'}, 'OK']);

				$fetch({
					url: '/sample',
					method: 'post',
					data: {
						test: 'data'
					},
					onUploadProgress: spy
				}).then(response => {
					const event = spy.args[0][0];

					expect(spy.called).to.be.true;
					expect(event.progress).to.equal(1);
					expect(event.total).to.exist;
					expect(event.loaded).to.exist;
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

	describe('all', () => {
		let comments = [
			{ id: 1, comment: 'test comment 1' },
			{ id: 2, comment: 'test comment 2' }
		];
		let user = { id: 1, name: 'Nathan' };

		beforeEach(() => {
			comments = [
				{ id: 1, comment: 'test comment 1' },
				{ id: 2, comment: 'test comment 2' }
			];
			user = { id: 1, name: 'Nathan' };

			server = sinon.fakeServer.create();
			server.respondWith('GET', '/comments', [200, {}, JSON.stringify(comments)]);
			server.respondWith('GET', '/user', [200, {}, JSON.stringify(user)]);
		});

		afterEach(() => {
			server.restore();
		});

		it('should make multiple concurrent requests', done => {
			$fetch.all([
				$fetch('/comments'),
				$fetch('/user')
			]).then($fetch.spread(function(commentResponse, userResponse) {
				expect(commentResponse.data).to.deep.equal(comments);
				expect(userResponse.data).to.deep.equal(user);
			})).then(done, done);

			server.respond();
		});

		it('should reject on network error', () => {
			const resolveSpy = sinon.spy();
			const rejectSpy = sinon.spy();
			const finish = function() {
				expect(resolveSpy.called).to.be.false;
				expect(rejectSpy.called).to.be.true

				const error = rejectSpy.args[0][0];
				// Should return on first rejection
				expect(rejectSpy.args[0].length).to.equal(1);
				expect(error).to.be.an('error');
				expect(error.message).to.equal('Request failed with status code 404');
				expect(error.config.method).to.equal('get');
				expect(error.request).to.be.an.instanceof(sinon.useFakeXMLHttpRequest());
				expect(error.config.url).to.equal('/comments');
			}

			server.respondWith('GET', '/comments', [404, {}, '']);

			const request = $fetch.all([
				$fetch('/comments'),
				$fetch('/user'),
				$fetch('/comments')
			]);

			// Trigger network error directly
			server.respond();

			return request.then(resolveSpy, rejectSpy).then(finish, finish);
		});
	});
});