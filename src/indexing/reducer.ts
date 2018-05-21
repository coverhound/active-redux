import imm from 'object-path-immutable';
import { createAction, resourcesArray } from '../api/utils';
import { namespace } from '../api';

/**
 * Helpers
 */
export class Index extends Array {
  hash: string;
  isFetching: boolean;

  constructor({ hash, isFetching = false }, ...args) {
    super(...args);
    this.hash = hash;
    this.isFetching = isFetching;
  }
}

const indexArray = (options, data) => new Index(
  options,
  ...resourcesArray(data).map(({ id, type }) => ({ id, type })),
);

/**
 * Action Names
 */
const API_WILL_INDEX: string = 'AR_API_WILL_INDEX';
const API_INDEX_DONE: string = 'AR_API_INDEX_DONE';
const API_INDEX_CLEAR: string = 'AR_API_INDEX_CLEAR';

/**
 * Actions
 */
const apiWillIndex = createAction(API_WILL_INDEX);
const apiIndexDone = createAction(API_INDEX_DONE);
export const apiIndexClear = createAction(API_INDEX_CLEAR);

export const apiIndexAsync = ({ hash, promise }) => (dispatch, getState) => {
  const indexExists = () => getState()[namespace.value].indices[hash];

  if (indexExists() && indexExists().isFetching) return promise;

  dispatch(apiWillIndex(hash));

  return promise.then((data) => {
    if (indexExists()) dispatch(apiIndexDone({ hash, data }));
    return data;
  }).catch(() => {
    dispatch(apiIndexDone({ hash, data: [] }));
  });
};
export const apiIndexSync = ({ hash, data }) => (dispatch) => {
  dispatch(apiWillIndex(hash));
  dispatch(apiIndexDone({ hash, data }));
};

const initialState = {
  indices: {},
};

const map = {
  [API_WILL_INDEX]: (state, { payload: hash, data = state.indices[hash] || [] }) => (
    imm.set(state, ['indices', hash], indexArray({ isFetching: true, hash }, data))
  ),
  [API_INDEX_DONE]: (state, { payload: { hash, data } }) => (
    imm.set(state, ['indices', hash], indexArray({ hash }, data))
  ),
  [API_INDEX_CLEAR]: (state, { payload: hash }) => (
    imm.set(state, ['indices', hash], indexArray({ hash }, []))
  ),
};

/**
 * Active-Redux Reducer Extension
 */
export default { initialState, map };
