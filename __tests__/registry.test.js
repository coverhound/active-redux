import Registry from '../src/registry';

describe('Registry', () => {
  describe('.register()', () => {
    const store = 'store1';

    test('registers the class by its name', () => {
      class Test {}
      Registry.register(Test);
      expect(Registry.get('Test')).toBe(Test);
    });

    test('sets the store on the class', () => {
      class Test2 {}
      Registry.setStore(store);
      Registry.register(Test2);
      expect(Registry.get('Test2').store).toEqual(store);
    });
  });

  describe('.setStore()', () => {
    const store = 'store2';

    test('sets the store on the Registry', () => {
      Registry.setStore(store);
      expect(Registry.store).toEqual(store);
    });

    test('sets the store on registered models', () => {
      Registry.setStore(store);
      expect(Registry.store).toEqual(store);
      expect(Registry.get('Test').store).toEqual(store);
    });
  });
});
