import { $, $chain } from 'core/chain';
import { $each } from 'core/dom';

describe('Core: Chain', () => {
	before(() => {
		let div = document.createElement('div');

		div.innerHTML = 'test';
		div.className = 'test';
		document.querySelector('body').appendChild(div);
	});

	after(() => {
		document.querySelector('body').innerHTML = '';
	});

	describe('$', () => {
		it('should return a new Wee selection object', () => {
			expect($('.test').sel).to.equal('.test');
			expect($('.test')[0].innerHTML).to.equal('test');
		});
	});

	describe('$chain', () => {
		it('should add property to Wee selection prototype', () => {
			$chain('test', true);
			expect($('.test').test).to.be.true;
			delete $.fn.test;
		});

		it('should add object of properties Wee selection prototype', () => {
			$chain({a: 1, b: 2});

			let $el = $('.test');

			expect($el.a).to.equal(1);
			expect($el.b).to.equal(2);
			delete $.fn.a;
			delete $.fn.b;
		});
	});

	describe('each', () => {
		it('should be chainable method', () => {
			let count = 0;

			$('.test').each(() => {
				count++;
			});

			expect(count).to.equal(1);
		});
	});

	describe('map', () => {
		it('should be chainable method', () => {
			let arr = $('.test').map((el, i) => {
				return i;
			});

			expect(arr).to.deep.equal([0]);
		});
	});

	describe('reverse', () => {
		before(() => {
			let html = `<div>
					<div class="each">1</div>
					<div class="each">2</div>
					<div class="each">3</div>
				</div>`,
				fragment = document.createRange().createContextualFragment(html);

			document.querySelector('body').appendChild(fragment);
		});

		it('should be chainable method', () => {
			let $reversed = $('.each').reverse();

			expect($reversed[0].innerHTML).to.deep.equal('3');
			expect($reversed[2].innerHTML).to.deep.equal('1');
		});
	});

	describe('toArray', () => {
		it('should be chainable method', () => {
			expect($('.test').toArray()).to.be.an('array');
		});
	});
});