// should these even need to be within the module
// or can they be part of the exported object?
let store;
const __registry__ = {};

const Registry = {
  get store() {
    return store;
  },
  register(model) {
    if (this.store) model.store = store;
    __registry__[model.name] = model;
  },
  get(model) {
    return __registry__[model];
  },
  setStore(newStore) {
    store = newStore;
    Object.values(__registry__).forEach(
      (model) => model.store = newStore
    );
  },
};

export default Registry;
