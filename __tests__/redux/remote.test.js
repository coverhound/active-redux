import * as subject from 'active-redux/redux/remote';
import * as ActionTypes from 'active-redux/redux/remote/constants';
import { createAction } from 'active-redux/redux/utils';

describe('remoteReducer', () => {
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
      expect(subject.remoteReducer(undefined, {})).toMatchSnapshot();
    });
  });

  describe('actions', () => {
    const reduce = subject.remoteReducer;

    describe('apiConfigure()', () => {
      it('updates the apiConfig key', () => {
        const state = reduce(undefined, subject.apiConfigure({ baseUrl: 'http://coverhound.com/api' }));
        expect(state).toMatchSnapshot();
      });
    });


    describe('remoteHydrate()', () => {
      it('populates the state with resources', () => {
        const state = reduce(undefined, subject.remoteHydrate({ data: person }));
        expect(state).toMatchSnapshot();
      });
    });

    describe('remoteCreate()', () => {
      let state = fullStore;
      const remoteWillCreate = createAction(ActionTypes.REMOTE_WILL_CREATE);
      const remoteCreateDone = createAction(ActionTypes.REMOTE_CREATE_DONE);

      it('increments isCreating', () => {
        state = reduce(undefined, remoteWillCreate({ data: person }));
        expect(state).toMatchSnapshot();
      });

      it('populates the state with resources', () => {
        state = reduce(state, remoteCreateDone({ data: person }));
        expect(state).toMatchSnapshot();
      });
    });

    describe('remoteRead()', () => {
      let state = fullStore;
      const remoteWillRead = createAction(ActionTypes.REMOTE_WILL_READ);
      const remoteReadDone = createAction(ActionTypes.REMOTE_READ_DONE);

      it('increments isReading', () => {
        state = reduce(undefined, remoteWillRead({ data: person }));
        expect(state).toMatchSnapshot();
      });

      it('populates the state with resources', () => {
        state = reduce(state, remoteReadDone({ data: person }));
        expect(state).toMatchSnapshot();
      });
    });

    describe('remoteClear()', () => {
      it('clears the resource', () => {
        const state = reduce(fullStore, subject.remoteClear(person.type));
        expect(state).toMatchSnapshot();
      });
    });

    describe('remoteUpdate()', () => {
      let state = fullStore;
      const remoteWillUpdate = createAction(ActionTypes.REMOTE_WILL_UPDATE);
      const remoteUpdateDone = createAction(ActionTypes.REMOTE_UPDATE_DONE);

      it('increments isUpdating and marks the resource as pending', () => {
        state = reduce(state, remoteWillUpdate({ data: person }));
        expect(state).toMatchSnapshot();
      });

      it('updates the state with resources', () => {
        state = reduce(state, remoteUpdateDone({ data: person }));
        expect(state).toMatchSnapshot();
      });
    });

    describe('remoteDelete()', () => {
      let state = fullStore;
      const remoteWillDelete = createAction(ActionTypes.REMOTE_WILL_DELETE);
      const remoteDeleteDone = createAction(ActionTypes.REMOTE_DELETE_DONE);

      it('increments isDeleting and marks the resource as pending', () => {
        state = reduce(state, remoteWillDelete({ data: person }));
        expect(state).toMatchSnapshot();
      });

      it('removes the resources from the store', () => {
        state = reduce(state, remoteDeleteDone({ data: person }));
        expect(state).toMatchSnapshot();
      });
    });
  });
});
