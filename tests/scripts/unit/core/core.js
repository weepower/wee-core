import { $env, $envReset } from 'core/core';

describe('Core', () => {
	describe('$env', () => {
		beforeEach(() => {
			$envReset();
		});

		it('should default to "local"', () => {
			$env({
				prod: 'something.com'
			});

			expect($env()).to.equal('local');
		});

		it('should register and identify environments', () => {
			$env({
				prod: location.hostname
			});

			expect($env()).to.equal('prod');
		});

		it('should be able to register default value', () => {
			$env({
				prod: 'notthesite.com'
			}, 'notLocal');
			expect($env()).to.equal('notLocal');
		});
	});
});