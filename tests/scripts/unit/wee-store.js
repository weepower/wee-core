import $store from 'wee-store';
import sinon from 'sinon';

describe('Store', () => {
	let storeDouble;
	let observeDouble;

	beforeEach(() => {
		storeDouble = {
			$: {}
		};
		observeDouble = {
			$: {}
		};
	});

	describe('_storage', () => {
		it('should retrieve data storage root, key, and value', () => {
			storeDouble.$.test = true;
			const result = $store._storage(storeDouble, 'test');

			expect(result[0]).to.deep.equal({ test: true });
			expect(result[1]).to.equal('test');
			expect(result[2]).to.be.true;
		});

		it('should retrieve by period delimited key', () => {
			storeDouble.$.obj = { test: true };
			const result = $store._storage(storeDouble, 'obj.test');

			expect(result[0]).to.deep.equal({ test: true });
			expect(result[1]).to.equal('test');
			expect(result[2]).to.be.true;
		});

		it('should retrieve by array index', () => {
			storeDouble.$.obj = ['value'];
			const result = $store._storage(storeDouble, 'obj.0');

			expect(result[0]).to.deep.equal(['value']);
			expect(result[1]).to.equal('0');
			expect(result[2]).to.equal('value');
		});

		it('should create arrays on missing property when "create" is set to false', () => {
			const result = $store._storage(storeDouble, 'objA.objB.test');

			expect(result[0]).to.deep.equal([]);
			expect(result[1]).to.equal('test');
			expect(result[2]).to.be.undefined;
		});

		it('should create objects on missing property when "create" is set to true', () => {
			const result = $store._storage(storeDouble, 'objA.objB.test', true);

			expect(result[0]).to.deep.equal({});
			expect(result[1]).to.equal('test');
			expect(result[2]).to.be.undefined;
		});

		it('should return entire data store if no key provided', () => {
			storeDouble.$.test = 'value';
			const result = $store._storage(storeDouble);

			expect(result[0]).to.deep.equal({
				$: { test: 'value' }
			});
			expect(result[1]).to.equal('$');
			expect(result[2]).to.deep.equal({ test: 'value' });
		});
	});

	describe('_val', () => {
		it('should return provided value', () => {
			expect($store._val('test')).to.equal('test');
		});

		it('should return result of function evaluation', () => {
			expect($store._val(() => 1 + 1)).to.equal(2);
		});

		it('should pass options as arguments to function', () => {
			let arg1 = 'a';
			let arg2 = 'b';
			let mock = sinon.mock();

			// Assert that both args will be passed in on execution
			mock.withExactArgs(arg1, arg2);

			$store._val(mock, { args: [arg1, arg2] });
		});
	});

	describe('_set', () => {
		it('should set property on data store object', () => {
			$store._set(storeDouble, observeDouble, 'prop', true);

			expect(storeDouble.$.prop).to.be.true;
		});

		it('should replace data store when key is ommitted', () => {
			const newStore = { test: 'value' };
			$store._set(storeDouble, observeDouble, newStore);

			// Testing exact object reference
			expect(storeDouble.$).to.equal(newStore);
		});
	});

	describe('_get', () => {
		it('should retrieve property from data store', () => {
			storeDouble.$.prop = true;

			expect($store._get(storeDouble, observeDouble, 'prop')).to.be.true;
		});

		it('should return fallback value if provided', () => {
			expect($store._get(storeDouble, observeDouble, 'prop', 'fallback')).to.equal('fallback');

			// Fallback value is does not persist
			expect($store._get(storeDouble, observeDouble, 'prop')).to.be.null;
		});

		it('should set fallback value if provided', () => {
			expect($store._get(storeDouble, observeDouble, 'prop', 'fallback', true)).to.equal('fallback');

			// Fallback value should persist
			expect($store._get(storeDouble, observeDouble, 'prop')).to.equal('fallback');
		});
	});

	describe('set', () => {
		it('should set property', () => {
			$store.set('prop', true);

			expect($store.store.$.prop).to.be.true;
		});

		it('should set mult-level property', () => {
			$store.set('propA.propB.propC', true);

			expect($store.store.$.propA).to.be.an.object;
			expect($store.store.$.propA.propB).to.be.an.object;
			expect($store.store.$.propA.propB.propC).to.be.true;
		});
	});

	describe('get', () => {
		it('should retrieve property', () => {
			$store.set('prop', true);
			expect($store.get('prop')).to.be.true;
		});

		it('should retrieve multi-level property', () => {
			$store.set('propA.propB.propC', true);
			expect($store.get('propA.propB.propC')).to.be.true;
		});
	});
});