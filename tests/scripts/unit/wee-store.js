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
		$store.store.$ = {};
	});

	/**
	 * Push or concatenate values into array
	 *
	 * @private
	 */
	describe('_add', () => {
		beforeEach(() => {
			storeDouble.$.prop = [1, 2];
		});

		it('should concatenate provided array to existing property', () => {
			const result = $store._add('concat', storeDouble, observeDouble, 'prop', [3, 4, 5], false);

			expect(result).to.deep.equal([1, 2, 3, 4, 5]);
		});

		it('should concatenate provided array at beginning of existing property', () => {
			const result = $store._add('concat', storeDouble, observeDouble, 'prop', [3, 4, 5], true);

			expect(result).to.deep.equal([3, 4, 5, 1, 2]);
		});

		it('should push value into end of existing property', () => {
			const result = $store._add('push', storeDouble, observeDouble, 'prop', 5, false);

			expect(result).to.deep.equal([1, 2, 5]);
		});

		it('should push value into end of existing property', () => {
			const result = $store._add('push', storeDouble, observeDouble, 'prop', 5, true);

			expect(result).to.deep.equal([5, 1, 2]);
		});

		it('should push/concatenate value onto $ if no key provided', () => {
			storeDouble.$ = {};
			const result = $store._add('push', storeDouble, observeDouble, 5, true);

			expect(result).to.deep.equal([5]);
		});
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

	describe('has', () => {
		it('check if property is set', () => {
			$store.set('propExists', true);
			$store.set('undefinedProp', undefined);

			expect($store.has('propExists')).to.be.true;
			expect($store.has('unknownProp')).to.be.false;
			expect($store.has('undefinedProp')).to.be.false;
		});
	});

	describe('push', () => {
		it('should push or prepend value to property', () => {
			$store.set('prop', [1, 2]);
			const result = $store.push('prop', 3);

			expect(result).to.deep.equal([1, 2, 3]);

			const result2 = $store.push('prop', 0, true);
			expect(result2).to.deep.equal([0, 1, 2, 3]);
		});
	});

	describe('concat', () => {
		it('should concatenate array to existing array property', () => {
			$store.set('prop', [1, 2]);
			const result = $store.concat('prop', [3, 4]);

			expect(result).to.deep.equal([1, 2, 3, 4]);

			const result2 = $store.concat('prop', [-1, 0], true);
			expect(result2).to.deep.equal([-1, 0, 1, 2, 3, 4]);
		});
	});

	describe('merge', () => {
		it('should merge value into existing property, creating new object reference', () => {
			let orig = { name: 'Donald Draper' }
			$store.set('prop', orig);
			const result = $store.merge('prop', { age: 35 });

			expect(result).to.deep.equal({
				name: 'Donald Draper',
				age: 35
			});
			expect(orig).to.deep.equal({ name: 'Donald Draper' });
		});
	});

	describe('drop', () => {
		it('should delete top level property from store', () => {
			$store.set('prop', true);
			$store.drop('prop');

			expect($store.get('prop')).to.be.null;
		});

		it('should delete by index if root is array', () => {
			$store.set(['one', 'two', 'three']);
			$store.drop(1); // Array index

			expect($store.get()).to.deep.equal(['one', 'three']);
		});
	});
});