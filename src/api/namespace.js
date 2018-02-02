/**
 * @private
 */
class Namespace {
  constructor(value) { this.namespace = value; }
  get value() { return this.namespace; }
  set change(value) { this.namespace = value; }
}

/**
 * Our default namespace for our reducer is 'api'
 * @example
 * import { combineReducers } from 'redux';
 * import { api as activeReduxApi } from 'active-redux';
 *
 * const reducers = combineReducers({ api: activeReduxApi.reducer });
 */
export default new Namespace('api');
