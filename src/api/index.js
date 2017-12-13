import { createReducer } from './utils';
import baseReducer from './reducer';

export * from './reducer';

/**
 * API Reducer
 * @function
 * @alias module:active-redux/api
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
 *
 * @example
 * import { createStore, combineReducers, applyMiddleware } from 'redux';
 * import { api } from 'active-redux';
 *
 * const initialState = {};
 *
 * // You can add your own extensions to the reducer
 * const customExtensions = [{
 *   map: { AR_PAGINATE_MODELS: (state, payload) => {} },
 *   initialState: { pagination: {} },
 * }];
 *
 * export default createStore(
 *   combineReducers({ api: api.reducer.extend(...customExtension) }),
 *   initialState,
 *   applyMiddleware(thunk),
 * );
 * @param {Object} state
 * @param {Object} action
 */
export const reducer = createReducer(baseReducer);
