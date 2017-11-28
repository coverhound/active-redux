import imm from 'object-path-immutable';
import { createAction, resourcesArray } from '../api/utils';

/**
 * Action Names
 */
const API_WILL_INDEX = 'AR_API_WILL_INDEX';
const API_INDEX_DONE = 'AR_API_INDEX_DONE';
const API_INDEX_CLEAR = 'AR_API_INDEX_CLEAR';

/**
 * Actions
 */
const apiWillIndex = createAction(API_WILL_INDEX);
const apiIndexDone = createAction(API_INDEX_DONE);
export const apiIndexClear = createAction(API_INDEX_CLEAR);

export const apiIndexAsync = ({ hash, promise }) => (dispatch, getState) => {
  const indexExists = () => getState().api.indices[hash];

  if (indexExists() && indexExists().isFetching) return promise;

  dispatch(apiWillIndex(hash));

  return promise.then((resources) => {
    if (!indexExists()) return resources;
    dispatch(apiIndexDone({ hash, resources }));
    return resources;
  });
};
export const apiIndexSync = ({ hash, resources }) => (dispatch) => {
  dispatch(apiWillIndex(hash));
  dispatch(apiIndexDone({ hash, resources }));
};

const initialState = {
  indices: {},
};

const map = {
  [API_WILL_INDEX]: (state, { payload: hash }) => {
    const index = [];
    index.isFetching = true;
    return imm.set(state, ['indices', hash], index);
  },
  [API_INDEX_DONE]: (state, { payload: { hash, resources: resourceArray } }) => {
    const index = resourcesArray(resourceArray).map(({ id, type }) => ({ id, type }));
    index.isFetching = false;
    return imm.set(state, ['indices', hash], index);
  },
  [API_INDEX_CLEAR]: (state, { payload: hash }) => {
    const index = [];
    index.isFetching = false;
    return imm.set(state, ['indices', hash], index);
  },
};

/**
 * Active-Redux Reducer Extension
 */
export default { initialState, map };
