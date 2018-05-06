/**
 * The registry hangs onto our models for lookup by type
 * @private
 */
class Registry {
  models = {};

  get(name) {
    if (this.models[name]) return this.models[name];
    throw new Error(`Unregistered model: ${name}`);
  }

  register(model) {
    this.models[model.type] = model;
  }
}

export default new Registry();
