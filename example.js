import store ...
import types from 'ch-json-api';

class Person extends Model {
  static endpoints = {
    read: ':type/:id' // can be string or function?
    create: ':type',
    update: ':type/:id',
    delete: ':type/:id',
  };
  static store = thestore;
  static type = 'people';
  static attributes = {
    name: types.string({ default: 'foo' }),
  };

  static find() {
    this.type
  }

  get fullName() {
    return this.attributes.firstName + ' ' + this.attributes.lastName;
  }
}

Model.store = store;

export default Person;
