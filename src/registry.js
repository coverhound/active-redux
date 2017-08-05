/**
 * The registry hangs onto our models for lookup by type
 * @private
 */
class Registry {
  constructor() {
    this.models = {};
  }

  get(name) {
    return this.models[name];
  }

  register(model) {
    this.models[model.type] = model;
  }
}

export default new Registry();
