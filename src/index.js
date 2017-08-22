import Store from './store';
import define from './model';
/**
 * @module active-redux
 */

import * as Attr from './attributes';
import * as api from './api';
import connect from './connect';

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
  define,
  connect,
/**
 * @alias module:active-redux.api
 * @see module:active-redux/api
 */
  api,
};
