import { Relationship, StaticAttribute, AttributeParams } from './types';
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
 * person.employer // => Company|null
 * person.fetchEmployer // => Promise<Company|null>
 * @param {string} resource JSON-API type of relationship
 * @param {Object} options
 * @param {string} options.name JSON-API name of the attribute
 */
export const hasOne = (
  resource,
  { name = undefined }: { name?: string } = {},
): Relationship => ({
  type: 'relationship',
  resource,
  name,
  isArray: false,
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
 * person.posts // => Array<Article>
 * person.fetchPosts // => Promise<Array<Article>>
 * @param {string} resource JSON-API type of relationship
 * @param {Object} options
 * @param {string} options.name JSON-API name of the attribute
 */
export const hasMany = (
  resource,
  { name = undefined }: { name?: string } = {},
): Relationship => ({
  type: 'relationship',
  resource,
  name,
  isArray: true,
});

const attribute = (
  { name, isType, cast, defaultValue, nullable = false }: AttributeParams
): StaticAttribute => ({
  type: 'attribute',
  name,
  cast: (value) => {
    if (value === undefined) {
      return typeof defaultValue === 'function'
        ? defaultValue.call(value)
        : defaultValue && JSON.parse(JSON.stringify(defaultValue));
    }
    if (isType(value) || (nullable && value === null)) return value;
    return cast(value);
  }
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
 * @param {string} options.name JSON-API name of the attribute
 * @param {(string|function)} options.default Default value for this attribute
 */
type stringDefault = (any) => string | string;
export const string = (
  { name, default: defaultValue }: { name?: string, default?: stringDefault } = {}
) => attribute({
  isType: (value) => typeof value === 'string',
  cast: (value) => (typeof value === 'object' ? '' : String(value)),
  nullable: true,
  name,
  defaultValue,
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
 * @param {string} options.name JSON-API name of the attribute
 * @param {(number|function)} options.default Default value for this attribute
 */
type numberDefault = (any) => number | number;
export const number = (
  { name, default: defaultValue }: { name?: string, default?: numberDefault } = {},
) => attribute({
  isType: (value) => typeof value === 'number',
  cast: parseFloat,
  nullable: true,
  name,
  defaultValue,
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
 * @param {string} options.name JSON-API name of the attribute
 * @param {(date|function)} options.default Default value for this attribute
 */
type dateDefault = (any) => Date | Date;
export const date = (
  { name, default: defaultValue }: { name?: string, default?: dateDefault } = {}
) => attribute({
  isType: (value) => (
    Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())
  ),
  cast: (value) => {
    try {
      return new Date(value);
    } catch (e) {
      return null;
    }
  },
  nullable: true,
  name,
  defaultValue,
});

/**
 * Defines an attribute that is coerced into a boolean
 * @function
 * @example
 * class Person {
 *   static attributes = {
 *     isSubscribed: Attr.boolean({ name: 'is-subscribed', default: true }),
 *   };
 * }
 *
 * const person = new Person(data);
 * person.isSubscribed // => false
 *
 * const blank = new Person({});
 * blank.isSubscribed // => true
 * @param {Object} options
 * @param {string} options.name JSON-API name of the attribute
 * @param {(boolean|function)} options.default Default value for this attribute
 */
type booleanDefault = (any) => boolean | boolean;
export const boolean = (
  { name, default: defaultValue }: { name?: string, default?: booleanDefault } = {}
) => attribute({
  isType: (value) => typeof value === 'boolean',
  cast: (value) => {
    if (/^(true|1)$/i.test(value)) return true;
    if (/^(false|0)$/i.test(value)) return false;
    return Boolean(value);
  },
  nullable: true,
  name,
  defaultValue,
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
 * person.interests // => ['tennis', 'squash']
 *
 * const blank = new Person({});
 * blank.interests // => []
 * @param {Object} options
 * @param {string} options.name JSON-API name of the attribute
 * @param {(array|function)} options.default Default value for this attribute
 */
type arrayDefault = (any) => Array<any> | Array<any>;
export const array = (
  { name, default: defaultValue }: { name?: string, default?: arrayDefault } = {}
) => attribute({
  isType: (value) => Array.isArray(value),
  cast: (value) => [value],
  nullable: true,
  name,
  defaultValue,
});

/**
 * Defines an attribute that is coerced into a object
 * @function
 * @example
 * class Person {
 *   static attributes = {
 *     isSubscribed: Attr.boolean({ name: 'is-subscribed', default: {} }),
 *   };
 * }
 *
 * const person = new Person(data);
 * person.isSubscribed // => false
 *
 * const blank = new Person({});
 * blank.isSubscribed // => true
 * @param {Object} options
 * @param {string} options.name JSON-API name of the attribute
 * @param {(object|function)} options.default Default value for this attribute
 */
export const object = (
  { name, default: defaultValue }: { name?: string, default?: any } = {}
) => attribute({
  isType: (value) => typeof value === 'object',
  cast: () => ({}),
  nullable: true,
  name,
  defaultValue,
});
