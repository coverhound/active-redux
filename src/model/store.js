import { missingStore, unregisteredModel } from './errors';
import { queryData } from './helpers';
import { remoteRead } from '../api';
import Registry from '../registry';
import BaseModel from './index';

const initModel = (data) => {
  let Model = Registry.get(data.type);
  if (!Model) {
    Model = BaseModel;
    unregisteredModel(data.type);
  }
  return new Model(data);
};

export default (target) => (
  class Model extends target {
    static context = {};

    static get store() {
      if (!this.context.store) {
        throw missingStore();
      }

      return this.context.store;
    }

    static set store(value) {
      this.context.store = value;
    }

    static get state() {
      return this.store.getState().api;
    }

    static get dispatch() {
      return this.store.dispatch;
    }

    static all({ type = this.type } = {}) {
      return Promise.resolve(
        Object.values(this.state[type]).map((data) => initModel(data))
      );
    }

    static where(query, { remote = true, type = this.type } = {}) {
      const local = queryData(Object.values(this.state[type]), query);
      if (local.length > 0 || remote === false) {
        return Promise.resolve(local.map((data) => initModel(data)));
      }

      return this.dispatch(remoteRead({ resource: this, query }))
        .then(() => this.where(query, { remote: false }));
    }

    static findById(id, { remote = true, type = this.type } = {}) {
      const local = this.state[type][id];
      if (local || remote === false) {
        return Promise.resolve(initModel(local));
      }

      const endpoint = `${this.endpoint('read')}/${id}`;

      return this.dispatch(remoteRead({ resource: this, endpoint }))
        .then(() => this.findById(id, { remote: false }));
    }

    static find({ id, ...query }, { remote = true, type = this.type } = {}) {
      if (id) return this.findById(id, { remote, type });
      return this.where(query, { remote, type }).then((results) => results[0]);
    }
  }
);
