import $ from 'wee-dom';
import * as W from 'dom/index';

// Test scaffolding methods
function singleDiv() {
	let div = document.createElement('div');

	div.textContent = 'test';
	div.classList = 'test';
	document.querySelector('body').appendChild(div);
}

function resetDOM() {
	document.querySelector('body').innerHTML = '';
};

// Tests
describe('DOM', () => {
	describe('$addClass', () => {
		before(singleDiv);
		after(resetDOM);

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
		after(resetDOM);
		afterEach(() => {
			let div = document.querySelector('.after');

			if (div) {
				div.remove();
			}

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

			singleDiv();
		});

		it('should dynamically generate markup to move after target', () => {
			let el = $('.test')[0];

			el.innerHTML = 'dynamic';
			$('.test').after(function(i, html) {
				return `<div class="after">${html} - ${i}</div>`;
			});

			expect(el.nextSibling.className).to.equal('after');
			expect(el.nextSibling.innerHTML).to.equal('dynamic - 0');
		});

		it('should move element after multiple targets', () => {
			document.body.insertBefore(div, document.querySelector('.test'));
			singleDiv();
			$('.test').after('<div class="after"></div>');

			expect($('.test')[0].nextSibling.className).to.equal('after');
			expect($('.test')[1].nextSibling.className).to.equal('after');
		});
	});

	describe('$clone', () => {
		before(singleDiv);
		after(resetDOM);

		it('should clone selection', () => {
			let $clone = $('.test').clone();

			document.body.appendChild($clone[0]);

			expect($clone[0].className).to.equal('test');
			expect(document.body.children.length).to.equal(2);
		});
	});

	describe('$remove', () => {
		before(singleDiv);
		after(resetDOM);
		it('should remove selection from document', () => {
			$('.test').remove();

			expect($('.test').length).to.equal(0);
		});
	});
});