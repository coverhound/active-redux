import Store from 'active-redux/store';
import createMockStore from 'fixtures/store';

describe('Store', () => {
  const mockStore = createMockStore();
  Store.bind(mockStore);

  describe('#store', () => {
    test('is the bound store', () => {
      expect(Store.store).toBe(mockStore);
    });
  });

  describe('#dispatch', () => {
    test('provides a getter for store dispatch', () => {
      expect(Store.dispatch).toBe(mockStore.dispatch);
    });
  });

  describe('#state', () => {
    test('provides a getter for store dispatch', () => {
      expect(Store.state).toBe(mockStore.getState().api.resources);
    });
  });
});
