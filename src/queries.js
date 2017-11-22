import Registry from './registry';
import Store from './store';

/**
 * @module active-redux/queries
 */

/**
 * Instantiate JSON-API data with its corresponding Model
 * @private
 */
const initModel = (Model) => (data) => data && new Model(data);

/**
 * Map JSON-API data with to corresponding Model
 * @private
 */
const mapModel = (model) => (arr) => arr.map(initModel(model));

const newPromise = (promise, mapper) => (
  new Promise((resolve, reject) => promise.then(mapper).then(resolve).catch(reject))
);

const wrapPromise = ({ array = true, type, promise }) => {
  const mapper = (array ? mapModel : initModel)(Registry.get(type));
  const wrappedPromise = newPromise(promise, mapper);

  return wrappedPromise;
};

/**
* Gets all of that resource
* @function
* @example
* Person.all()
* // => Promise<Array<Person>>
* @return {Promise<Array<Model>>} Array of model instances
*/
export const all = (model) => () => (
  wrapPromise({
    query: 'all',
    type: model.type,
    array: true,
    promise: Store.all({ model }),
  })
);

/**
* Queries the store for that resource
* @function
* @example
* Person.where({ name: "Joe" })
* // => Promise<Array<Person>>
* @param {Object} query - Query for the store
* @param {Object} [options]
* @param {boolean} [options.remote] - Call to API if no records found?
* @return {Promise<Array<Model>>} Array of model instances
*/
export const where = (model) => (query = {}, options = {}) => (
  wrapPromise({
    query,
    type: model.type,
    array: true,
    promise: Store.where(query, { model, ...options }),
  })
);

/**
* Gets one of that resource
* @function
* @example
* Person.find({ id: 5 })
* // => Promise<Person>
* @param {Object} query - Query for the store
* @param {Object} [options]
* @param {boolean} [options.remote] - Call to API if no records found?
* @return {Promise<Model|null>} A model instance
*/
export const find = (model) => (query = {}, options = {}) => (
  wrapPromise({
    query,
    type: model.type,
    array: false,
    promise: Store.find(query, { model, ...options }),
  })
);

export const hasMany = (model) => (data) => {
  const id = data.map((d) => d.id);

  return wrapPromise({
    query: { id },
    type: model.type,
    array: true,
    promise: Store.where({ id }, { model })
  });
};

export const hasOne = (model) => (data) => {
  const id = data.id;

  return wrapPromise({
    query: { id },
    type: model.type,
    array: false,
    promise: Store.find({ id }, { model })
  });
};
