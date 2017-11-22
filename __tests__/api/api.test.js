import { api as subject } from 'active-redux';
import * as ActionTypes from 'active-redux/api/constants';
import { createAction } from 'active-redux/api/utils';
import mockStore from 'fixtures/store';

describe('reducer', () => {
  const person = {
    type: 'people',
    id: 5,
    attributes: {
      hair: 'black',
      age: 25,
    }
  };

  const fullStore = {
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
    }
  };

  describe('initialState', () => {
    it('has an empty resources object', () => {
      expect(subject.reducer(undefined, {})).toMatchSnapshot();
    });
  });

  describe('actions', () => {
    const reduce = subject.reducer;

    describe('apiConfigure()', () => {
      it('updates the apiConfig key', () => {
        const state = reduce(undefined, subject.apiConfigure({ baseUrl: 'http://coverhound.com/api' }));
        expect(state).toMatchSnapshot();
      });
    });


    describe('apiHydrate()', () => {
      it('populates the state with resources', () => {
        const state = reduce(undefined, subject.apiHydrate({ data: person }));
        expect(state).toMatchSnapshot();
      });
    });

    describe('apiCreate()', () => {
      let state = fullStore;
      const apiWillCreate = createAction(ActionTypes.API_WILL_CREATE);
      const apiCreateDone = createAction(ActionTypes.API_CREATE_DONE);

      it('increments isCreating', () => {
        state = reduce(undefined, apiWillCreate({ data: person }));
        expect(state).toMatchSnapshot();
      });

      it('populates the state with resources', () => {
        state = reduce(state, apiCreateDone({ data: person }));
        expect(state).toMatchSnapshot();
      });
    });

    describe('apiRead()', () => {
      let state = fullStore;
      const apiWillRead = createAction(ActionTypes.API_WILL_READ);
      const apiReadDone = createAction(ActionTypes.API_READ_DONE);

      it('increments isReading', () => {
        state = reduce(undefined, apiWillRead({ data: person }));
        expect(state).toMatchSnapshot();
      });

      it('populates the state with resources', () => {
        state = reduce(state, apiReadDone({ data: person }));
        expect(state).toMatchSnapshot();
      });
    });

    describe('apiClear()', () => {
      it('clears the resource', () => {
        const state = reduce(fullStore, subject.apiClear(person.type));
        expect(state).toMatchSnapshot();
      });
    });

    describe('apiUpdate()', () => {
      let state = fullStore;
      const apiWillUpdate = createAction(ActionTypes.API_WILL_UPDATE);
      const apiUpdateDone = createAction(ActionTypes.API_UPDATE_DONE);

      it('increments isUpdating and marks the resource as pending', () => {
        state = reduce(state, apiWillUpdate({ data: person }));
        expect(state).toMatchSnapshot();
      });

      it('updates the state with resources', () => {
        state = reduce(state, apiUpdateDone({ data: person }));
        expect(state).toMatchSnapshot();
      });
    });

    describe('apiDelete()', () => {
      let state = fullStore;
      const apiWillDelete = createAction(ActionTypes.API_WILL_DELETE);
      const apiDeleteDone = createAction(ActionTypes.API_DELETE_DONE);

      it('increments isDeleting and marks the resource as pending', () => {
        state = reduce(state, apiWillDelete({ data: person }));
        expect(state).toMatchSnapshot();
      });

      it('removes the resources from the store', () => {
        state = reduce(state, apiDeleteDone({ data: person }));
        expect(state).toMatchSnapshot();
      });
    });

    describe('apiIndexClear()', () => {
      const hash = 'people.id=5,10';
      let state = {
        ...fullStore,
        indices: {
          [hash]: [{ id: person.id, type: person.type }],
        },
      };

      it('clears the index', async () => {
        state = reduce(state, subject.apiIndexClear(hash));
        expect(state.indices).toMatchSnapshot();
      });
    });

    describe('apiIndexSync()', () => {
      const hash = 'people.id=5,10';
      const store = mockStore;
      const { dispatch, getState } = store;
      const resources = { data: person };

      it('creates the index', () => {
        dispatch(subject.apiIndexSync({ hash, resources }));
        const state = getState().api.indices;
        expect(state).toMatchSnapshot();
      });
    });

    describe('apiIndexAsync()', () => {
      const hash = 'people.id=5,10';
      const store = mockStore;
      const { dispatch, getState } = store;

      beforeEach(() => {
        dispatch(subject.apiIndexClear(hash));
      });

      it('creates the index when the promise resolves', async () => {
        const promise = Promise.resolve({ data: person });
        await dispatch(subject.apiIndexAsync({ hash, promise }));
        const state = getState().api.indices;
        expect(state).toMatchSnapshot();
      });

      it('creates the index when the promise is rejected', async () => {
        const promise = Promise.reject({ data: person });
        try {
          await mockStore.dispatch(subject.apiIndexAsync({ hash, promise }));
        } catch (e) {
          // nothing
        }
        const state = mockStore.getState().api.indices;
        expect(state).toMatchSnapshot();
      });
    });
  });
});
