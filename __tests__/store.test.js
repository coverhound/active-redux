import AR from 'active-redux';
import Store from 'active-redux/store';
import mockStore from 'fixtures/store';

describe('Store', () => {
  beforeEach(() => {
    AR.bind(mockStore);
  });

  const Comment = AR.define('comments', class Comment {});
  const Person = AR.define('people', class Person {});

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
      expect(Store.state).toBe(mockStore.getState().api);
    });
  });

  describe('#all', () => {
    test('should return all values from a resource store', async () => {
      const response = await Store.all({ model: Comment });
      expect(response).toMatchSnapshot();
    });
  });

  describe('#find', () => {
    test('should find an entity in store by id', async () => {
      const response = await Store.find({ id: 5 }, { model: Comment });
      expect(response.body).toMatchSnapshot();
    });

    test('should find an entity in by query', async () => {
      const response = await Store.find({ attributes: { body: 'First!' } }, { model: Comment });
      expect(response).toMatchSnapshot();
    });
  });

  describe('#where', () => {
    test('should return an array of values matching a query', async () => {
      const response = await Store.where({ attributes: { body: 'First!' } }, { model: Comment });
      expect(response).toMatchSnapshot();
    });

    test('should allow arrays as lookup value', async () => {
      const response = await Store.where({ id: ['5', '12'] }, { model: Comment });
      expect(response).toMatchSnapshot();
    });

    test('should search for nested properties', async () => {
      const response = await Store.where({ attributes: {
        address: { road: '123 Main St' }
      } }, { model: Person });
      expect(response).toMatchSnapshot();
    });
  });
});
