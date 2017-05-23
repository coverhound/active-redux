import imm from 'object-path-immutable';

import * as ActionTypes from './constants';
import {
  resourcesArray,
  mergeResources,
  clearResources,
  createReducer,
} from '../utils';

const updateResources = (state, resources) => (
  imm.set(state, 'resources', mergeResources(state.resources, resources))
);

const initialState = {
  resources: {},
};

export default createReducer({
  [ActionTypes.LOCAL_CLEAR]: (state, { payload: type }) => (
    type ? clearResources(state, type) : state
  ),
  [ActionTypes.LOCAL_HYDRATE]: (state, { payload: resources }) => (
    updateResources(state, resources)
  ),
  [ActionTypes.LOCAL_CREATE]: (state, { payload: resources }) => (
    updateResources(state, resources)
  ),
  [ActionTypes.LOCAL_READ]: (state, { payload: resources }) => (
    updateResources(state, resources)
  ),
  [ActionTypes.LOCAL_UPDATE]: (state, { payload: resources }) => (
    updateResources(state, resources)
  ),
  [ActionTypes.LOCAL_DELETE]: (state, { payload: resources }) => (
    clearResources(state, resourcesArray(resources.data))
  ),
}, initialState);
