// we can remove the yup dependency, in all likelyhood
import yup from 'yup';

/**
 * @module active-redux/attributes
 */

/**
 * Defines a hasOne relationship
 * @function
 * @example
 * class Person extends Model {
 *   static attributes = {
 *     employer: Attr.hasOne('companies')
 *   };
 * }
 *
 * // maps to this model
 * class Company extends Model {
 *   static type = 'companies';
 * }
 *
 * // translates to this JSON-API:
 * {
 *   relationships: {
 *     employer: {
 *       data: { type: 'companies', [id] }
 *     }
 *   }
 * }
 *
 * const person = new Person(data);
 * person.employer => Promise<Company>
 * @param {string} resource JSON-API type of relationship
 */
export const hasOne = (resource) => ({
  type: 'relationship',
  isArray: false,
  resource,
});

/**
 * Defines a hasMany relationship
 * @function
 * @example
 * class Person extends Model {
 *   static attributes = {
 *     posts: Attr.hasMany('articles')
 *   };
 * }
 *
 * // maps to this model
 * class Article extends Model {
 *   static type = 'articles';
 * }
 *
 * // translates to this JSON-API:
 * {
 *   relationships: {
 *     posts: {
 *       data: [
 *         { type: 'articles', [id] },
 *         { type: 'articles', [id] }
 *       ]
 *     }
 *   }
 * }
 *
 * const person = new Person(data);
 * person.posts // => Promise<Array<Article>>
 * @param {string} resource JSON-API type of relationship
 */
export const hasMany = (resource) => ({
  type: 'relationship',
  isArray: true,
  resource,
});

/**
 * Defines an attribute that is coerced into a string
 * @function
 * @example
 * class Person {
 *   static attributes = {
 *     name: Attr.string({ default: "Bob" }),
 *   };
 * }
 *
 * const person = new Person(data);
 * person.name // => "Alexis Sanches"
 *
 * const blank = new Person({});
 * blank.name // => "Bob"
 * @param {Object} options
 * @param {(string|function)} options.default Default value for this attribute
 */
export const string = ({ default: defaultValue } = {}) => ({
  type: 'attribute',
  cast: (obj) => yup.string().default(defaultValue).nullable().cast(obj),
});

/**
 * Defines an attribute that is coerced into a number
 * @function
 * @example
 * class Person {
 *   static attributes = {
 *     age: Attr.number({ default: 13 }),
 *   };
 * }
 *
 * const person = new Person(data);
 * person.age // => 25
 *
 * const blank = new Person({});
 * blank.age // => 13
 * @param {Object} options
 * @param {(number|function)} options.default Default value for this attribute
 */
export const number = ({ default: defaultValue } = {}) => ({
  type: 'attribute',
  cast: (obj) => yup.number().default(defaultValue).nullable().cast(obj),
});

/**
 * Defines an attribute that is coerced into a date
 * @function
 * @example
 * class Person {
 *   static attributes = {
 *     birthDate: Attr.number({ default: new Date() }),
 *   };
 * }
 *
 * const person = new Person(data);
 * person.birthDate // => Date: 1962/02/15
 *
 * const blank = new Person({});
 * blank.birthDate // => Date: [today]
 * @param {Object} options
 * @param {(date|function)} options.default Default value for this attribute
 */
export const date = ({ default: defaultValue } = {}) => ({
  type: 'attribute',
  cast: (obj) => {
    if (obj === undefined) return defaultValue;
    if (obj === null) return obj;
    if (typeof obj === 'number') return new Date(obj);
    return yup.date().cast(obj);
  },
});

/**
 * Defines an attribute that is coerced into a boolean
 * @function
 * @example
 * class Person {
 *   static attributes = {
 *     isSubscribed: Attr.boolean({ default: true }),
 *   };
 * }
 *
 * const person = new Person(data);
 * person.isSubscribed // => false
 *
 * const blank = new Person({});
 * blank.isSubscribed // => true
 * @param {Object} options
 * @param {(boolean|function)} options.default Default value for this attribute
 */
export const boolean = ({ default: defaultValue } = {}) => ({
  type: 'attribute',
  cast: (obj) => (
    typeof obj === 'string' ?
      Boolean(obj) :
      yup.boolean().default(defaultValue).nullable().cast(obj)
  ),
});

/**
 * Defines an attribute that is coerced into a array
 * @function
 * @example
 * class Person {
 *   static attributes = {
 *     interests: Attr.array({ default: [] }),
 *   };
 * }
 *
 * const person = new Person(data);
 * person.interests // => ["tennis", "squash"]
 *
 * const blank = new Person({});
 * blank.interests // => []
 * @param {Object} options
 * @param {(array|function)} options.default Default value for this attribute
 */
export const array = () => ({
  type: 'attribute',
  cast: (obj) => (Array.isArray(obj) ? obj : [obj]),
});

/**
 * Defines an attribute that is coerced into a object
 * @function
 * @example
 * class Person {
 *   static attributes = {
 *     isSubscribed: Attr.boolean({ default: {} }),
 *   };
 * }
 *
 * const person = new Person(data);
 * person.isSubscribed // => false
 *
 * const blank = new Person({});
 * blank.isSubscribed // => true
 * @param {Object} options
 * @param {(object|function)} options.default Default value for this attribute
 */
export const object = () => ({
  type: 'attribute',
  cast: (obj) => (
    typeof obj === 'object' ? obj : {}
  ),
});
