import { missingStore } from '../errors';
import { defineAttribute } from './attribute';
import { defineRelationship } from './relationship';

const defineType = {
  attribute: defineAttribute,
  relationship: defineRelationship,
};

const defineMethods = ({ context, attributes }) => {
  Object.keys(attributes).forEach((key) => {
    const attribute = attributes[key];
    defineType[attribute.type]({ context, key, ...attribute });
  });
};

class Model {
  constructor(data) {
    this.data = data;
  }

  static type = 'models';
  static attributes = {};
  static context = {};

  static __defineMethods__() {
    defineMethods({ context: this, attributes: this.attributes });
  }

  static get dispatch() {
    if (!this.context.store) throw missingStore();
    return this.context.store.dispatch;
  }

  get type() {
    return this.constructor.type;
  }

  update(data) {}
  save() {}

  static find() {}
  static where() {}
}

export default Model;
