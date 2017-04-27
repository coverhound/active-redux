import 'babel-polyfill';

class Registry {
  constructor() {
    this.__registry__ = {};
    this.__context__ = {};
  }

  get store() {
    return this.__context__.store;
  }

  set store(store) {
    this.__context__.store = store;
  }

  get(name) {
    return this.__registry__[name];
  }

  register(model) {
    model.context = this.__context__;
    this.__registry__[model.name] = model;
  }
}

export default new Registry();
