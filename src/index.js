import Store from './store';
import define from './model';
/**
 * @module active-redux
 */

/**
 * @alias module:active-redux.Attr
 * @see module:active-redux/attributes
 */
import * as Attr from './attributes';
/**
 * @alias module:active-redux.api
 * @see module:active-redux/api
 */
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
  Attr,
  bind,
  define,
  connect,
  api,
};
