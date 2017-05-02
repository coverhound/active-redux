import {
  missingStore,
} from '../errors';
import { deepPartialEqual } from '../helpers';

class Store {
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

  static get dispatch() {
    return this.store.dispatch;
  }

  static findById(id, type = this.type) {
    return this.store[type][id];
  }

  static findAll(type = this.type) {
    return Object.values(this.store[type]);
  }

  static find(query, type = this.type) {
    return this.findAll(type).filter((entity) =>
      Object.entries(entity).reduce((match, [field, value]) => {
        if (match) return match;
        const lookup = query[field];
        if (Array.isArray(lookup)) {
          return lookup.includes(value);
        }
        if (typeof lookup === 'object') {
          return deepPartialEqual(lookup, value);
        }
        return lookup === value;
      }, false)
    );
  }
}

export default Store;
