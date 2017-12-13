jest.mock('active-redux/registry', () => ({
  people: {
    relationships: {
      comments: { key: 'comments', isArray: true }
    }
  },
  comments: {
    relationships: {
      people: { key: 'author', isArray: false }
    }
  },
  get(type) {
    return this[type];
  }
}));
import * as utils from 'active-redux/api/utils';
import jsonApiData from 'fixtures/json-api-body';
import imm from 'object-path-immutable';

const [person, ...comments] = jsonApiData.included;
const comment = comments[0];

describe('Utils', () => {
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

  describe('createReverseRelationships()', () => {
    const state = {
      resources: {
        people: {
          9: {
            relationships: {
              comments: {
                data: [
                  { id: '12', type: 'comments' }
                ]
              }
            }
          }
        },
        comments: {
          5: {},
          12: {}
        },
      }
    };

    test('updates hasMany relationships', () => {
      const newState = imm(state);
      utils.createReverseRelationships(state, newState, comments[0]);
      const subject = newState.value().resources.people;

      const expectedData = [{ id: '12', type: 'comments' }, { id: '5', type: 'comments' }];
      expect(subject['9'].relationships.comments.data).toEqual(expectedData);
      expect(subject['9'].relationships).toMatchSnapshot();
    });

    test('updates hasOne relationships', () => {
      const newState = imm(state);
      utils.createReverseRelationships(state, newState, person);
      const subject = newState.value().resources.comments;

      const expectedData = { id: '9', type: 'people' };
      [subject['5'], subject['12']].forEach((model) => {
        expect(model.relationships.author.data).toEqual(expectedData);
      });
    });
  });

  describe('mergeResources()', () => {
    test('adds singular resources', () => {
      const resources = { data: person };
      expect(utils.mergeResources({}, resources)).toMatchSnapshot();
    });

    test('adds multiple resources', () => {
      const resources = { data: [person, comments[0]] };
      expect(utils.mergeResources({}, resources)).toMatchSnapshot();
    });

    test('adds included resources', () => {
      const resources = { data: [person], included: [comments[0]] };
      expect(utils.mergeResources({}, resources)).toMatchSnapshot();
    });

    test('doesn\'t mutate the original object', () => {
      const state = { resources: { [person.type]: 'foo' } };
      const resources = { data: person };
      utils.mergeResources(state, resources);
      expect(state).toEqual({ resources: { [person.type]: 'foo' } });
    });
  });

  describe('clearResources()', () => {
    const oldState = {
      resources: {
        [person.type]: { [person.id]: person },
        [comment.type]: { [comment.id]: comment },
      }
    };

    describe('given a resource', () => {
      test('it clears the resource', () => {
        const expected = {
          resources: {
            [person.type]: {},
            [comment.type]: { [comment.id]: comment }
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
            [comment.type]: {}
          }
        };
        expect(utils.clearResources(oldState, [person, comment])).toEqual(expected);
      });
    });

    describe('given a resource type', () => {
      test('it clears the resource type', () => {
        const expected = {
          resources: {
            [person.type]: {},
            [comment.type]: { [comment.id]: comment }
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
        resources: { [comment.type]: { [comment.id]: comment } }
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
        const reducer = utils.createReducer({ map: {}, initialState: {} });
        expect(reducer(initialState, { type })).toEqual(initialState);
      });
    });

    describe('given a mapped action', () => {
      test('calls that action', () => {
        const reducer = utils.createReducer({
          map: {
            [type]: (state, { payload }) => ({
              foo: state.foo + payload
            })
          },
          initialState: {},
        });
        expect(reducer(initialState, { type, payload: 'baz' })).toEqual({
          foo: 'barbaz'
        });
      });
    });

    describe('when the state is undefined', () => {
      test('returns the initial state', () => {
        const reducer = utils.createReducer({ map: {}, initialState });
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
