import { missingStore } from '../errors';
import { defineAttribute } from './attribute';
import { defineRelationship } from './relationship';

const defineMethods = ({ context, attributes }) => {
  Object.keys(attributes).forEach((key) => {
    const value = attributes[key];

    typeof value === 'function' ?
      defineAttribute({ context, key, cast: value }) :
      defineRelationship({ context, key, value })
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
