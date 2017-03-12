import { $type } from 'core/types';

describe('Core: Types', () => {
	describe('$type', () => {
		it('should identify objects', () => {
			expect($type({})).to.equal('object');
		});

		it('should identify arrays', () => {
			expect($type([])).to.equal('array');
		});

		it('should identify strings', () => {
			expect($type('string')).to.equal('string');
		});

		it('should identify numbers', () => {
			expect($type(10)).to.equal('number');
			expect($type(0.234)).to.equal('number');
			expect($type(NaN)).to.equal('number');
		});

		it('should identify null', () => {
			expect($type(null)).to.equal('null');
		});

		it('should identify undefined', () => {
			expect($type(undefined)).to.equal('undefined');
		});

		it('should identify symbols', () => {
			expect($type(Symbol())).to.equal('symbol');
		});
	});
});