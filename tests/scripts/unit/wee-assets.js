import $assets from 'wee-assets';

describe('Assets', () => {
	afterEach(() => {
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

	describe('load', () => {
		it('should load a single javascript file', () => {
			$assets.load({
				js: '/js/tests/support/sample-files/sample.js',
				success() {
					console.error('test');
					expect(window.test).to.be.true;
				}
			});
		});
	});
});