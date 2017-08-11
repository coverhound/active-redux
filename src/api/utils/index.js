import 'babel-polyfill';
import imm from 'object-path-immutable';
import Registry from '../../registry';

export apiClient from './api-client';

/**
 * @module
 * @private
 */

/**
 * @example
 * incrementProperty(state, 'isReading')
 * @param {Object} state Object on which the key is incremented
 * @param {string} key Key to increment
 */
export const incrementProperty = (state, key) => (
  imm.set(state, key, state[key] + 1)
);

/**
 * @example
 * decrementProperty(state, 'isReading')
 * @param {Object} state Object on which the key is decremented
 * @param {string} key Key to decrement
 */
export const decrementProperty = (state, key) => (
  imm.set(state, key, state[key] - 1)
);

/**
 * @param {Array|Object} data
 */
export const resourcesArray = (data = []) => (
  Array.isArray(data) ? data : [data]
);

/**
 * @example
 * const obj = { foo: bar: { baz: 'hi' } }
 * getProperty(obj, 'foo', 'bar', 'baz') // => 'hi'
 * getProperty(obj, 'a', 'b', 'c') // => undefined
 *
 * @param {Object} object Object to traverse
 * @param {String[]} keys Keys to look up
 */
export const getProperty = (object, ...keys) => (
  keys.reduce((acc, key) => {
    if (acc === undefined) return acc;
    return acc[key];
  }, object)
);

/**
 * Creates reverse relationships for data merged into the state
 * @param {Object} state
 * @param {Object} newState Immutable Object via object-path-immutable
 * @param {Object} data JSON-API data object
 * @param {Object} data.id
 * @param {Object} data.type
 * @param {Object} data.relationships
 */
export const createReverseRelationships = (state, newState, { id, type, relationships = {} }) => {
  Object.values(relationships).forEach(({ data }) => {
    const children = resourcesArray(data);
    const childModel = Registry.get(children[0].type);
    const childData = { type, id };
    const { key, isArray } = childModel.relationships[type];

    children.forEach(({ type: relType, id: relId }) => {
      const objectPath = ['resources', relType, relId, 'relationships', key];
      const existingRelationships = resourcesArray(getProperty(state, ...objectPath));

      if (!isArray) {
        newState.set([...objectPath, 'data'], childData);
        return;
      }

      if (existingRelationships.find((relationship) => relationship.id === id)) return;

      newState.push([...objectPath, 'data'], childData);
    });
  });
};

/**
 * Merges all resources into the state
 * @param {Object} state
 * @param {Object} payload JSON-API payload
 * @param {Object} payload.data
 * @param {Object} payload.included
 */
export const mergeResources = (state, { data, included = [] }) => {
  const newState = imm(state);

  resourcesArray(data).concat(included).forEach((dataObj) => {
    // if we don't do this and the ID is a number, it'll create an array
    newState.set(['resources', dataObj.type], state[dataObj.type] || {});
    newState.set(['resources', dataObj.type, dataObj.id], dataObj);
    createReverseRelationships(state, newState, dataObj);
  });

  return newState.value();
};

/**
 * This function clears differently based on what's passed in
 * Object: { type, id } -> this resource is cleared
 * Array: Each of the resources is cleared
 * String: '[type]' -> These resources are cleared
 * undefined: -> All resources are cleared
 * @param {Object} state
 * @param {Object[]|Object|string|undefined} data
 */
export const clearResources = (state, data) => {
  switch (typeof data) {
    case 'object': {
      if (Array.isArray(data)) return data.reduce(clearResources, state);
      const { type, id } = data;
      return imm.del(state, ['resources', type, id]);
    }
    case 'string': return imm.set(state, ['resources', data], {});
    case 'undefined': return imm.set(state, 'resources', {});
    default: return state;
  }
};

/**
 * @example
 * const CUSTOM_REDUX_ACTION = 'CUSTOM_REDUX_ACTION';
 * export const customReduxAction = createAction(CUSTOM_REDUX_ACTION); // => [function]
 * customReduxAction(payload) // => { type, payload }
 * @param {string} type Action type
 */
export const createAction = (type) => (payload) => ({ type, payload });

/**
 * @param {Object} mappings Reducer handlers per action
 * @param {Object} initialState
 */
export const createReducer = (mappings, initialState) => (state = initialState, action) => (
  mappings[action.type] ? mappings[action.type](state, action) : state
);

/**
 * @param {Object} state
 * @param {Object} resource
 * @param {Array|Object} resource.data
 */
export const markPendingResources = (state, { data }) => (
  resourcesArray(data).reduce((acc, resource) => {
    if (!getProperty(state, 'resources', resource.type, resource.id)) return acc;
    return acc.set(['resources', resource.type, resource.id, 'isPending'], true);
  }, imm(state)).value()
);
