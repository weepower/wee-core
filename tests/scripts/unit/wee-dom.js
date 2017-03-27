import $ from 'wee-dom';
import { $setRef } from 'core/dom';
import * as W from 'dom/index';

// Test scaffolding methods
function createSingleDiv() {
	let div = document.createElement('div');

	div.textContent = 'test';
	div.className = 'test';
	document.querySelector('body').appendChild(div);

	return div;
}

function createMultiDiv() {
	let html = `<main class="grandparent">
					<div class="parent">
						<div id="first" class="child">1</div>
						<div class="child">2</div>
						<div class="child">3</div>
					</div>
				</main>`,
		fragment = document.createRange().createContextualFragment(html);

	document.querySelector('body').appendChild(fragment);
}

function createList() {
	let html = `<ul class="parent">
						<li id="first" class="child">1</li>
						<li class="child">2</li>
						<li class="child" data-ref="last">3</li>
					</ul>`,
		fragment = document.createRange().createContextualFragment(html);

	document.querySelector('body').appendChild(fragment);
}

function resetDOM() {
	document.querySelector('body').innerHTML = '';
};

// Tests
describe('DOM', () => {
	describe('$addClass', () => {
		before(createSingleDiv);
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

		before(createSingleDiv);
		after(resetDOM);
		afterEach(() => {
			let div = document.querySelector('.after');

			if (div) {
				div.parentNode.removeChild(div);
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

			createSingleDiv();
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
			createSingleDiv();
			$('.test').after('<div class="after"></div>');

			expect($('.test')[0].nextSibling.className).to.equal('after');
			expect($('.test')[1].nextSibling.className).to.equal('after');
		});
	});

	describe('$append', () => {
		before(createMultiDiv);
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
		before(createMultiDiv);
		after(resetDOM);

		it('should append selection to target', () => {
			$('#first').appendTo($('.parent'));

			expect($('.parent')[0].children[2].id).to.equal('first');
		});
	});

	describe('$attr', () => {
		before(() => {
			let div = createSingleDiv();

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

	describe('$before', () => {
		function createBeforeDiv() {
			let div = document.createElement('div');

			div.className = 'before';

			return div;
		}

		let div = createBeforeDiv();

		before(createSingleDiv);
		after(resetDOM);
		afterEach(() => {
			let div = document.querySelector('.before');

			if (div) {
				div.parentNode.removeChild(div);
			}
		});

		it('should prepend markup after target', () => {
			$('.test').before('<div class="before"></div>');

			expect($('.test')[0].previousSibling.className).to.equal('before');
		});

		it('should move existing element before target', () => {
			let el = $('.test')[0];

			document.body.appendChild(div);
			$('.test').before($('.before'));

			expect(el.previousSibling.className).to.equal('before');
		});

		it('should remove target after moving element selection', () => {
			document.body.appendChild(div);
			$('.test').before($('.before'), true);

			expect(document.body.children.length).to.equal(1);
			expect($('.test').length).to.equal(0);
			expect(document.body.firstChild.className).to.equal('before');

			createSingleDiv();
		});

		it('should dynamically generate markup to move before target', () => {
			let el = $('.test')[0];

			el.innerHTML = 'dynamic';
			$('.test').before(function(i, html) {
				return `<div class="before">${html} - ${i}</div>`;
			});

			expect(el.previousSibling.className).to.equal('before');
			expect(el.previousSibling.innerHTML).to.equal('dynamic - 0');
		});

		it('should move element before multiple targets', () => {
			document.body.appendChild(div);
			createSingleDiv();
			$('.test').before('<div class="before"></div>');

			expect($('.test')[0].previousSibling.className).to.equal('before');
			expect($('.test')[1].previousSibling.className).to.equal('before');
		});
	});

	describe('$children', () => {
		before(createMultiDiv);
		after(resetDOM);

		it('should select direct children of selection', () => {
			let $children = $('.parent').children();

			expect($children.length).to.equal(3);
		});

		it('should select a filtered subset of direct children', () => {
			let $children = $('.parent').children('#first');

			expect($children.length).to.equal(1);
			expect($children[0].innerHTML).to.equal('1');
		});
	});

	describe('$clone', () => {
		before(createSingleDiv);
		after(resetDOM);

		it('should clone selection', () => {
			let $clone = $('.test').clone();

			document.body.appendChild($clone[0]);

			expect($clone[0].className).to.equal('test');
			expect(document.body.children.length).to.equal(2);
		});
	});

	describe('$closest', () => {
		before(() => {
			createMultiDiv();
			createList();
			$setRef();
		});
		after(resetDOM);

		it('should return closest ancestor', () => {
			expect($('.child').closest('.parent').length).to.equal(2);
		});

		it('should return closest ancestor starting with itself', () => {
			expect($('#first').closest('div')[0].id).to.equal('first');
		});

		it('should return empty wee selection if selection is html element', () => {
			expect($('html').closest('.nothing').length).to.equal(0);
			expect($('body').closest('.nothing').length).to.equal(0);
		});
	});

	describe('$contains', () => {
		before(createMultiDiv);
		after(resetDOM);

		it('should determine if selection contains children elements', () => {
			expect($('.grandparent').contains('.child')).to.be.true;
			expect($('.grandparent').contains('span')).to.be.false;
		});
	});

	describe('$contents', () => {
		before(createMultiDiv);
		after(resetDOM);

		it('should get unique contents of selection', () => {
			let result = '';

			$('.parent').contents().each(el => {
				// This is to account for the indentation text nodes
				// that exist because of the format of the createMultiDiv result
				result += el.innerHTML || 'indent';
			});

			expect($('.parent').contents().length).to.equal(7);
			expect(result).to.equal('indent1indent2indent3indent');
		});
	});

	describe('$css', () => {
		before(createMultiDiv);
		after(resetDOM);

		it('should set css property on selection', () => {
			let count = 0;

			$('.child').css('display', 'inline');

			$('.child').each(el => {
				count++;
				expect(el.style.display).to.equal('inline');
			});

			expect(count).to.equal(3);
		});

		it('should get the css value of first matching selection', () => {
			expect($('.child').css('display')).to.equal('inline');
		});

		it('should handle an object of css properties', () => {
			$('.child').css({
				display: 'inline-block',
				color: 'blue'
			});

			$('.child').each(el => {
				expect(el.style.display).to.equal('inline-block');
				expect(el.style.color).to.equal('blue');
			});
		});
	});

	describe('$data', () => {
		before(createMultiDiv);
		after(resetDOM);

		it('should set data property on selection', () => {
			let count = 0;

			$('.child').data('type', 'child');

			$('.child').each(el => {
				count++;
				expect(el.getAttribute('data-type')).to.equal('child');
			});

			expect(count).to.equal(3);
		});

		it('should get data property on selection', () => {
			expect($('.child').data('type')).to.equal('child');
		});

		it('should handle an object of data properties', () => {
			$('.parent').data({
				type: 'parent',
				id: 1
			});

			$('.parent').each(el => {
				expect(el.getAttribute('data-type')).to.equal('parent');
				expect(el.getAttribute('data-id')).to.equal('1');
			});
		});

		it('should retrieve all data properties if no property is provided', () => {
			// Adding the capital P was for executing _toDashed
			$('.child').data('long-Prop', 'test');
			let data = $('.child').data();

			expect(data).to.deep.equal({type: 'child', 'long-prop': 'test'});
		});
	});

	describe('$empty', () => {
		before(createList);
		after(resetDOM);

		it('should empty selection contents', () => {
			$('.parent').empty();

			expect($('.parent')[0].outerHTML).to.equal('<ul class="parent"></ul>');
		});
	});

	describe('$eq', () => {
		before(createList);
		after(resetDOM);

		it('should return indexed node', () => {
			expect($('li').eq(1)[0].outerHTML).to.equal('<li class="child">2</li>');
		});
	});

	describe('$filter', () => {
		before(() => {
			createList();
			createMultiDiv();
			$setRef();
		});
		after(resetDOM);

		it('should return a filtered subset of elements', () => {
			let $els = $('.child'),
				$result = $els.filter('li');

			expect($els.length).to.equal(6);
			expect($result.length).to.equal(3);
		});

		it('should handle data-ref as filter', () => {
			let $result = $('.child').filter('ref:last');

			expect($result.length).to.equal(1);
		});

		it('should handle selection as criteria', () => {
			let $els = $('.child'),
				$result = $els.filter($('ref:last'));

			expect($els.length).to.equal(6);
			expect($result.length).to.equal(1);
		});
	});

	describe('$find', () => {
		before(createMultiDiv);
		after(resetDOM);

		it('should find unique descendents', () => {
			expect($('.grandparent').find('#first').length).to.equal(1);
			expect($('.grandparent').find('div').length).to.equal(4);
		});
	});

	describe('$is', () => {
		before(() => {
			createList();
			createMultiDiv();
			$setRef();
		});
		after(resetDOM);

		it('should determine if at least one element meets criteria', () => {
			expect($('.child').is('li')).to.be.true;
			expect($('.child').is('.parent')).to.be.false;
		});

		it('should handle data-ref as filter criteria', () => {
			expect($('li').is('ref:last')).to.be.true;
		});

		it('should handle array of elements as criteria', () => {
			let array = [$('ref:last')[0]];

			expect($('li').is(array)).to.be.true;
		});

		it('should handle wee selection as criteria', () => {
			expect($('.child').is($('li'))).to.be.true;
		});

		it('should accept function as criteria', () => {
			expect($('.child').is((i, el) => {
				return el.getAttribute('data-ref') === 'last';
			})).to.be.true;
		});
	});

	describe('$remove', () => {
		before(createSingleDiv);
		after(resetDOM);
		it('should remove selection from document', () => {
			$('.test').remove();

			expect($('.test').length).to.equal(0);
		});
	});
});