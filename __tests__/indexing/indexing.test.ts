import * as subject from 'active-redux/indexing/reducer';
import createMockStore from 'helpers/create-mock-store';

describe('reducer', () => {
  let store;
  const person = {
    type: 'people',
    id: 5,
    attributes: {
      hair: 'black',
      age: 25,
    }
  };

  beforeEach(() => {
    store = createMockStore();
  });

  const toArray = (arr) => {
    const newArr = [];
    arr.forEach((e, index) => { newArr[index] = e; });
    return newArr;
  };
  const indexedPeople = [{ id: person.id, type: person.type }];
  const hash = 'people.id=5,10';
  const indexState = () => store.getState().api.indices[hash];

  describe('apiIndexClear()', () => {
    it('clears the index', () => {
      store.dispatch(subject.apiIndexClear(hash));
      const index = indexState();

      expect(toArray(index)).toEqual([]);
      expect(index.isFetching).toBe(false);
      expect(index.hash).toBe(hash);
    });
  });

  describe('apiIndexSync()', () => {
    it('creates the index', () => {
      store.dispatch(subject.apiIndexSync({ hash, data: person }));
      const index = indexState();

      expect(toArray(index)).toEqual(indexedPeople);
      expect(index.isFetching).toBe(false);
      expect(index.hash).toBe(hash);
    });
  });

  describe('apiIndexAsync()', () => {
    beforeEach(() => {
      store.dispatch(subject.apiIndexClear(hash));
    });

    it('is fetching while waiting for the promise to resolve', () => {
      const promise = new Promise(() => {});
      store.dispatch(subject.apiIndexAsync({ hash, promise }));
      const index = indexState();

      expect(toArray(index)).toEqual([]);
      expect(index.isFetching).toBe(true);
      expect(index.hash).toBe(hash);
    });

    it('creates the index when the promise resolves', async () => {
      const promise = Promise.resolve(person);
      await store.dispatch(subject.apiIndexAsync({ hash, promise }));
      const index = indexState();

      expect(toArray(index)).toEqual(indexedPeople);
      expect(index.isFetching).toBe(false);
      expect(index.hash).toBe(hash);
    });

    it('creates the index when the promise is rejected', async () => {
      const promise = Promise.reject(person);
      try {
        await store.dispatch(subject.apiIndexAsync({ hash, promise }));
      } catch (e) {
        // nothing
      }
      const index = indexState();

      expect(toArray(index)).toEqual([]);
      expect(index.isFetching).toBe(false);
      expect(index.hash).toBe(hash);
    });
  });
});
