import $ from 'wee-dom';
import { $setRef } from 'core/dom';
import * as W from 'dom/index';

// Test scaffolding methods
function createSingleDiv() {
	let div = document.createElement('div');

	div.textContent = 'test';
	div.className = 'test';
	div.setAttribute('data-ref', 'test');
	div.style.width = '100px';
	div.style.height = '80px';
	div.style.border = '1px solid';
	div.style.padding = '15px 10px';
	div.style.margin = '10px';
	document.querySelector('body').appendChild(div);

	return div;
}

function createMultiDiv() {
	let html = `<main class="grandparent">
					<div class="parent">
						<div id="first" class="child" data-ref="child">1</div>
						<div class="child" data-ref="child">2</div>
						<div class="child other-class" data-ref="child">3</div>
					</div>
				</main>`,
		fragment = document.createRange().createContextualFragment(html);

	document.querySelector('body').appendChild(fragment);
}

function createForm() {
	let html = `<form action="#" id="form">
					<input class="input" type="text" name="input" value="inputValue">
					<input class="checkbox" type="checkbox" name="checkbox" value="checkboxValue" checked>
					<input class="radio" type="radio" name="radio1" value="radioValue" checked>
					<input class="array-input" type="text" name="name[]" value="name1">
					<input type="text" name="email[]" value="email1">
					<input class="array-input" type="text" name="name[]" value="name2">
					<input type="text" name="email[]" value="email2">
					<select class="select" name="select">
						<option value="selectValue1" selected>Option 1</option>
						<option value="selectValue2">Option 2</option>
					</select>
					<select class="multi-select" name="select-multiple" multiple>
						<option value="selectValue1" selected>Option 1</option>
						<option value="selectValue2" selected>Option 2</option>
					</select>
					<select class="optgroup-select" name="optgroup">
						<optgroup>
							<option value="optgroupValue1" selected>Optgroup 1</option>
							<option value="optgroupValue2">Optgroup 2</option>
						</optgroup>
					</select>
					<textarea name="textarea" class="textarea">Text Area</textarea>
				</form>`,
		fragment = document.createRange().createContextualFragment(html);

	document.querySelector('body').appendChild(fragment);
}

function createList() {
	let html = `<ul class="parent">
					<li id="first" class="child"><span>1</span></li>
					<li class="child">2</li>
					<li class="child" data-ref="last">3</li>
				</ul>`,
		fragment = document.createRange().createContextualFragment(html);

	document.querySelector('body').appendChild(fragment);
}

function resetDOM() {
	let body = document.querySelector('body');

	body.innerHTML = '';
	body.style.width = '500px';
}

function isIE() {
	if (navigator.appName == 'Microsoft Internet Explorer') {
		let ua = navigator.userAgent,
			re  = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');

		return re.test(ua);
	} else if (navigator.appName == 'Netscape') {
		let ua = navigator.userAgent,
			re  = new RegExp('Trident/.*rv:([0-9]{1,}[\.0-9]{0,})');

		return re.test(ua);
	}

	return false;
}

