import $ from 'wee-dom';
import * as W from 'dom/index';

// Test scaffolding methods
function singleDiv() {
	let div = document.createElement('div');

	div.textContent = 'test';
	div.className = 'test';
	document.querySelector('body').appendChild(div);

	return div;
}

function multiDiv() {
	let html = `<div class="parent">
						<div id="first" class="child">1</div>
						<div class="child">2</div>
						<div class="child">3</div>
					</div>`,
		fragment = document.createRange().createContextualFragment(html);

	document.querySelector('body').appendChild(fragment);
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

		it('should add multiple classes', () => {
			$('.test').addClass('fourth-class fifth-class');

			expect($('.test')[0].className).to.equal('test another-class third-class fourth-class fifth-class');
		});

		it('should not duplicate classes', () => {
			$('.test').addClass('fourth-class');

			expect($('.test')[0].className).to.equal('test another-class third-class fourth-class fifth-class');
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

		it('should append markup after target', () => {
			$('.test').after('<div class="after"></div>');

			expect($('.test')[0].nextSibling.className).to.equal('after');
		});

		it('should move existing element after target', () => {
			let el = $('.test')[0];

			document.body.insertBefore(div, document.querySelector('.test'));
			$('.test').after($('.after'));

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

	describe('$append', () => {
		before(multiDiv);
		after(resetDOM);

		it('should append markup to end of parent target', () => {
			$('.parent').append('<div class="child">4</div>');

			expect($('.child').length).to.equal(4);
			expect($('.child')[3].innerHTML).to.equal('4');
		});

		it('should append selection to end of parent target', () => {
			$('.parent').append($('#first'));

			expect($('div', '.parent')[3].innerHTML).to.equal('1');
		});
	});

	describe('appendTo', () => {
		before(multiDiv);
		after(resetDOM);

		it('should append selection to target', () => {
			$('#first').appendTo($('.parent'));

			expect($('.parent')[0].children[2].id).to.equal('first');
		});
	});

	describe('$attr', () => {
		before(() => {
			let div = singleDiv();

			div.setAttribute('data-ref', 'testRef');
		});
		after(resetDOM);

		it('should get attribute of first matching selection', () => {
			expect($('.test').attr('data-ref')).to.equal('testRef');
		});

		it('should set attribute of selection', () => {
			$('.test').attr('id', 'test');

			expect($('.test')[0].id).to.equal('test');
		});

		it('should set a group of attributes on selection', () => {
			let $el = $('.test');

			$el.attr({
				id: 'multiAttr',
				'data-index': 1
			});

			expect($el[0].id).to.equal('multiAttr');
			expect($el[0].getAttribute('data-index')).to.equal('1');
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