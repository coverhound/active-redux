import Store from '../src/model/store';
import mockStore from './fixtures/store';

describe('Store', () => {
  beforeAll(() => {
    mockStore.dispatch = () => {};
    Store.store = mockStore;
  });

  describe('#dispatch', () => {
    test('provides a getter for store dispatch', () => {
      expect(Store.dispatch).toBeInstanceOf(Function);
    });
  });

  describe('#findById', () => {
    test('should find an entity in store by id', () => {
      const response = Store.findById(5, 'comments');
      expect(response).toEqual(mockStore.comments[5]);
    });
  });

  describe('#findAll', () => {
    test('should return all values from a resource store', () => {
      const response = Store.findAll('comments');
      expect(response).toEqual(Object.values(mockStore.comments));
    });
  });

  describe('#find', () => {
    test('should return an array of values matching query', () => {
      const response = Store.find({
        attributes: {
          body: 'First!',
        },
      }, 'comments');
      expect(response).toEqual([mockStore.comments[5]]);
    });

    test('should allow arrays as lookup value', () => {
      const response = Store.find({
        id: ['5', '12'],
      }, 'comments');
      expect(response).toEqual(Object.values(mockStore.comments));
    });

    test('should search for nested properties', () => {
      const response = Store.find({
        attributes: {
          address: {
            road: '123 Main St'
          }
        }
      }, 'people');

      expect(response).toEqual([mockStore.people[9]]);
    });
  });
});
