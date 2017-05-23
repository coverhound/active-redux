import * as utils from 'active-redux/redux/utils';

describe('Utils', () => {
  const person = { type: 'people', id: 1, attributes: {} };
  const post = { type: 'posts', id: 1, attributes: {} };

  describe('incrementProperty()', () => {
    test('increments the property', () => {
      const state = { isReading: 0 };
      const expected = { isReading: 1 };
      expect(utils.incrementProperty(state, 'isReading')).toEqual(expected);
    });

    test('doesn\'t mutate the original object', () => {
      const state = { isReading: 0 };
      utils.incrementProperty(state, 'isReading');
      expect(state.isReading).toEqual(0);
    });
  });

  describe('decrementProperty()', () => {
    test('decrements the property', () => {
      const state = { isReading: 1 };
      const expected = { isReading: 0 };
      expect(utils.decrementProperty(state, 'isReading')).toEqual(expected);
    });

    test('doesn\'t mutate the original object', () => {
      const state = { isReading: 0 };
      utils.decrementProperty(state, 'isReading');
      expect(state.isReading).toEqual(0);
    });
  });

  describe('mergeResources()', () => {
    test('adds singular resources', () => {
      const resources = { data: person };
      const expected = { [person.type]: { [person.id]: person } };
      expect(utils.mergeResources({}, resources)).toEqual(expected);
    });

    test('adds multiple resources', () => {
      const resources = { data: [person, post] };
      const expected = {
        [person.type]: { [person.id]: person },
        [post.type]: { [post.id]: post }
      };
      expect(utils.mergeResources({}, resources)).toEqual(expected);
    });

    test('adds included resources', () => {
      const resources = { data: [person], included: [post] };
      const expected = {
        [person.type]: { [person.id]: person },
        [post.type]: { [post.id]: post }
      };
      expect(utils.mergeResources({}, resources)).toEqual(expected);
    });

    test('doesn\'t mutate the original object', () => {
      const state = { [person.type]: 'foo' };
      const resources = { data: person };
      utils.mergeResources(state, resources);
      expect(state).toEqual({ [person.type]: 'foo' });
    });
  });

  describe('clearResources()', () => {
    const oldState = {
      resources: {
        [person.type]: { [person.id]: person },
        [post.type]: { [post.id]: post },
      }
    };

    describe('given a resource', () => {
      test('it clears the resource', () => {
        const expected = {
          resources: {
            [person.type]: {},
            [post.type]: { [post.id]: post }
          }
        };
        expect(utils.clearResources(oldState, person)).toEqual(expected);
      });
    });

    describe('given an array of resources', () => {
      test('it clears the resources', () => {
        const expected = {
          resources: {
            [person.type]: {},
            [post.type]: {}
          }
        };
        expect(utils.clearResources(oldState, [person, post])).toEqual(expected);
      });
    });

    describe('given a resource type', () => {
      test('it clears the resource type', () => {
        const expected = {
          resources: {
            [person.type]: {},
            [post.type]: { [post.id]: post }
          }
        };
        expect(utils.clearResources(oldState, person.type)).toEqual(expected);
      });
    });

    describe('given no second argument', () => {
      test('it clears all resources', () => {
        const expected = { resources: {} };
        expect(utils.clearResources(oldState)).toEqual(expected);
      });
    });

    describe('doesn\'t mutate the original state', () => {
      const state = {
        resources: { [post.type]: { [post.id]: post } }
      };
      const expected = JSON.parse(JSON.stringify(state));
      utils.clearResources(state);
      expect(state).toEqual(expected);
    });
  });

  describe('createAction()', () => {
    test('creates a Redux action', () => {
      const expected = { type: 'FOO', payload: 'BAR' };
      const action = utils.createAction(expected.type);
      expect(action(expected.payload)).toEqual(expected);
    });
  });

  describe('createReducer()', () => {
    const initialState = { foo: 'bar' };
    const type = 'FOO';

    describe('given an unmapped action', () => {
      test('returns the state', () => {
        const reducer = utils.createReducer({}, {});
        expect(reducer(initialState, { type })).toEqual(initialState);
      });
    });

    describe('given a mapped action', () => {
      test('calls that action', () => {
        const reducer = utils.createReducer({
          [type]: (state, { payload }) => ({
            foo: state.foo + payload
          })
        }, {});
        expect(reducer(initialState, { type, payload: 'baz' })).toEqual({
          foo: 'barbaz'
        });
      });
    });

    describe('when the state is undefined', () => {
      test('returns the initial state', () => {
        const reducer = utils.createReducer({}, initialState);
        expect(reducer(undefined, { type: 'FOO' })).toEqual(initialState);
      });
    });
  });

  describe('markPendingResources()', () => {
    const state = { resources: { people: {
      1: {},
      2: {},
      3: {},
    } } };

    test('marks a single resouurce', () => {
      const resource = { data: { type: 'people', id: 1 } };
      const expected = { resources: { people: {
        1: { isPending: true },
        2: {},
        3: {}
      } } };
      expect(utils.markPendingResources(state, resource)).toEqual(expected);
    });

    test('marks multiple resouurces', () => {
      const resources = { data: [
        { type: 'people', id: 1 },
        { type: 'people', id: 3 }
      ] };
      const expected = { resources: { people: {
        1: { isPending: true },
        2: {},
        3: { isPending: true }
      } } };
      expect(utils.markPendingResources(state, resources)).toEqual(expected);
    });

    test('doesn\'t mutate the original object', () => {
      const resource = { data: { type: 'people', id: 1 } };
      const expected = JSON.parse(JSON.stringify(state));
      utils.markPendingResources(state, resource);
      expect(state).toEqual(expected);
    });
  });
});
