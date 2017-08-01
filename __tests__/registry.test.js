import Registry from 'active-redux/registry';

describe('Registry', () => {
  describe('.register()', () => {
    const store = 'store1';

    test('registers the class by its name', () => {
      class Test { static type = 'test'; }
      Registry.register(Test);
      expect(Registry.get('test')).toBe(Test);
    });

    test('sets the store on the class\'s context', () => {
      class Test2 { static type = 'test2'; }
      Registry.store = store;
      Registry.register(Test2);
      expect(Registry.get('test2').context.store).toEqual(store);
    });
  });

  describe('.store=', () => {
    const store = 'store2';

    test('sets the store on the Registry', () => {
      Registry.store = store;
      expect(Registry.store).toEqual(store);
    });

    test('sets the store on registered models\' context', () => {
      Registry.store = store;
      expect(Registry.store).toEqual(store);
      expect(Registry.get('test').context.store).toEqual(store);
    });
  });
});
