import './polyfill';

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

class Store {
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
