import * as subject from 'active-redux/api';
import * as ActionTypes from 'active-redux/api/constants';
import { createAction } from 'active-redux/api/utils';

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
  });
});