function isEdge() {
	return navigator.appName == 'Netscape' &&
		/Edge/.test(navigator.userAgent);
}

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

			expect(data).to.deep.equal({type: 'child', ref: 'child', 'long-prop': 'test'});
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

	describe('$first', () => {
		before(createList);
		after(resetDOM);

		it('should get the first of a matching selection', () => {
			let $el = $('li').first();

			expect($el.length).to.equal(1);
			expect($el[0].id).to.equal('first');
		});

		it('should return raw dom node when using non-chained version of method', () => {
			expect(W.$first('li').id).to.equal('first');
		});
	});

	describe('get', () => {
		before(createMultiDiv);
		after(resetDOM);

		it('should return raw node based on provided index', () => {
			expect($('.child').get(1).innerHTML).to.equal('2');
		})
	});

	describe('$hasClass', () => {
		before(createSingleDiv);
		after(resetDOM);

		it('should identify if selection has a particular class', () => {
			expect($('div').hasClass('test')).to.be.true;
			expect($('div').hasClass('other-class')).to.be.false;
		});
	});

	describe('$hide', () => {
		before(createSingleDiv);
		after(resetDOM);

		it('should apply the js-hide class', () => {
			$('.test').hide();

			expect($('.test')[0].className).to.equal('test js-hide');
		});
	});

	describe('$html', () => {
		before(createList);
		after(resetDOM);

		it('should return inner html', () => {
			expect($('#first').html()).to.equal('<span>1</span>');
		});

		it('should pass element, index, and html to callback', () => {
			$('#first').html((el, i, html) => {
				expect(el.id).to.equal('first');
				expect(i).to.equal(0);
				expect(html).to.equal('<span>1</span>');

				return '<h1>1</h1>';
			});

			expect($('#first').html()).to.equal('<h1>1</h1>');
		});

		it('should set inner html', () => {
			$('#first').html('<div>1</div>');
			expect($('#first').html()).to.equal('<div>1</div>');
		});

		it('should set inner html of select', () => {
			createForm();

			// TODO: do we need to do this?
			window.atob = false;

			$('.select').html('<option>test</option>');

			expect($('.select').html()).to.equal('<option>test</option>');
		});
	});

	describe('$index', () => {
		before(createMultiDiv);
		after(resetDOM);

		it('should return index of selection', () => {
			expect($('#first').index()).to.equal(0);
			expect($('.other-class').index()).to.equal(2);
		});

		it('should return negative index when no selection is found', () => {
			expect($('#none').index()).to.equal(-1);
		});
	});

	describe('$insertAfter', () => {
		before(createMultiDiv);
		after(resetDOM);

		it('should insert matching source after selection', () => {
			$('#first').insertAfter('.other-class');

			expect($('#first')[0].previousElementSibling.className).to.equal('child other-class');
		});

		it('should insert matching source after each matching selection', () => {
			let $targets = $('.child');

			createSingleDiv();

			$('.test').insertAfter('.child');

			expect($targets[0].nextSibling.className).to.equal('test');
			expect($targets[1].nextSibling.className).to.equal('test');
			expect($targets[2].nextSibling.className).to.equal('test');
		});
	});

	describe('$insertBefore', () => {
		before(createMultiDiv);
		after(resetDOM);

		it('should insert matching source before selection', () => {
			$('#first').insertBefore('.other-class');

			expect($('#first')[0].nextElementSibling.className).to.equal('child other-class');
		});

		it('should insert matching source before each matching selection', () => {
			let $targets = $('.child');

			createSingleDiv();

			$('.test').insertBefore('.child');

			expect($targets[0].nextElementSibling.className).to.equal('child');
			expect($targets[1].nextElementSibling.className).to.equal('test');
		});
	})

	describe('$height', () => {
		before(createSingleDiv);
		after(resetDOM);

		it('should find height of element', () => {
			expect($('.test').height()).to.equal(112);
		});

		it('should include margin into calculation when passing true', () => {
			document.querySelector('.test').style.margin = '5px';

			expect($('.test').height(true)).to.equal(122);
		});

		it('should set height of selection', () => {
			$('.test').height(20);

			expect($('.test').height()).to.equal(52);
		});

		it('should find height of window', () => {
			expect($('window').height()).to.equal(window.innerHeight);
		});

		it('should find height of document', () => {
			expect($(document).height()).to.equal(document.documentElement.scrollHeight);
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

	describe('$last', () => {
		before(createMultiDiv);
		after(resetDOM);

		it('should return the last element from selection', () => {
			expect($('.child').last()[0].innerText).to.equal('3');
		});
	});

	describe('$next', () => {
		before(createMultiDiv);
		after(resetDOM);

		it('should return next element from selection', () => {
			expect($('.child').next()[0].innerText).to.equal('2');
		});
	});

	describe('$parent', () => {
		before(createMultiDiv);
		after(resetDOM);

		it('should return the parent of the selection', () => {
			expect($('.child').parent()[0].className).to.equal('parent');
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

	describe('$removeAttr', () => {
		before(createSingleDiv);
		after(resetDOM);
		it('should remove specified attribute from selection', () => {
			$('.test').removeAttr('data-ref');

			expect($('.test')[0].getAttribute('data-ref')).to.equal(null);
		});
	});

	describe('$removeClass', () => {
		before(createSingleDiv);
		after(resetDOM);
		it('should remove specified class from selection', () => {
			$('.test')[0].className = 'test test-class';

			expect($('.test')[0].className).to.equal('test test-class');

			$('.test').removeClass('test-class');

			expect($('.test')[0].className).to.equal('test');
		});

		it('should remove multiple classes from selection', () => {
			$('.test')[0].className = 'test test-class test-class-two';

			expect($('.test')[0].className).to.equal('test test-class test-class-two');

			$('.test').removeClass('test-class test-class-two');

			expect($('.test')[0].className).to.equal('test');
		});

		it('should pass index and className to callback and remove class', () => {
			$('.test')[0].className = 'test test-class';

			$('.test').removeClass((i, className) => {
				expect(i).to.equal(0);
				expect(className).to.equal('test test-class');

				return 'test-class';
			});

			expect($('.test')[0].className).to.equal('test');
		});
	});

	describe('$replaceWith', () => {
		before(createMultiDiv);
		before(createSingleDiv);
		after(resetDOM);
		it('should replace first matching selection with selection', () => {
			$('.child').replaceWith('.test');

			expect($('.child').length).to.equal(0);
			expect($('.test').length).to.equal(1);
		});
	});

	describe('$scrollLeft', () => {
		before(createMultiDiv);
		after(resetDOM);
		it('should return scroll left as unitless pixel value', () => {
			expect($(window).scrollLeft()).to.equal(0);
		});

		it('should return scroll left from window', () => {
			expect($(window).scrollLeft()).to.equal(0);
		});

		it('should set scroll left value', () => {
			$('body')[0].style.width = '15000px';
			$(window).scrollLeft(10);

			expect($(window).scrollLeft()).to.equal(10);
		});

		it('should scroll left value when selecting document', () => {
			$('body')[0].style.width = '15000px';
			$(document).scrollLeft(10);

			expect($(document).scrollLeft()).to.equal(10);
		});

		it('should set scroll left value of parent div', () => {
			$('.parent')[0].style.width = '500px';
			$('.parent')[0].style.overflow = 'scroll';
			$('#first')[0].style.width = '1000px';

			$('.parent').scrollLeft(10);
			expect($('.parent').scrollLeft()).to.equal(10);
		});
	});

	describe('$scrollTop', () => {
		before(createMultiDiv);
		after(resetDOM);
		it('should return scroll top as unitless pixel value', () => {
			expect($(window).scrollTop()).to.equal(0);
		});

		it('should set scroll top value', () => {
			$('body')[0].style.height = '15000px';

			$(window).scrollTop(10);

			expect($(window).scrollTop()).to.equal(10);
		});

		it('should set scroll top value of window when document is selected', () => {
			$('body')[0].style.height = '15000px';

			$(document).scrollTop(10);

			expect($(document).scrollTop()).to.equal(10);
		});

		it('should set scroll top value of parent div', () => {
			$('.parent')[0].style.height = '500px';
			$('.parent')[0].style.overflow = 'scroll';
			$('#first')[0].style.height = '1000px';

			$('.parent').scrollTop(10);
			expect($('.parent').scrollTop()).to.equal(10);
		});
	});

	describe('$serializeForm', () => {
		before(createForm);
		before(createSingleDiv);
		after(resetDOM);

		it('should serialize form value', () => {
			let serializedValue = 'input=inputValue&checkbox=checkboxValue' +
				'&radio1=radioValue&name[]=name1&name[]=name2&email[]=emai' +
				'l1&email[]=email2&select=selectValue1&select-multiple[]=s' +
				'electValue1&select-multiple[]=selectValue2&optgroup=optgr' +
				'oupValue1&textarea=Text+Area';

			expect($('#form').serialize()).to.equal(serializedValue);
		});

		it('should serialize form value to json object', () => {
			let serializedValue = JSON.stringify({
					"input": "inputValue",
					"checkbox": "checkboxValue",
					"radio1": "radioValue",
					"name": [
						"name1",
						"name2",
					],
					"email": [
						"email1",
						"email2",
					],
					"select": "selectValue1",
					"select-multiple": [
						"selectValue1",
						"selectValue2",
					],
					"input": "inputValue",
					"optgroup": "optgroupValue1",
					"textarea": "Text Area"
				});

			expect(JSON.stringify($('#form').serialize(true))).to.equal(serializedValue);
		});

		it('should not attempt to serialize a non form element', () => {
			expect($('.test').serialize()).to.equal('');
		});
	});

	describe('$show', () => {
		before(createSingleDiv);
		after(resetDOM);

		it('should remove js-hide class', () => {
			$('.test')[0].className = 'test js-hide';

			$('.test').show();

			expect($('.test')[0].className).to.equal('test');
		});
	});

	describe('$siblings', () => {
		before(createMultiDiv);
		after(resetDOM);

		it('should return all siblings', () => {
			expect($('.child').siblings().length).to.equal(3);
			expect($('.child').siblings()[2].id).to.equal('first');
		});

		it('should return filtered siblings', () => {
			expect($('.child').siblings('#first').length).to.equal(1);
		});
	});

	describe('$slice', () => {
		before(createList);
		after(resetDOM);

		it('should return subset from specified range', () => {
			expect($('.child').slice(0, 2).length).to.equal(2);
			expect($('.child').slice(1, 2)[0].innerText).to.equal('2');
		});

		it('should handle string target', () => {
			let $result = W.$slice('.child', 0, 2);

			expect($result.length).to.equal(2);
			expect($result).to.be.array;
			expect($result[0].innerText).to.equal('1');
		});
	});

	describe('$text', () => {
		before(createSingleDiv);
		after(resetDOM);

		it('should return the inner text of selection', () => {
			expect($('.test').text()).to.equal('test');
		});

		it('should set the inner text of selection', () => {
			$('.test').text('new text')
			expect($('.test').text()).to.equal('new text');
		});
	});

	describe('$toggle', () => {
		before(createSingleDiv);
		after(resetDOM);

		it('should add the js-hide class if not present', () => {
			$('.test').toggle();

			expect($('.test')[0].className).to.equal('test js-hide');
		});

		it('should remove the js-hide class if not present', () => {
			$('.test')[0].className = 'test js-hide';
			$('.test').toggle();

			expect($('.test')[0].className).to.equal('test');
		});
	});

	describe('$toggleClass', () => {
		before(createSingleDiv);
		after(resetDOM);

		it('should add a class if not present', () => {
			$('.test').toggleClass('test-class');

			expect($('.test')[0].className).to.equal('test test-class');
		});

		it('should remove a class if not present', () => {
			$('.test')[0].className = 'test test-class';
			$('.test').toggleClass('test-class');

			expect($('.test')[0].className).to.equal('test');
		});

		it('should pass index and className to callback', () => {
			$('.test').toggleClass((i, className) => {
				expect(i).to.equal(0);
				expect(className).to.equal('test');
			});
		});

		it('should execute callback', () => {
			$('.test').toggleClass((i, className, state) => {
				expect(i).to.equal(0);
				expect(className).to.equal('test');
				expect(state).to.equal(true);

				return 'test-class';
			}, true);

			expect($('.test')[0].className).to.equal('test test-class');
		});
	});

	describe('$val', () => {
		before(createForm);
		after(resetDOM);

		it('should get the value of an input', () => {
			expect($('.input').val()).to.equal('inputValue');
		});

		it('should get the value of a textarea', () => {
			expect($('.textarea').val()).to.equal('Text Area');
		});

		it('should get the value of a checkbox', () => {
			expect($('.checkbox').val()).to.equal('checkboxValue');
		});

		it('should get the value of a radio', () => {
			expect($('.radio').val()).to.equal('radioValue');
		});

		it('should get the value of a select', () => {
			expect($('.select').val()).to.equal('selectValue1');
		});

		it('should get the values of a multi-select', () => {
			expect($('.multi-select').val().length).to.equal(2);
			expect($('.multi-select').val()).to.contain('selectValue1');
			expect($('.multi-select').val()).to.contain('selectValue2');
		});

		it('should get the value of an optgroup select', () => {
			expect($('.optgroup-select').val()).to.equal('optgroupValue1');
			expect($('.optgroup-select').val()).to.contain('optgroupValue1');
		});

		it('should set the value of an input', () => {
			$('.input').val('new value');
			expect($('.input').val()).to.equal('new value');
		});

		it('should set the value of an input with callback', () => {
			$('.input').val((i, val) => {
				expect(i).to.equal(0);
				expect(val).to.equal('new value');

				return 'second new value'
			});
			expect($('.input').val()).to.equal('second new value');
		});

		it('should set the value of a textarea', () => {
			$('.textarea').val('new value');
			expect($('.textarea').val()).to.equal('new value');
		});

		it('should set the values of a multi-select by string', () => {
			$('.multi-select').val('selectValue1');
			expect($('.multi-select').val()).to.contain('selectValue1');
		});

		it('should set the values of a multi-select by array', () => {
			$('.multi-select').val(['selectValue1', 'selectValue2']);
			expect($('.multi-select').val()).to.contain('selectValue1');
			expect($('.multi-select').val()).to.contain('selectValue2');
		});
	});

	describe('$width', () => {
		before(createSingleDiv);
		after(resetDOM);

		it('should return the width of selection', () => {
			expect($('.test').width()).to.equal(122);
		});

		it('should return the outer width of selection', () => {
			expect($('.test').width(true)).to.equal(142);
		});

		if (isIE()) {
			it('should return the width of window', () => {
				expect($(window).width()).to.equal(1007);
			});

			it('should return the width of document', () => {
				expect($(document).width()).to.equal(990);
			});
		} else if (isEdge()) {
			it('should return the width of window', () => {
				expect($(window).width()).to.equal(788);
			});

			it('should return the width of document', () => {
				expect($(document).width()).to.equal(776);
			});
		} else {
			it('should return the width of window', () => {
				expect($(window).width()).to.equal(1024);
			});

			it('should return the width of document', () => {
				expect($(document).width()).to.equal(1024);
			});
		}

		it('should set the width of selection', () => {
			$('.test').width(200);
			expect($('.test').width()).to.equal(222);
		});

		it('should set the width with callback', () => {
			$('.test').width((i, width) => {
				expect(i).to.equal(0);
				expect(width).to.equal(222);

				return 300;
			});

			expect($('.test').width()).to.equal(322);
		});
	});

	describe('$wrap', () => {
		before(createMultiDiv);
		after(resetDOM);

		it('should wrap markup around selector', () => {
			$('.parent').wrap('<div class="new-parent" />');

			expect($('.parent')[0].parentNode.className).to.equal('new-parent');
		});

		it('should wrap markup around selector with a callback', () => {
			$('.parent').wrap(i => {
				expect(i).to.equal(0);

				return '<div class="new-parent" />';
			});

			expect($('.parent')[0].parentNode.className).to.equal('new-parent');
		});
	});

	describe('$wrapInner', () => {
		before(createMultiDiv);
		after(resetDOM);

		it('should wrap markup even if no children nodes exist', () => {
			$('#first').wrapInner('<div class="first-inner" />');
		});

		it('should wrap markup around inner selection', () => {
			$('.parent').wrapInner('<div class="test" />');

			expect($('#first')[0].parentNode.className).to.equal('test');
		});

		it('should wrap markup around inner selection from a callback', () => {
			$('.parent').wrapInner(i => {
				expect(i).to.equal(0);

				return '<div class="test" />';
			});

			expect($('#first')[0].parentNode.className).to.equal('test');
		});
	});
});