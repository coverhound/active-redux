import Store from './store';
import * as Attr from './attributes';
import * as apiTmp from './api';
import { extension as indexing } from './indexing';

export { default as define } from './model';

const api = Object.assign(
  {},
  apiTmp,
  { reducer: apiTmp.reducer.extend(indexing) },
);

/**
  * Registers the store to the model for .where/.find/.all queries
  * @function
  * @example
  * import { bind } from 'active-redux';
  * import store from './store';
  *
  * bind(store);
  * @param {Object} store - A redux store
  */
const bind = (store) => { Store.bind(store); };

export {
/**
 * @alias module:active-redux.Attr
 * @see module:active-redux/attributes
 */
  Attr,
  bind,
/**
 * @alias module:active-redux.api
 * @see module:active-redux/api
 */
  api,
};
