let store;
const __registry__ = {};

export const add = (model) => {
  if (store) model.store = store;
  __registry__[model.name] = model;
};

export const get = (name) => {
  return __registry__[name];
};

export const registerStore = (newStore) => {
  store = newStore;
  Object.values(__registry__).forEach((model) => model.store = store);
};
