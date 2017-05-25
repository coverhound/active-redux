import imm from 'object-path-immutable';

export apiClient from './api-client';

export const incrementProperty = (state, key) => (
  imm.set(state, key, state[key] + 1)
);

export const decrementProperty = (state, key) => (
  imm.set(state, key, state[key] - 1)
);

export const resourcesArray = (data) => (
  Array.isArray(data) ? data : [data]
);

export const mergeResources = (state, { data, included = [] }) => {
  const newState = imm(state);

  resourcesArray(data).concat(included).forEach((dataObj) => {
    // if we don't do this and the ID is a number, it'll create an array
    newState.set(dataObj.type, state[dataObj.type] || {});
    newState.set(`${dataObj.type}.${dataObj.id}`, dataObj);
  });

  return newState.value();
};

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

export const createAction = (type) => (payload) => ({ type, payload });

export const createReducer = (mappings, initialState) => (state = initialState, action) => (
  mappings[action.type] ? mappings[action.type](state, action) : state
);

export const hasProperty = (object, ...keys) => (
  keys.reduce((acc, key) => {
    if (acc === undefined) return acc;
    return acc[key];
  }, object)
);

export const markPendingResources = (state, { data }) => (
  resourcesArray(data).reduce((acc, resource) => {
    if (!hasProperty(state, 'resources', resource.type, resource.id)) return acc;
    return acc.set(['resources', resource.type, resource.id, 'isPending'], true);
  }, imm(state)).value()
);
