import Store from './store';
import Registry from './registry';

/**
 * @private
 */
const invalidAttribute = (field) => (
  new Error(`${field} needs an attribute type`)
);

/**
 * @private
 */
const defineAttribute = (object, field, attribute) => {
  Object.defineProperty(object, field, {
    get() {
      return attribute.cast(this.data.attributes[field]);
    }
  });
};

/**
 * @private
 */
const defineRelationship = (object, field) => {
  Object.defineProperty(object, field, {
    get() {
      const { isArray, resource } = this.constructor.attributes[field];
      const model = Registry.get(resource);
      if (!model) {
        throw new Error(`Unregistered model: ${resource}`);
      }
      const data = this.data.relationships[field].data;

      return isArray
        ? Store.where({ id: data.map((d) => d.id) }, { model })
        : Store.find({ id: data.id }, { model });
    }
  });
};

/**
 * Define JSON-API attributes and relationships
 * @private
 */
const defineMethods = (object, attributes) => {
  const relationships = {};

  Object.entries(attributes).forEach(([field, attribute]) => {
    switch (attribute.type) {
      case 'attribute':
        defineAttribute(object.prototype, field, attribute);
        break;
      case 'relationship':
        defineRelationship(object.prototype, field);
        relationships[attribute.resource] = { key: field, ...attribute };
        break;
      default:
        throw invalidAttribute(field);
    }
  });

  return relationships;
};

/**
 * @private
 */
const copyClassName = (from, to) => {
  Object.defineProperty(to, 'name', {
    value: from.name,
    writable: false,
    enumerable: false,
    configurable: false,
  });
};

/**
 * Helper function to create endpoint URIs
 * @private
 * @example
 * const obj = { type: 'animal', id: 5 }
 * parseParams(obj, '/api/v1/:type/:id')
 * // => '/api/v1/animal/5'
 */
export const parseParams = (context, string) => {
  const regexp = /:[^/.]+/g;
  return string.replace(regexp, (match) => context[match.substring(1)]);
};

/**
  * Defines a model
  * @alias module:active-redux.define
  * @example
  * const Person = ActiveRedux.define('people', class Person {});
  * @param {string} type - JSON-API type for the model
  * @param {Class} [model] - Class to extend
  * @return {Model}
  */
export default function define(type, model = class {}) {
  /**
   * Active Redux Model
   */
  const Model = class extends model {

    /**
    * JSON-API type of the model
    * @private
    */
    static type = type;

    /**
    * Attributes of a model, for which methods will be defined
    * @example
    * import Model, { Attr } from 'active-redux';
    *
    * const Person = Model.define('people', class Person {
    *   static attributes = {
    *     name: Attr.string(),
    *   }
    * });
    *
    * const joe = new Person({ attributes: { name: "Joe" } });
    * joe.name // => "Joe"
    */
    static attributes = model.attributes || {};

    /**
    * Endpoints that will be queried. Can be overwritten.
    * @private
    */
    static endpoints = model.endpoints || {
      create: ':type',
      read: ':type',
      update: ':type/:id',
      delete: ':type/:id',
    };

    /**
    * @private
    */
    static relationships = {};

    /**
    * Gets all of that resource
    * @example
    * Person.all()
    * // => Promise<Array<Person>>
    * @return {Promise<Array<this>>} Array of model instances
    */
    static all() {
      return Store.all({ model: this });
    }

    /**
    * Queries the store for that resource
    * @example
    * Person.where({ name: "Joe" })
    * // => Promise<Array<Person>>
    * @param {Object} query - Query for the store
    * @param {Object} [options]
    * @param {boolean} [options.remote] - Call to API if no records found?
    * @return {Promise<Array<this>>} Array of model instances
    */
    static where(query = {}, options = {}) {
      return Store.where(query, { model: this, ...options });
    }

    /**
    * Gets one of that resource
    * @example
    * Person.find({ id: 5 })
    * // => Promise<Person>
    * @param {Object} query - Query for the store
    * @param {Object} [options]
    * @param {boolean} [options.remote] - Call to API if no records found?
    * @return {Promise<(this|null)>} A model instance
    */
    static find(query = {}, options = {}) {
      return Store.find(query, { model: this, ...options });
    }

    /**
    * Find the endpoint for a specific action
    * @private
    */
    static endpoint(action, params = this) {
      return parseParams(params, this.endpoints[action]);
    }

    /**
    * @private
    * @see Model.endpoint
    */
    endpoint(action) {
      return this.constructor.endpoint(action, this);
    }

    constructor(data) {
      super(data);
      this.data = data;
    }

    /**
     * @return {string} JSON-API Resource ID
     */
    get id() {
      return this.data.id;
    }

    /**
     * @return {string} JSON-API Resource Type
     */
    get type() {
      return this.constructor.type;
    }
  };

  copyClassName(model, Model);
  Model.relationships = defineMethods(Model, Model.attributes);
  Registry.register(Model);
  return Model;
}
