import $ from 'wee-dom';
import * as W from 'dom/index';

describe('DOM', () => {
	describe('$addClass', () => {
		before(() => {
			let div = document.createElement('div');

			div.textContent = 'test';
			div.classList = 'test';
			document.querySelector('body').appendChild(div);
		});

		after(() => {
			document.querySelector('body').innerHTML = '';
		});

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
});