import imm from 'object-path-immutable';

import * as Types from './constants';
import {
  clearResources,
  createReducer,
  decrementProperty,
  incrementProperty,
  markPendingResources,
  mergeResources,
  resourcesArray,
} from './utils';

const initialState = {
  resources: {},
  apiConfig: {},
  isCreating: 0,
  isReading: 0,
  isUpdating: 0,
  isDeleting: 0,
};

const updateResources = (state, resources) => (
  imm.set(state, 'resources', mergeResources(state.resources, resources))
);

export default createReducer({
  [Types.API_CONFIGURE]: (state, { payload: apiConfig }) => (
    imm(state).set('apiConfig', apiConfig).value()
  ),
  [Types.REMOTE_CLEAR]: (state, { payload: type }) => (
    clearResources(state, type)
  ),
  [Types.REMOTE_HYDRATE]: (state, { payload: resources }) => (
    updateResources(state, resources)
  ),

  [Types.REMOTE_WILL_CREATE]: (state) => (
    incrementProperty(state, 'isCreating')
  ),
  [Types.REMOTE_CREATE_DONE]: (state, { payload: resources }) => {
    const newState = updateResources(state, resources);
    return decrementProperty(newState, 'isCreating');
  },
  [Types.REMOTE_CREATE_FAILED]: (state) => (
    decrementProperty(state, 'isCreating')
  ),

  [Types.REMOTE_WILL_READ]: (state) => (
    incrementProperty(state, 'isReading')
  ),
  [Types.REMOTE_READ_DONE]: (state, { payload: resources }) => {
    const newState = updateResources(state, resources);
    return decrementProperty(newState, 'isReading');
  },
  [Types.REMOTE_READ_FAILED]: (state) => (
    decrementProperty(state, 'isReading')
  ),

  [Types.REMOTE_WILL_UPDATE]: (state, { payload: resources }) => {
    const newState = incrementProperty(state, 'isUpdating');
    return markPendingResources(newState, resources);
  },
  [Types.REMOTE_UPDATE_DONE]: (state, { payload: resources }) => {
    const newState = updateResources(state, resources);
    return decrementProperty(newState, 'isUpdating');
  },
  [Types.REMOTE_UPDATE_FAILED]: (state) => (
    decrementProperty(state, 'isUpdating')
  ),

  [Types.REMOTE_WILL_DELETE]: (state, { payload: resources }) => {
    const newState = incrementProperty(state, 'isDeleting');
    return markPendingResources(newState, resources);
  },
  [Types.REMOTE_DELETE_DONE]: (state, { payload: resources }) => {
    const newState = clearResources(state, resourcesArray(resources.data));
    return decrementProperty(newState, 'isDeleting');
  },
  [Types.REMOTE_DELETE_FAILED]: (state) => (
    decrementProperty(state, 'isDeleting')
  ),
}, initialState);
