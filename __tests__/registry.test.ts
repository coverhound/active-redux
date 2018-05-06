import Registry from 'active-redux/registry';

describe('Registry', () => {
  describe('.register()', () => {
    test('registers the class by its type', () => {
      class Test { static type = 'test'; }
      Registry.register(Test);
      expect(Registry.get('test')).toBe(Test);
    });
  });
});
