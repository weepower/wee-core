const sinon = require('sinon');
import $fetch from 'wee-fetch';

describe('fetch', () => {
	it('should be a function', () => {
		expect($fetch).to.be.a('function');
	});

	describe('create', () => {
		it('should create a new instance of fetch', () => {
			const instance = $fetch.create();

			expect(instance).to.be.a('function');
			expect(instance.request).to.be.a('function');
		});
	});
});