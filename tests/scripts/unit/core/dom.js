import { ready, $parseHTML } from 'core/dom';

describe('Core: DOM', () => {
	beforeEach(() => {
		document.querySelector('body').innerHTML = '';
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

	describe('$parseHTML', () => {
		it('should create a document fragment from HTML string', () => {
			let html = '<div class="container"><ul><li class="child">1</li><li class="child">2</li></ul></div>',
				fragment = $parseHTML(html);

			// Fragments should be have DOM api accessible, even before on document
			expect(fragment.querySelector('.child').textContent).to.equal('1');

			document.querySelector('body').appendChild(fragment);

			expect(document.querySelector('.container').innerHTML).to.equal('<ul><li class="child">1</li><li class="child">2</li></ul>');
		});
	});
});