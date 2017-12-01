import './polyfill';
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
  const key = attribute.name || field;
  Object.defineProperty(object, field, {
    get() {
      return attribute.cast(this.data.attributes[key]);
    }
  });
};

/**
 * @private
 */
const defineRelationship = (object, field, attribute) => {
  const key = attribute.name || field;
  const { isArray, resource } = object.constructor.attributes[field];

  Object.defineProperty(object, field, {
    get() {
      const find = ({ id } = {}) => Store.peek(id, { model: Registry.get(resource) });
      const fetch = (isArray ? (data = []) => data.map(find) : find);
      const data = this.data.relationships[key].data;
      return fetch(data);
    }
  });

  const fetchName = `fetch${field[0].toUpperCase()}${field.slice(1)}`;
  Object.defineProperty(object, fetchName, {
    get() {
      const find = ({ id } = {}) => Store.find(id, { model: Registry.get(resource) });
      const fetch = (isArray ? (data = []) => Promise.all(data.map(find)) : find);
      const data = this.data.relationships[key].data;
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
  * @function define
  * @example
  * const Person = ActiveRedux.define('people', class Person {});
  * @param {string} type - JSON-API type for the model
  * @param {Class} [model] - Class to extend
  * @return {Model}
  */
export default function (type, model = class {}) {
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
     * Retrieves a resource from the store
     * @see {@link module:active-redux/store.peek}
     * @param {String|Number} id
     * @return {Model|null}
     */
    static peek(id, options = {}) {
      Store.peek(id, { ...options, model: this });
    }

    /**
     * Fetches a record from the server. Will serve a cached version if available.
     * @see {@link module:active-redux/store.find}
     * @param {String|Number} id
     * @return {RecordPromise<Model|null>}
     */
    static find(id, options = {}) {
      Store.find(id, { ...options, model: this });
    }

    /**
     * Gets all of that resource in the store
     * @see {@link module:active-redux/store.peekAll}
     * @return {RecordPromise<Array<Model>>}
     */
    static peekAll(options) {
      Store.peekAll({ ...options, model: this });
    }

    /**
     * Fetches all of that record from the server. Will serve a cached version if available.
     * @see {@link module:active-redux/store.findAll}
     * @return {RecordPromise<Array<Model>>}
     */
    static findAll(options) {
      return Store.findAll({ ...options, model: this });
    }

    /**
     * Fetches a query from the server.
     * @see {@link module:active-redux/store.query}
     * @return {RecordPromise<Array<Model>>}
     */
    static query(query, options) {
      return Store.query(query, { ...options, model: this });
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
