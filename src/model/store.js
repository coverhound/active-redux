import { missingStore } from './errors';
import { deepPartialEqual } from './helpers';

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

    static findById(id, type = this.type) {
      return new this(this.state[type][id]);
    }

    static findAll(type = this.type) {
      return Object.values(this.state[type]).map((data) => new this(data));
    }

    static find(query, type = this.type) {
      return this.findAll(type).filter((entity) =>
        Object.entries(query).reduce((match, [queryKey, queryValue]) => {
          if (match === false) {
            return match;
          }

          const entityValue = entity.data[queryKey];

          if (Array.isArray(queryValue)) {
            return queryValue.includes(entityValue);
          }
          if (typeof queryValue === 'object') {
            return deepPartialEqual(queryValue, entityValue);
          }
          return queryValue === entityValue;
        }, true)
      );
    }
  }
);
