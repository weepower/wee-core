import { $, $chain } from 'chain';
import { $each } from 'dom';

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
			let fn = $('.test').each;

			expect(fn).to.not.be.undefined;
		});
	});

	describe('map', () => {
		it('should be chainable method', () => {
			let fn = $('.test').map;

			expect(fn).to.not.be.undefined;
		});
	});

	describe('reverse', () => {
		it('should be chainable method', () => {
			let fn = $('.test').reverse;

			expect(fn).to.not.be.undefined;
		});
	});

	describe('toArray', () => {
		it('should be chainable method', () => {
			let fn = $('.test').toArray;

			expect(fn).to.not.be.undefined;
		});
	});
});