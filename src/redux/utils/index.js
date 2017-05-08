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

export const clearResources = (state, resources) => {
  switch (typeof resources) {
    case 'object': {
      if (Array.isArray(resources)) return resources.reduce(clearResources, state);
      const { type, id } = resources;
      return imm.del(state, ['resources', type, id]);
    }
    case 'string': return imm.set(state, ['resources', resources], {});
    case 'undefined': return imm.set(state, 'resources', {});
    default: return state;
  }
};

export const createAction = (type) => (payload) => ({ type, payload });

export const createReducer = (mappings, initialState) => (state = initialState, action) => (
  mappings[action.type] ? mappings[action.type](state, action) : state
);
