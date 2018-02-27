import $assets from 'wee-assets';
import $ from 'wee-dom';
import { _load } from 'wee-assets';
import sinon from 'sinon';

describe('Assets', () => {
	beforeEach(() => {
		$assets.root('');
	});

	describe('root', () => {
		it('should return the root if set', () => {
			expect($assets.root()).to.equal('');
		});

		it('should set the root for the file path', () => {
			let root = '/js/tests/support/sample-files/';

			$assets.root(root);

			expect($assets.root()).to.equal(root);
		});
	});

	describe('load', function() {
		this.timeout(30000);

		it('should load a single image file', done => {
			$assets.load({
				cache: false,
				images: '/files/sample.jpg',
				success() {
					done();
				},
				error() {
					done(new Error('image not loaded'));
				}
			});
		});

		it('should load a single js file', done => {
			$assets.load({
				scripts: '/files/sample.js',
				success() {
					done();
				},
				error() {
					done(new Error('script not loaded'));
				}
			});
		});

		it('should load a single css file', done => {
			$assets.load({
				styles: '/files/sample.css',
				success() {
					done();
				},
				error() {
					done(new Error('stylesheet not loaded'));
				}
			});
		});

		it('should identify file types', () => {
			let jsStub = sinon.stub(_load, 'js');
			let cssStub = sinon.stub(_load, 'css');
			let imgStub = sinon.stub(_load, 'img');

			$assets.load({
				cache: false,
				files: ['/files/sample.css', '/files/sample.js', '/files/sample.jpg']
			});

			expect(jsStub.calledOnce).to.be.true;
			expect(cssStub.calledOnce).to.be.true;
			expect(imgStub.calledOnce).to.be.true;

			// Cleanup
			jsStub.restore();
			cssStub.restore();
			imgStub.restore();
		});

		it('should load multiple files', done => {
			$assets.load({
				cache: false,
				files: ['/files/sample.css', '/files/sample.js', '/files/sample.jpg'],
				success() {
					done();
				},
				error() {
					done(new Error('stylesheet not loaded'));
				}
			});
		});

		it('should fail if file cannot be found', done => {
			$assets.load({
				cache: false,
				files: ['/unknown.jpg', 'unknown.js', 'unknown.css'],
				success() {
					done(new Error('stylesheet not loaded'));
				},
				error() {
					done();
				}
			});
		});

		it('should skip loading a pre-loaded asset', done => {
			$assets.load({
				scripts: ['/files/sample.js'],
				success() {
					done();
				},
				error() {
					done(new Error('stylesheet not loaded'));
				}
			});
		});
	});

	describe('remove', function() {
		this.timeout(30000);

		it('should remove file from DOM', (done) => {
			const files = ['/files/sample.css', '/files/sample.js'];

			$assets.load({
				files,
				cache: false,
				success() {
					const jsCount = document.querySelectorAll('script').length;
					const cssCount = document.querySelectorAll('link').length;

					$assets.remove(files);

					expect(document.querySelectorAll('script').length).to.equal(jsCount - 1);
					expect(document.querySelectorAll('link').length).to.equal(cssCount - 1);
					// Images are not loaded onto DOM by assets module so
					// we do not check for it to be removed.

					done();
				},
				error() {
					done(new Error('stylesheet not loaded'));
				}
			});
		});
	});

	describe('ready', function() {
		this.timeout(30000);

		it('should execute when group has been loaded', done => {
			$assets.ready('test', {
				success() {
					done();
				}
			}, true);

			$assets.load({
				group: 'test',
				cache: false,
				files: ['/files/sample.css', '/files/sample.js', '/files/sample.jpg'],
				error() {
					done(new Error('stylesheet not loaded'));
				}
			});
		});

		it('should return status if already loaded', done => {
			$assets.load({
				group: 'test',
				cache: false,
				files: ['/files/sample.css', '/files/sample.js', '/files/sample.jpg'],
				success() {
					expect($assets.ready('test')).to.be.true;
					done();
				},
				error() {
					done(new Error('stylesheet not loaded'));
				}
			});
		});
	});
});
