import * as scroll from 'routes/scroll';
import $ from 'wee-dom';
import { _doc, _win } from 'core/variables';
import $router from 'wee-routes';

describe('Router: scroll', () => {
	describe('saveScrollPosition', () => {
		it('should store window position', () => {
			scroll.saveScrollPosition();

			let scrollPosition = scroll._getPositionStore();

			expect(scrollPosition).to.be.an('object');
			Object.keys(scrollPosition).forEach(key => {
				expect(scrollPosition[key]).to.deep.equal({ x: 0, y: 0 });
			});
		});
	});

	describe('getScrollPosition', () => {
		it('should retrieve current scroll position', () => {
			scroll.saveScrollPosition();

			const position = scroll.getScrollPosition();

			expect(position).to.be.an('object');
			expect(position).to.deep.equal({ x: 0, y: 0 });
		});
	});

	describe('getElementPosition', () => {
		before(() => {
			document.body.innerHTML = `<main style="margin-top: 0px;min-height: 200px;height: 2000px;">
<div class="container" style="margin: 0; padding: 0; height: 500px; width: 500px; overflow: scroll;">
	<div style="width: 1000px; height: 1000px;"></div>
	<div class="inner-target" style="width: 1000px; height: 10px;"></div>
	<div style="width: 1000px; height: 1000px;"></div>
</div>
<div id="target" style="height: 50px; width: 50px;"></div>
</main>`
		});

		after(() => {
			document.body.innerHTML = '';
		});

		it('should retrieve element position', () => {
			expect(scroll.getElementPosition('#target')).to.deep.equal({
				el: document.querySelector('#target'),
				x: 8,
				y: 508
			});
		});

		it('should return false if no element found', () => {
			expect(scroll.getElementPosition('#nothing')).to.be.false;
		});

		it('should accept wee selection', () => {
			expect(scroll.getElementPosition($('#target'))).to.deep.equal({
				x: 8,
				y: 508,
				el: document.querySelector('#target')
			});
		});

		it('should accept dom node', () => {
			expect(scroll.getElementPosition(_doc.querySelector('#target'))).to.deep.equal({
				x: 8,
				y: 508,
				el: document.querySelector('#target')
			});

			expect(scroll.getElementPosition(_doc.querySelector('.inner-target'))).to.deep.equal({
				x: 8,
				y: 1008,
				el: document.querySelector('.inner-target')
			});
		});
	});

	describe('handleScroll', () => {
		before(() => {
			document.querySelector('html').setAttribute('style', 'height: 2000px; min-height: 2000px;');
			_win.document.body.innerHTML = `<main style="margin-top: 0px;min-height: 2000px;height: 2000px;">
<div class="container" style="margin: 0; padding: 0; height: 500px; width: 500px; overflow: scroll;">
	<div style="width: 1000px; height: 1000px;"></div>
	<div class="inner-target" style="width: 1000px; height: 10px;"></div>
	<div style="width: 1000px; height: 1000px;"></div>
</div>
<div id="target" style="height: 50px; width: 50px;"></div>
</main>`;
		});

		after(() => {
			document.body.innerHTML = '';
		});

		beforeEach(() => {
			$router.reset();
			window.scrollTo(0, 0);
		});

		it('should scroll to designated position', () => {
			scroll.handleScroll(null, null, () => {
				return { x: 0, y: 100 };
			});

			expect(_win.pageXOffset).to.equal(0);
			expect(_win.pageYOffset).to.equal(100);
		});

		it('should scroll to element', () => {
			scroll.handleScroll(null, null, () => {
				return { el: $('.inner-target') };
			});

			expect($('.container')[0].scrollLeft).to.equal(8);
			expect($('.container')[0].scrollTop).to.equal(1008);
		});

		it('should not scroll if scrollBehavior returns false', () => {
			scroll.handleScroll(null, null, () => {
				return false;
			});

			expect(window.pageXOffset).to.equal(0);
			expect(window.pageYOffset).to.equal(0);
		});
	});
});