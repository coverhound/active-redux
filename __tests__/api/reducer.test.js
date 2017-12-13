import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import * as subject from 'active-redux/api/reducer';
import createMockStore from 'helpers/create-mock-store';

describe('reducer', () => {
  const person = {
    type: 'people',
    id: 5,
    attributes: {
      hair: 'black',
      age: 25,
    }
  };

  let store;
  const resource = { endpoint: () => 'people', data: person };

  const fullStore = {
    api: {
      apiConfig: {},
      indices: {},
      isCreating: 0,
      isDeleting: 0,
      isReading: 0,
      isUpdating: 0,
      resources: {
        [person.type]: {
          [person.id]: { attributes: { name: 'Johnny' } },
          2: { attributes: { name: 'Yangster' } }
        }
      },
    },
  };

  beforeEach(() => {
    store = createMockStore();
  });

  describe('initialState', () => {
    it('has an empty resources object', () => {
      expect(store.getState().api).toMatchSnapshot();
    });
  });

  describe('apiConfigure()', () => {
    it('updates the apiConfig key', () => {
      store.dispatch(subject.apiConfigure({ baseUrl: 'http://coverhound.com/api' }));
      expect(store.getState().api).toMatchSnapshot();
    });
  });


  describe('apiHydrate()', () => {
    it('populates the state with resources', () => {
      store.dispatch(subject.apiHydrate(resource));
      expect(store.getState().api).toMatchSnapshot();
    });
  });

  describe('apiClear()', () => {
    beforeEach(() => {
      store = createMockStore(fullStore);
    });

    it('clears the resource', () => {
      store.dispatch(subject.apiClear(person.type));
      expect(store.getState().api).toMatchSnapshot();
    });
  });

  describe('HTTP', () => {
    const httpHeaders = { 'content-type': 'application/json' };
    const mockAxios = new MockAdapter(axios);
    const blankPromise = new Promise(() => {});

    describe('apiCreate()', () => {
      it('increments isCreating', () => {
        mockAxios.onPost('/people').replyOnce(() => blankPromise);

        store.dispatch(subject.apiCreate({ resource }));
        expect(store.getState().api).toMatchSnapshot();
      });

      it('populates the state with resources', () => {
        mockAxios.onPost('/people').replyOnce(201, { data: person }, httpHeaders);

        return store.dispatch(subject.apiCreate({ resource })).then(() => {
          expect(store.getState().api).toMatchSnapshot();
        });
      });
    });

    describe('apiRead()', () => {
      it('increments isReading', () => {
        mockAxios.onGet('/people').replyOnce(() => blankPromise);

        store.dispatch(subject.apiRead({ resource }));
        expect(store.getState().api).toMatchSnapshot();
      });

      it('populates the state with resources', () => {
        mockAxios.onGet('/people').replyOnce(200, { data: person }, httpHeaders);

        return store.dispatch(subject.apiRead({ resource })).then(() => {
          expect(store.getState().api).toMatchSnapshot();
        });
      });
    });

    describe('apiUpdate()', () => {
      it('increments isUpdating and marks the resource as pending', () => {
        mockAxios.onPatch('/people').replyOnce(() => blankPromise);

        store.dispatch(subject.apiUpdate({ resource }));
        expect(store.getState().api).toMatchSnapshot();
      });

      it('updates the state with resources', () => {
        mockAxios.onPatch('/people').replyOnce(200, { data: person }, httpHeaders);

        return store.dispatch(subject.apiUpdate({ resource })).then(() => {
          expect(store.getState().api).toMatchSnapshot();
        });
      });
    });

    describe('apiDelete()', () => {
      beforeEach(() => {
        store = createMockStore(fullStore);
      });

      it('increments isDeleting and marks the resource as pending', () => {
        mockAxios.onDelete('/people').replyOnce(() => blankPromise);

        store.dispatch(subject.apiDelete({ resource }));
        expect(store.getState().api).toMatchSnapshot();
      });

      it('removes the resources from the store', () => {
        mockAxios.onDelete('/people').replyOnce(200, { data: person }, httpHeaders);

        return store.dispatch(subject.apiDelete({ resource })).then(() => {
          expect(store.getState().api).toMatchSnapshot();
        });
      });
    });
  });
});
