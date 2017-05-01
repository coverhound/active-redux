import Store from './store';
import { invalidAttribute } from '../errors';

class Model extends Store {
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
          throw invalidAttribute(field);
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
          ? this.constructor.find({ id: data.map((d) => d.id) }, data[0].type)
          : this.constructor.findById(data.id, data.type);
      }
    });
  }

  get type() {
    return this.constructor.type;
  }
}

export default Model;
