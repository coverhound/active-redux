import './polyfill';
import { ReduxStore } from './types';

/**
 * @module
 * @private
 *
 * @typedef {Promise} RecordPromise
 * @property {Selector} selector
 */
const missingStore = () => (
  new Error(`
    Active-Redux has not yet been bound to a store:

    import { bind } from 'active-redux';
    import myStore from './store';

    bind(myStore);
  `)
);

// @internal
export class Store {
  _store: ReduxStore;

  bind(store) {
    this._store = store;
  }

  get store() {
    if (!this._store) throw missingStore();
    return this._store;
  }

  get dispatch() {
    return this.store.dispatch;
  }

  get state() {
    return this.store.getState().api.resources;
  }
}

export default new Store();
