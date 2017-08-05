import 'babel-polyfill';

import Store from './store';
import define from './model';

/**
 * @module active-redux
 */

/**
  * Registers the store to the model for .where/.find/.all queries
  * @function
  * @example
  * import ActiveRedux from 'active-redux';
  * import store from './store';
  *
  * ActiveRedux.bind(store);
  * @param {Object} store - A redux store
  */
export const bind = (store) => { Store.bind(store); };

/**
 * @alias module:active-redux.Attr
 * @see module:active-redux/attributes
 */
export * as Attr from './attributes';
export * from './api';

export default {
  bind,
  define,
};
