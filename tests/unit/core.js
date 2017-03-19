import { $env, $envReset, $envSecure, $exec, $extend } from 'core';

describe('Core: Core', () => {
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

	describe('$envSecure', () => {
		it('should identify HTTPS protocol', () => {
			expect($envSecure()).to.be.false;
		});
	});

	describe('$exec', () => {
		it('should execute supplied function', () => {
			let count = 0,
				fn = function() {
					return ++count;
				};

			expect($exec(fn)).to.be.equal(1);
		});

		it('should optionally inject scope', () => {
			let fn = function() {
					return this.prop;
				},
				scope = {prop: 'value'};

			expect($exec(fn, {
				scope: scope
			})).to.equal('value');
		});

		it('should optionally pass arguments array', () => {
			let fn = function() {
					return arguments[1];
				};

			expect($exec(fn, {
				args: [0, 1]
			})).to.equal(1);
		});

		it('should execute multiple functions', () => {
			let count = 0,
				fn = function() {
					count++;
				};

			$exec([fn, fn]);

			expect(count).to.equal(2);
		});

		it('should not return value if executing multiple functions', () => {
			let fn = function() {
					return true;
				};

			expect($exec([fn, fn])).to.equal(undefined);
		});
	});
});