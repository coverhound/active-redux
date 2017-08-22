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

/**
 * API Reducer
 * @function
 * @alias module:active-redux/api.reducer
 * @example
 * import { createStore, combineReducers, applyMiddleware } from 'redux';
 * import { api } from 'active-redux';
 *
 * const initialState = {};
 *
 * export default createStore(
 *   combineReducers({ api: api.reducer }),
 *   initialState,
 *   applyMiddleware(thunk),
 * );
 * @param {Object} state
 * @param {Object} action
 */
export default createReducer({
  [Types.API_CONFIGURE]: (state, { payload: apiConfig }) => (
    imm(state).set('apiConfig', apiConfig).value()
  ),
  [Types.API_CLEAR]: (state, { payload: type }) => (
    clearResources(state, type)
  ),
  [Types.API_HYDRATE]: (state, { payload: resources }) => (
    mergeResources(state, resources)
  ),

  [Types.API_WILL_CREATE]: (state) => (
    incrementProperty(state, 'isCreating')
  ),
  [Types.API_CREATE_DONE]: (state, { payload: resources }) => {
    const newState = mergeResources(state, resources);
    return decrementProperty(newState, 'isCreating');
  },
  [Types.API_CREATE_FAILED]: (state) => (
    decrementProperty(state, 'isCreating')
  ),

  [Types.API_WILL_READ]: (state) => (
    incrementProperty(state, 'isReading')
  ),
  [Types.API_READ_DONE]: (state, { payload: resources }) => {
    const newState = mergeResources(state, resources);
    return decrementProperty(newState, 'isReading');
  },
  [Types.API_READ_FAILED]: (state) => (
    decrementProperty(state, 'isReading')
  ),

  [Types.API_WILL_UPDATE]: (state, { payload: resources }) => {
    const newState = incrementProperty(state, 'isUpdating');
    return markPendingResources(newState, resources);
  },
  [Types.API_UPDATE_DONE]: (state, { payload: resources }) => {
    const newState = mergeResources(state, resources);
    return decrementProperty(newState, 'isUpdating');
  },
  [Types.API_UPDATE_FAILED]: (state) => (
    decrementProperty(state, 'isUpdating')
  ),

  [Types.API_WILL_DELETE]: (state, { payload: resources }) => {
    const newState = incrementProperty(state, 'isDeleting');
    return markPendingResources(newState, resources);
  },
  [Types.API_DELETE_DONE]: (state, { payload: resources }) => {
    const newState = clearResources(state, resourcesArray(resources.data));
    return decrementProperty(newState, 'isDeleting');
  },
  [Types.API_DELETE_FAILED]: (state) => (
    decrementProperty(state, 'isDeleting')
  ),
}, initialState);
