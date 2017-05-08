import $screen from 'wee-screen';
import { _html, _win } from 'core/variables';

let state = {
	one: false,
	two: false,
	three: false,
};

function resetState() {
	state = {
		one: false,
		two: false,
		three: false,
	}
}

function setScreenSize(size) {
	_html.style.fontFamily = '"' + size + '"';
	triggerEvent(_win, 'resize');
}

// TODO: Once merged, extract this helper and use in both
// TODO: events and screen
function triggerEvent(el, type) {
	let e = document.createEvent('HTMLEvents');
	e.initEvent(type, false, true);
	el.dispatchEvent(e);
}

describe('Screen', () => {
	afterEach(() => {
		resetState();
		$screen.reset();
	});

	describe('map', () => {
		it('should add a mapping to the registry', () => {
			$screen.map({
				size: 3,
				callback() {
					state.one = true;
				}
			});

			setScreenSize(3);
			expect(state.one).to.equal(true);
			expect($screen.bound().length).to.equal(1);
		});

		it('should add multiple mappings to the registry', () => {
			$screen.map([
				{
					size: 3,
					callback() {
						state.one = true;
					}
				},
				{
					size: 2,
					callback() {
						state.two = true;
					}
				}
			]);

			setScreenSize(2);
			expect(state.one).to.equal(true);
			setScreenSize(3);
			expect(state.two).to.equal(true);
		});

		it('should not execute callback outside of specified size', () => {
			$screen.map({
				size: 3,
				callback() {
					state.one = true;
				}
			});

			setScreenSize(3);
			expect(state.one).to.equal(true);
			resetState();
			setScreenSize(4);
			expect(state.one).to.equal(false);
		});

		it('should execute callback when max size is reached', () => {
			$screen.map([
				{
					max: 3,
					callback() {
						state.one = true;
					}
				}
			]);

			setScreenSize(3);
			expect(state.one).to.equal(true);
		});

		it('should inject data object as first parameter to callback', () => {
			$screen.map({
				size: 3,
				callback(data) {
					expect(data).to.be.an('object');
					expect(data).to.have.keys(['dir', 'init', 'prev', 'size']);
					expect(data.size).to.equal(3);
				}
			});

			setScreenSize(3);
		});

		it('should execute callback when min size is reached', () => {
			$screen.map([
				{
					min: 3,
					callback() {
						state.one = true;
					}
				}
			]);

			setScreenSize(3);
			expect(state.one).to.equal(true);
		});

		// TODO: Why is this failing?
		it('should execute callback when min and max size is reached', () => {
			$screen.map([
				{
					min: 1,
					max: 3,
					callback() {
						state.one = true;
					}
				}
			]);

			setScreenSize(1);
			expect(state.one).to.equal(true);
			resetState();
			setScreenSize(3);
			expect(state.one).to.equal(true);
		});

		describe('each', () => {
			it('should execute callback on each size until max', () => {
				$screen.map({
					max: 3,
					each: true,
					callback() {
						state.one = true;
					}
				});

				setScreenSize(1);
				expect(state.one).to.equal(true);
				resetState();
				setScreenSize(2);
				expect(state.one).to.equal(true);
				resetState();
				setScreenSize(3);
				expect(state.one).to.equal(true);
			});

			it('should execute callback within bounds of min and max size', () => {
				$screen.map({
					min: 1,
					max: 3,
					each: true,
					callback() {
						state.one = true;
					}
				});

				setScreenSize(1);
				expect(state.one).to.equal(true);
				resetState();
				setScreenSize(2);
				expect(state.one).to.equal(true);
				resetState();
				setScreenSize(3);
				expect(state.one).to.equal(true);
			});
		});

		describe('namespace', () => {
			it('should attach namespace to map object', () => {
				$screen.map({
					size: 3,
					namespace: 'namespace',
					callback() {
						state.one = true;
					}
				});

				setScreenSize(3);
				expect(state.one).to.equal(true);
				resetState();

				$screen.reset('namespace');

				setScreenSize(3);
				expect(state.one).to.equal(false);
			});
		});

		describe('once', () => {
			it('should only execute callback once', () => {
				$screen.map({
					size: 3,
					once: true,
					callback() {
						state.one = true;
					}
				});

				setScreenSize(3);
				expect(state.one).to.equal(true);
				resetState();
				setScreenSize(3);
				expect(state.one).to.equal(false);
			})
		});

		describe('args', () => {
			it('should add to the arguments array', () => {
				$screen.map({
					size: 3,
					args: ['one', 'two'],
					callback(arg, one, two) {
						expect(one).to.equal('one');
						expect(two).to.equal('two');
					}
				});

				setScreenSize(3);
			})
		});

		describe('scope', () => {
			it('should change the scope of the callback', () => {
				let obj = {
					one: 'one'
				};

				$screen.map({
					size: 3,
					scope: obj,
					callback() {
						expect(this.one).to.equal('one');
					}
				});

				setScreenSize(3);
			});
		});

		describe('watch', () => {
			it('should determine evaluation on screen resize', () => {
				$screen.map({
					size: 3,
					watch: false,
					callback() {
						state.one = true;
					}
				});

				setScreenSize(3);
				expect(state.one).to.equal(true);
				resetState();
				setScreenSize(3);
				expect(state.one).to.equal(false);
			});
		});
	});

	describe('run', () => {
		it('should run all mappings', () => {
			$screen.map([
				{
					callback() {
						state.one = true;
					}
				},
				{
					callback() {
						state.two = true;
					}
				},
				{
					callback() {
						state.three = true;
					}
				}
			]);

			$screen.run();
			expect(state.one).to.equal(true);
			expect(state.two).to.equal(true);
			expect(state.three).to.equal(true);
		});

		it('should run all namespaced mappings', () => {
			$screen.map([
				{
					size: 3,
					namespace: 'namespace',
					callback() {
						state.one = true;
					}
				},
				{
					size: 3,
					namespace: 'namespace',
					callback() {
						state.two = true;
					}
				},
				{
					size: 3,
					callback() {
						state.three = true;
					}
				}
			]);

			setScreenSize(3);

			$screen.run('namespace');
			expect(state.one).to.equal(true);
			expect(state.two).to.equal(true);
			expect(state.three).to.equal(false);
		});
	});

	describe('size', () => {
		it('should return the current screen size', () => {
			setScreenSize(2);
			expect($screen.size()).to.equal(2);
		});
	});

	describe('bound', () => {
		it('should return the currently bound mappings', () => {
			expect($screen.bound()).to.be.an('array');
			expect($screen.bound().length).to.equal(0);

			$screen.map({
				size: 3,
				callback() {
					return 'three';
				}
			});

			expect($screen.bound().length).to.equal(1);
			expect($screen.bound()[0].callback()).to.equal('three');
		});

		it('should return the currently bound mappings by namespace', () => {
			$screen.map([
				{
					size: 3,
					namespace: 'namespace',
					callback() {
						return 'three';
					}
				},
				{
					size: 2,
					callback() {
						return 'two';
					}
				}
			]);

			expect($screen.bound().length).to.equal(2);
			expect($screen.bound('namespace').length).to.equal(1);
		});
	});
});