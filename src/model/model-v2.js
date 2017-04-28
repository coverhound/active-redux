import Query from './query';
import {
  missingStore,
} from '../errors';

class Model extends Query {
  constructor(data) {
    super(data);

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
          throw new Error(`${field} needs an attribute type`);
      }
    });
  }

  static __defineAttribute__(field, attribute) {
    Object.defineProperty(this.prototype, field, {
      get() {
        return attribute.cast(this.data.attributes[field]);
      },
    });
  }

  static __defineRelationship__(field) {
    Object.defineProperty(this.prototype, field, {
      get() {
        const relationship = this.constructor.attributes[field];
        const data = this.data.relationships[field].data;

        return relationship.array
          ? this.constructor.findAll(data[0].type, data.map((d) => d.id))
          : this.constructor.findOne(data.type, data.id);
      }
    });
  }

  static get dispatch() {
    if (!this.store) throw missingStore();
    return this.store.dispatch;
  }

  get type() {
    return this.constructor.type;
  }
}

export default Model;
