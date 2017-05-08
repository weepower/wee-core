import $screen from 'wee-screen';
import { _html, _win } from 'core/variables';

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
	describe('map', () => {
		it('should add a mapping to the registry', () => {
			let state = true;

			setScreenSize(3);

			$screen.map({
				size: 3,
				callback: function() {
					state = false;
				}
			});

			expect(state).to.equal(false);
		});

		it('should add multiple mappings to the registry', () => {
			let state = true;
			let state2 = true;

			setScreenSize(3);

			$screen.map([
				{
					size: 3,
					callback: function() {
						state = false;
					}
				},
				{
					size: 2,
					callback: function() {
						state2 = false;
					}
				}
			]);

			setScreenSize(2);

			expect(state).to.equal(false);
			expect(state2).to.equal(false);
		});
	});
});