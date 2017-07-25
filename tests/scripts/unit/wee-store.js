import $store from 'wee-store';
import sinon from 'sinon';
import { Store } from 'wee-store';
import StoreError from 'store/error';

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

	it('should have name property of "default"', () => {
		expect($store.name).to.equal('default');
	});

	it('should retrieve pre-existing data from local/session storage', () => {
		const store = {
			$: {
				exists: true
			}
		};
		window.localStorage.setItem('wee_instance', JSON.stringify(store))

		let $instance = new Store('instance', {
			browserStorage: 'local'
		});

		expect($instance.store).to.deep.equal(store);

		// Cleanup
		window.localStorage.removeItem('wee_instance');
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

		it('should save data in local storage', () => {
			$store.browserStore = $store.localStorage;
			$store._set(storeDouble, observeDouble, 'prop', true);

			$store.browserStore = null;

			expect(JSON.parse(window.localStorage.getItem('wee_default'))).to.deep.equal({
				$: {
					prop: true
				}
			});

			// Cleanup
			window.localStorage.removeItem('wee_default');
		});

		it('should save data in session storage', () => {
			$store.browserStore = $store.sessionStorage;
			$store._set(storeDouble, observeDouble, 'prop', true);

			$store.browserStore = null;

			expect(JSON.parse(window.sessionStorage.getItem('wee_default'))).to.deep.equal({
				$: {
					prop: true
				}
			});

			window.sessionStorage.removeItem('wee_default');
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

	describe('_setBrowserStorage', () => {
		it('should set designated browser storage and sync data from store', () => {
			$store.set('existing', true);
			$store._setBrowserStorage('session');

			// Make sure pre-existing store data is in session storage now
			expect(JSON.parse(window.sessionStorage.getItem('wee_default'))).to.deep.equal({
				$: {
					existing: true
				}
			});

			// Make sure that new properties are being set
			$store.set('newProp', true);
			expect(JSON.parse(window.sessionStorage.getItem('wee_default'))).to.deep.equal({
				$: {
					existing: true,
					newProp: true
				}
			});

			window.sessionStorage.removeItem('wee_default');
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

	describe('getStore', () => {
		it('should retrieve storage object', () => {
			expect($store.getStore()).to.deep.equal({ $: {} });
		});

		it('should retrieve storage object from session/local storage', () => {
			const origLocalStorage = $store.localStorage;
			let state = false;

			// Set proper conditions for retrieving from browser storage
			$store.keepInMemory = false;
			$store.localStorage.getItem = function(fn) {
				state = true;
				return null;
			};
			$store.browserStore = $store.localStorage;
			$store.getStore();

			// Cleanup
			$store.browserStore = null;
			$store.keepInMemory = true;
			$store.localStorage = origLocalStorage;

			expect(state).to.be.true;
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

	describe('create', () => {
		it('should create a new instance of Store', () => {
			const $new = $store.create('newStore');

			expect($new).to.be.instanceof(Store);
			expect($new.name).to.equal('newStore');
		});

		it('should throw error if no name is provided', () => {
			expect($store.create).to.throw();
			expect($store.create).to.throw('No name');
		});

		it('should return existing instance instead of re-creating', () => {
			const $instance = $store.create('instance');

			$instance.set('prop', true);

			expect($store.create('instance').get('prop')).to.be.true;

			$instance.destroy();
		});
	});

	describe('setVar', () => {
		before(() => {
			document.body.innerHTML = `<meta data-set="global" data-value="true">
					<meta data-set="list[]" data-value="1">
					<meta data-set="list[]" data-value="2">
					<meta data-set="list[]" data-value="3">
					
					<meta data-set="object.propA" data-value='{"innerA":1}'>
					<meta data-set="object.propA.innerB" data-value="2">
					<meta data-set="object.propB" data-value="1">
					<meta data-set="object2.propA.dynamicInner" data-value="true">
					<meta data-set="object2.propB" data-value="1">
					
					<meta data-store="instance" data-set="instanceProp" data-value="cool">`;
		});

		it('should set properties from DOM', () => {
			$store.setVar();

			expect($store.get('global')).to.be.true;
		});

		it('should build array from multiple element attributes', () => {
			$store.setVar();

			expect($store.get('list')).to.deep.equal([1, 2, 3]);
		});

		it('should build object from multiple element attributes', () => {
			$store.setVar();

			expect($store.get('object')).to.deep.equal({
				propA: {
					innerA: 1, // Parsed from JSON value
					innerB: 2
				},
				propB: 1
			});
			expect($store.get('object2')).to.deep.equal({
				propA: {
					dynamicInner: true // This property was set on object that did not exist yet
				},
				propB: 1
			});
		});

		it('should set values only intended for specific instance', () => {
			let $instance = $store.create('instance');

			$instance.setVar();

			expect($instance.get()).to.deep.equal({
				instanceProp: 'cool'
			});

			$instance.destroy();
		});
	});

	describe('destroy', () => {
		it('should remove reference to store instance', () => {
			let instance = $store.create('instance');

			expect($store.create('instance')).to.equal(instance);

			instance.destroy();

			expect($store.create('instance')).to.not.equal(instance);
		});
	});

	describe('configure', () => {
		it('should set browserStorage', () => {
			$store.configure({ browserStorage: 'local' });

			expect($store.browserStore).to.equal($store.localStorage);
		});

		it('should set keepInMemory', () => {
			$store.configure({ keepInMemory: false });

			expect($store.keepInMemory).to.be.true;

			$store.keepInMemory = false;
		});
	});
});