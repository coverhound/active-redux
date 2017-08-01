import 'babel-polyfill';

class Registry {
  constructor() {
    this.__models__ = {};
    this.__context__ = {};
  }

  get store() {
    return this.__context__.store;
  }

  set store(store) {
    this.__context__.store = store;
  }

  get(name) {
    return this.__models__[name];
  }

  register(model) {
    model.context = this.__context__;
    model.__defineMethods__ && model.__defineMethods__();
    this.__models__[model.type] = model;
  }
}

export default new Registry();
