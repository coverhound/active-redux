import { invalidAttribute, missingStore } from './errors';
import { deepPartialEqual } from './helpers';

class Model {
  constructor(data) {
    this.data = data;
  }

  static __defineMethods__() {
    Object.entries(this.attributes || {}).forEach(([field, attribute]) => {
      switch (attribute.type) {
        case 'attribute':
          this.__defineAttribute__(field, attribute);
          break;
        case 'relationship':
          this.__defineRelationship__(field, attribute);
          break;
        default:
          throw invalidAttribute(field);
      }
    });
  }

  static __defineAttribute__(field, attribute) {
    Object.defineProperty(this.prototype, field, {
      get() {
        return attribute.cast(this.data.attributes[field]);
      }
    });
  }

  static __defineRelationship__(field) {
    Object.defineProperty(this.prototype, field, {
      get() {
        const relationship = this.constructor.attributes[field];
        const data = this.data.relationships[field].data;

        return relationship.array
          ? this.constructor.find({ id: data.map((d) => d.id) }, data[0].type)
          : this.constructor.findById(data.id, data.type);
      }
    });
  }

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

  get type() {
    return this.constructor.type;
  }

}

export default Model;
