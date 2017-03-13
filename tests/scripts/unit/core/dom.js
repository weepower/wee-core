import { _doc, _win } from 'core/variables';
import { ready, $each, $parseHTML, $, $setRef } from 'core/dom';

describe('Core: DOM', () => {
	describe('$', () => {
		before(() => {
			let div = document.createElement('div');

			div.textContent = 'test';
			div.classList = 'test';
			div.setAttribute('data-ref', 'testRef');
			document.querySelector('body').appendChild(div);
		});

		after(() => {
			document.querySelector('body').innerHTML = '';
		});

		it('should return cached response when selecting window', () => {
			expect($('window')[0]).to.equal(_win);
		});

		it('should return cached response when selecting document', () => {
			expect($('document')[0]).to.equal(_doc);
		});

		it('should select elements by passing dom node', () => {
			let span = document.createElement('span');
			document.querySelector('body').appendChild(span);

			expect($(span)[0]).to.equal(span);
		});

		it('should select elements by element name', () => {
			expect($('div')[0].textContent).to.equal('test');
		});

		it('should select elements by class name', () => {
			expect($('.test')[0].textContent).to.equal('test');
		});

		it('should select elements with context', () => {
			expect($('.test', 'body')[0].textContent).to.equal('test');
			expect($('.test', 'div')[0]).to.be.undefined;
		});

		it('should select elements by data ref', () => {
			$setRef();
			expect($('ref:testRef')[0].textContent).to.equal('test');
		});
	});

	describe('$each', () => {
		before(() => {
			let html = `<div>
					<div class="each">1</div>
					<div class="each">2</div>
					<div class="each">3</div>
					<div class="context">
						<div class="each">4</div>
					</div>
					</div>`,
				fragment = document.createRange().createContextualFragment(html);

			document.querySelector('body').appendChild(fragment);
		});

		after(() => {
			document.querySelector('body').innerHTML = '';
		});

		it('should execute function for each matching selection', () => {
			let count = 0;

			$each($('.each'), el => {
				count = el.textContent;
			});

			expect(count).to.equal('4');
		});

		it('should iterate in reverse', () => {
			let count = 0;

			$each($('.each'), el => {
				count = el.textContent;
			}, {
				reverse: true
			});

			expect(count).to.equal('1');
		});

		it('should inject scope into callback functions', () => {
			let scope = 0;

			$each($('.each'), function(el) {
				scope = this.a;
			}, {
				scope: {a: 1}
			});

			expect(scope).to.equal(1);
		});

		it('should filter based on context', () => {
			let count;

			$each('.each', function(el, i) {
				count = i;
			}, {
				context: '.context'
			});

			expect(count).to.equal(0);
		});
	});

	describe('$parseHTML', () => {
		afterEach(() => {
			document.querySelector('body').innerHTML = '';
		});

		it('should create a document fragment from HTML string', () => {
			let html = '<div class="container"><ul><li class="child">1</li><li class="child">2</li></ul></div>',
				fragment = $parseHTML(html);

			// Fragments should be have DOM api accessible, even before on document
			expect(fragment.querySelector('.child').textContent).to.equal('1');

			document.querySelector('body').appendChild(fragment);

			expect(document.querySelector('.container').innerHTML).to.equal('<ul><li class="child">1</li><li class="child">2</li></ul>');
		});
	});

	describe('$setRef', () => {
		beforeEach(() => {
			let div = document.createElement('div');

			// Reset registry
			$setRef();

			// Define base element
			div.setAttribute('data-ref', 'testRef');
			document.querySelector('body').appendChild(div);
		});

		afterEach(() => {
			// Reset DOM
			document.querySelector('body').innerHTML = '';
		});

		it('should register elements with data-ref attribute', () => {
			expect($('ref:testRef').length).to.equal(0);
			$setRef();
			expect($('ref:testRef').length).to.equal(1);
		});

		it('should register elements within provided context', () => {
			let html = `<div>
					<div class="context">
						<div data-ref="testRef"></div>
					</div>
				</div>`,
				fragment = document.createRange().createContextualFragment(html);

			document.querySelector('body').appendChild(fragment);
			$setRef('.context');

			expect($('ref:testRef').length).to.equal(1);
		});
	});

	describe('ready', () => {
		it('should execute callback when document has finished loading', done => {
			let state = false;

			ready(() => {
				state = true;
				expect(state).to.be.true;
				done();
			});
		});
	});
});