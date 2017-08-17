import './polyfill';
import { remoteRead } from './api';

/**
 * @module
 * @private
 */
export const missingStore = () => (
  new Error(`
    Active-Redux has not yet been bound to a store:

    import ActiveRedux from 'active-redux';
    import myStore from './store';

    ActiveRedux.bind(myStore);
  `)
);

// Used for querying the store #where / #find
const deepPartialEqual = (obj1, obj2) => (
  Object.entries(obj1).reduce((equal, [key, value]) => {
    if (equal === false) return equal;
    if (obj2 === undefined) return false;

    if (typeof value === 'object' && !Array.isArray(value)) {
      return deepPartialEqual(value, obj2[key]);
    }

    if (value !== obj2[key]) return false;

    return equal;
  }, true)
);

// Query through an array of objects
export const queryData = (entities, query) => (
  entities.filter((entity) => (
    Object.entries(query).reduce((match, [queryKey, queryValue]) => {
      if (match === false) return match;

      const entityValue = entity[queryKey];

      if (Array.isArray(queryValue)) {
        return queryValue.includes(entityValue);
      }
      if (typeof queryValue === 'object') {
        return deepPartialEqual(queryValue, entityValue);
      }
      return queryValue === entityValue;
    }, true)
  ))
);

// Instantiate JSON-API data with its corresponding Model
const initModel = (Model) => (data) => data && new Model(data);

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

  all({ model } = {}) {
    return Promise.resolve(
      Object.values(this.state[model.type]).map(initModel(model))
    );
  }

  where(query, { remote = true, model } = {}) {
    const local = queryData(Object.values(this.state[model.type]), query);
    if (local.length > 0 || remote === false) {
      return Promise.resolve(local.map(initModel(model)));
    }

    return this.dispatch(remoteRead({ resource: model, query }))
      .then(() => this.where(query, { remote: false, model }));
  }

  findById(id, { remote = true, model } = {}) {
    const local = this.state[model.type][id];
    if (local || remote === false) {
      return Promise.resolve(initModel(model)(local));
    }

    const endpoint = `${this.endpoint('read')}/${id}`;

    return this.dispatch(remoteRead({ resource: model, endpoint }))
      .then(() => this.findById(id, { remote: false, model }));
  }

  find({ id, ...query }, { remote = true, model } = {}) {
    if (id) return this.findById(id, { remote, model });
    return this.where(query, { remote, model }).then((results) => results[0]);
  }
}

export default new Store();
