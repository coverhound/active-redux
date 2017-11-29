import { createSelector } from 'reselect';
import './polyfill';
import { apiRead } from './api';
import { apiIndexAsync, queryEndpoint } from './indexing';

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

const toModel = (Model) => (data = null) => (data ? new Model(data) : data);
const mapToModel = (Model) => (data) => data.map((item) => toModel(Model)(item));

const createRecordPromise = ({ promise, selector, store }) => {
  const recordPromise = promise.then(() => selector(store.getState()));
  recordPromise.selector = selector;
  return recordPromise;
};

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

  peek(id, { model } = {}) {
    return toModel(model)(this.state[model.type][id]);
  }

  /**
   * @param {String|Number} id
   * @param {Object} options
   * @param {Model} options.model
   * @returns {RecordPromise<Model|null>}
   */
  find(id, { model } = {}) {
    const endpoint = `${model.endpoint('read')}/${id}`;
    const promise = this.dispatch(apiRead({ resource: model, endpoint }));
    const mapper = toModel(model);
    const selector = createSelector(
      (state) => state.api.resources[model.type],
      (resources = {}) => mapper(resources[id]),
    );

    return createRecordPromise({ promise, selector, store: this.store });
  }

  peekAll({ model } = {}) {
    return mapToModel(model)(Object.values(this.state[model.type]));
  }

  findAll({ model } = {}) {
    const promise = this.dispatch(apiRead({ resource: model }));
    const mapper = mapToModel(model);
    const selector = createSelector(
      (state) => state.api.resources[model.type],
      (resources = {}) => mapper(Object.values(resources)),
    );

    return createRecordPromise({ promise, selector, store: this.store });
  }

  query(query, { model } = {}) {
    const endpoint = queryEndpoint(model.endpoint('read'), query);
    const promise = this.dispatch(apiRead({ resource: model, endpoint })).then(({ data }) => data);
    this.dispatch(apiIndexAsync({ hash: endpoint, promise }));
    const selector = createSelector(
      (state) => state.api.indices[endpoint],
      (state) => state.api.resources[model.type],
      (index = []) => {
        const results = index.map((item) => this.peek(item.id, { model }));
        results.isFetching = index.isFetching;
        return results;
      }
    );

    return createRecordPromise({ promise, selector, store: this.store });
  }
}

export default new Store();
