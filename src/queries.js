import { createSelector } from 'reselect';
import { apiIndexAsync, apiIndexClear } from './api';

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

const createHash = (type, query) => {
  if (typeof query === 'string') return `${type}.${query}`;

  return Object.entries(query).reduce((hash, [key, value]) => (
    `${hash}.${key}=${value}`
  ), type);
};

const fromIndex = ({ id, type }) => {
  const Model = Registry.get(type);
  return new Model(Store.fromIndex({ id, type }));
};

const createArraySelector = ({ hash, type }) => createSelector(
  (state) => state.api.indices[hash],
  (state) => state.api.resources[type],
  (index = []) => {
    const newIndex = index.map(fromIndex);
    newIndex.isFetching = index.isFetching;
    return newIndex;
  },
);

const createSingleSelector = ({ hash, type }) => createSelector(
  (state) => state.api.indices[hash],
  (state) => state.api.resources[type],
  (index = []) => {
    const newIndex = index.map(fromIndex);
    return newIndex[0];
  },
);

const newPromise = (promise, mapper) => (
  new Promise((resolve, reject) => promise.then(mapper).then(resolve).catch(reject))
);

const wrapPromise = ({ query, array = true, type, promise }) => (dispatch) => {
  const hash = createHash(type, query);
  const selectorCreator = array ? createArraySelector : createSingleSelector;
  const mapper = (array ? mapModel : initModel)(Registry.get(type));
  const wrappedPromise = newPromise(promise, mapper);

  wrappedPromise.selector = selectorCreator({ hash, type });
  wrappedPromise.unsubscribe = () => dispatch(apiIndexClear(hash));

  dispatch(apiIndexAsync({ hash, promise }));

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
  })(Store.store.dispatch)
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
  })(Store.store.dispatch)
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
  })(Store.store.dispatch)
);

export const hasMany = (model) => (data) => {
  const id = data.map((d) => d.id);

  return wrapPromise({
    query: { id },
    type: model.type,
    array: true,
    promise: Store.where({ id }, { model })
  })(Store.store.dispatch);
};

export const hasOne = (model) => (data) => {
  const id = data.id;

  return wrapPromise({
    query: { id },
    type: model.type,
    array: false,
    promise: Store.find({ id }, { model })
  })(Store.store.dispatch);
};
