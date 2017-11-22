import './polyfill';
import Store from './store';
import Registry from './registry';
import * as Queries from './queries';

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
      return attribute.cast(this.data.attributes[attribute.name || field]);
    }
  });
};

/**
 * @private
 */
const defineRelationship = (object, field, attribute) => {
  const { isArray, resource } = object.constructor.attributes[field];
  const model = Registry.get(resource);
  if (!model) throw new Error(`Unregistered model: ${resource}`);
  const fetch = (isArray ? Queries.hasMany : Queries.hasOne)(model);

  Object.defineProperty(object, field, {
    get() {
      const data = this.data.relationships[attribute.name || field].data;
      return () => fetch(data);
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
        defineRelationship(object.prototype, field, attribute);
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
   * @property {String|Number} id JSON-API Resource ID
   * @property {String} type JSON-API Resource Type
   */
  const Model = class extends model {

    /**
    * JSON-API type of the model
    * @private
    */
    static type = type;

    /**
    * Attributes of a model, for which methods will be defined
    * @see {@link module:active-redux/attributes}
    * @example
    * import { Attr, define } from 'active-redux';
    *
    * const Person = define('people', class Person {
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
    * @see {@link module:active-redux/queries.all}
    */
    static all = Queries.all(this);

    /**
    * Queries the store for that resource
    * @see {@link module:active-redux/queries.where}
    */
    static where = Queries.where(this);

    /**
    * Gets one of that resource
    * @see {@link module:active-redux/queries.find}
    */
    static find = Queries.find(this);

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

    /**
     * @param {Object} data JSON-API data
     */
    constructor(data) {
      super(data);
      this.data = data;
    }

    get id() {
      return this.data.id;
    }

    get type() {
      return this.constructor.type;
    }
  };

  copyClassName(model, Model);
  Model.relationships = defineMethods(Model, Model.attributes);
  Registry.register(Model);
  return Model;
}
