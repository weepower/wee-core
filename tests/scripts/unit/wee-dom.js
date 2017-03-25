import $ from 'wee-dom';
import * as W from 'dom/index';

// Test scaffolding methods
function singleDiv() {
	let div = document.createElement('div');

	div.textContent = 'test';
	div.classList = 'test';
	document.querySelector('body').appendChild(div);
}

singleDiv.remove = () => {
	document.querySelector('body').innerHTML = '';
};

// Tests
describe('DOM', () => {
	describe('$addClass', () => {
		before(singleDiv);
		after(singleDiv.remove);

		it('should add a class to selection', () => {
			let $el = $('.test').addClass('another-class');

			expect($el[0].className).to.equal('test another-class');
		});

		it('should take a callback function', () => {
			let $el = $('.test').addClass((i, classNames) => {
				if (classNames.indexOf('another-class') > 0) {
					return 'third-class';
				}
			});

			expect($el[0].className).to.equal('test another-class third-class');
		});

		it('should have standalone method', () => {
			let el = document.querySelector('.test');

			W.$addClass(el, 'fourth-class');

			expect(el.className).to.equal('test another-class third-class fourth-class');
		});
	});

	describe('$after', () => {
		function createAfterDiv() {
			let div = document.createElement('div');

			div.className = 'after';

			return div;
		}

		let div = createAfterDiv();

		before(singleDiv);
		after(singleDiv.remove);
		afterEach(() => {
			document.querySelector('.after').remove();
		});

		it('should append element after target', () => {
			$('.test').after('<div class="after"></div>');

			expect($('.test')[0].nextSibling.className).to.equal('after');
		});

		it('should move existing element after target', () => {
			let el = $('.test')[0];

			document.body.insertBefore(div, document.querySelector('.test'));
			$('.test').after($('.after'));

			expect(el.nextSibling.className).to.equal('after');
		});

		it('should move element selection when provided with string selector', () => {
			let el = $('.test')[0];

			document.body.insertBefore(div, document.querySelector('.test'));
			$('.test').after('.after');

			expect(el.nextSibling.className).to.equal('after');
		});

		it('should remove target after moving element selection', () => {
			document.body.insertBefore(div, document.querySelector('.test'));
			$('.test').after($('.after'), true);

			expect(document.body.children.length).to.equal(1);
			expect($('.test').length).to.equal(0);
			expect(document.body.firstChild.className).to.equal('after');
		});
	});
});