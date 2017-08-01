import { invalidAttribute } from './errors';
import { parseParams } from './helpers';
import Store from './store';

@Store
class Model {
  static endpoints = {
    create: ':type',
    read: ':type',
    update: ':type/:id',
    delete: ':type/:id',
  };

  static endpoint(action, params = this) {
    return parseParams(params, this.endpoints[action]);
  }

  endpoint(action) {
    return this.constructor.endpoint(action, this);
  }

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
          ? this.constructor.where({ id: data.map((d) => d.id) }, { type: data[0].type })
          : this.constructor.findById(data.id, { type: data.type });
      }
    });
  }

  get id() {
    return this.data.id;
  }

  get type() {
    return this.constructor.type;
  }
}

export default Model;
