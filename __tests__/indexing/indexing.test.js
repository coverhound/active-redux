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

  describe('apiIndexClear()', () => {
    const hash = 'people.id=5,10';

    it('clears the index', () => {
      store.dispatch(subject.apiIndexClear(hash));
      expect(store.getState().api.indices).toMatchSnapshot();
    });
  });

  describe('apiIndexSync()', () => {
    const hash = 'people.id=5,10';

    it('creates the index', () => {
      store.dispatch(subject.apiIndexSync({ hash, resources: person }));
      expect(store.getState().api.indices).toMatchSnapshot();
    });
  });

  describe('apiIndexAsync()', () => {
    const hash = 'people.id=5,10';

    beforeEach(() => {
      store.dispatch(subject.apiIndexClear(hash));
    });

    it('creates the index when the promise resolves', async () => {
      const promise = Promise.resolve(person);
      await store.dispatch(subject.apiIndexAsync({ hash, promise }));
      expect(store.getState().api.indices).toMatchSnapshot();
    });

    it('creates the index when the promise is rejected', async () => {
      const promise = Promise.reject(person);
      try {
        await store.dispatch(subject.apiIndexAsync({ hash, promise }));
      } catch (e) {
        // nothing
      }
      const state = store.getState().api.indices;
      expect(state).toMatchSnapshot();
    });
  });
});
