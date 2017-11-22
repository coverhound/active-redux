import * as ActionTypes from './constants';
import { createAction, apiClient } from './utils';
/**
 * @module active-redux/api
 */

const wrappedApiRequest = ({
  resource,
  options,
  endpoint,
  dispatch,
  success,
  failure,
}) => apiClient(endpoint, options).then((json) => {
  dispatch(success(json));
  return Promise.resolve(json);
}).catch((error) => {
  const err = error;
  err.resource = resource;

  dispatch(failure(err));
  return Promise.reject(err);
});

/**
 * Configure the API
 * @see {@link https://github.com/mzabriskie/axios#request-config}
 * @function
 * @param {Object} config - Axios configuration
 */
export const apiConfigure = createAction(ActionTypes.API_CONFIGURE);

/**
 * Clear an entity from the store
 * @function
 * @private
 * @example
 * import { api } from 'active-redux';
 *
 * state.api.people
 * // => Object<String: Person>
 *
 * dispatch(api.apiClear('people'))
 *
 * state.api.people
 * // => {}
 * @param {Object} data - JSON-API data
 */
export const apiClear = createAction(ActionTypes.API_CLEAR);

/**
 * Hydrate the store from JSON-API
 * @function
 * @example
 * import { api } from 'active-redux';
 *
 * state.api.people
 * // => {}
 *
 * const data = [{
 *   type: 'people',
 *   id: '5',
 *   attributes: {
 *     name: 'Joe',
 *     age: 35,
 *   }
 * }];
 *
 * dispatch(api.apiHydrate(data))
 *
 * state.api.people
 * // => Object<String: Person>
 * @param {Object} data - JSON-API data
 */
export const apiHydrate = createAction(ActionTypes.API_HYDRATE);

const apiWillCreate = createAction(ActionTypes.API_WILL_CREATE);
const apiCreateDone = createAction(ActionTypes.API_CREATE_DONE);
const apiCreateFailed = createAction(ActionTypes.API_CREATE_FAILED);

/**
 * Create a resource via API
 * @function
 * @example
 * import { api } from 'active-redux';
 * import Person from '../models/person';
 *
 * Person.find({ id: '5' });
 * // => Promise<null>
 *
 * const person = new Person({ attributes: { name: 'Joe' } });
 *
 * dispatch(api.apiCreate({ resource: person })).then((json) => {
 *   // do something with the response json
 * }).catch((error) => {
 *   // handle error
 * });
 *
 * Person.find({ id: '5' });
 * // => Promise<Person>
 * @param {Object} args
 * @param {define~Model} args.resource
 * @param {string} [args.endpoint]
 */
export const apiCreate = ({ resource, endpoint = resource.endpoint('create') }) => (dispatch, getState) => {
  dispatch(apiWillCreate(resource));
  return wrappedApiRequest({
    resource,
    options: {
      ...getState().api.apiConfig,
      method: 'POST',
      data: { data: resource }
    },
    endpoint,
    dispatch,
    success: apiCreateDone,
    failure: apiCreateFailed,
  });
};

const apiWillRead = createAction(ActionTypes.API_WILL_READ);
const apiReadDone = createAction(ActionTypes.API_READ_DONE);
const apiReadFailed = createAction(ActionTypes.API_READ_FAILED);

/**
 * Read a resource via API
 * @function
 * @example
 * import { api } from 'active-redux';
 * import Person from '../models/person';
 *
 * Person.all();
 * // => Promise<[]>
 *
 * dispatch(api.apiRead({ resource: Person })).then((json) => {
 *   // do something with the response json
 * }).catch((error) => {
 *   // handle error
 * });
 *
 * Person.all();
 * // => Promise<Array<Person>>
 * @param {Object} args
 * @param {Model} args.resource
 * @param {string} [args.endpoint]
 */
export const apiRead = ({ resource, endpoint = resource.endpoint('read') }) => (dispatch, getState) => {
  dispatch(apiWillRead(resource));
  return wrappedApiRequest({
    resource,
    options: {
      ...getState().api.apiConfig,
      method: 'GET',
      data: { data: resource }
    },
    endpoint,
    dispatch,
    success: apiReadDone,
    failure: apiReadFailed,
  });
};

const apiWillUpdate = createAction(ActionTypes.API_WILL_UPDATE);
const apiUpdateDone = createAction(ActionTypes.API_UPDATE_DONE);
const apiUpdateFailed = createAction(ActionTypes.API_UPDATE_FAILED);

/**
 * Update a resource via API
 * @function
 * @example
 * import { api } from 'active-redux';
 * import Person from '../models/person';
 *
 * Person.find({ id: '5' });
 * // => Promise<Person(id='5' name='Joe')>
 *
 * const person = new Person({ id: '5', attributes: { name: 'Jimmy' } });
 *
 * dispatch(api.apiUpdate({ resource: person })).then((json) => {
 *   // do something with the response json
 * }).catch((error) => {
 *   // handle error
 * });
 *
 * Person.find({ id: '5' });
 * // => Promise<Person(id='5' name='Jimmy')>
 * @param {Object} args
 * @param {Model} args.resource
 * @param {string} [args.endpoint]
 */
export const apiUpdate = ({ resource, endpoint = resource.endpoint('update') }) => (
  (dispatch, getState) => {
    dispatch(apiWillUpdate(resource));
    return wrappedApiRequest({
      resource,
      options: {
        ...getState().api.apiConfig,
        method: 'PATCH',
        data: { data: resource }
      },
      endpoint,
      dispatch,
      success: apiUpdateDone,
      failure: apiUpdateFailed,
    });
  }
);

const apiWillDelete = createAction(ActionTypes.API_WILL_DELETE);
const apiDeleteDone = createAction(ActionTypes.API_DELETE_DONE);
const apiDeleteFailed = createAction(ActionTypes.API_DELETE_FAILED);

/**
 * Delete a resource via API
 * @function
 * @example
 * import { api } from 'active-redux';
 * import Person from '../models/person';
 *
 * Person.find({ id: '5' });
 * // => Promise<Person(id='5')>
 *
 * const person = new Person({ id: '5' });
 *
 * dispatch(api.apiDelete({ resource: person })).then((json) => {
 *   // do something with the response json
 * }).catch((error) => {
 *   // handle error
 * });
 *
 * Person.find({ id: '5' });
 * // => Promise<null>
 * @param {Object} args
 * @param {Model} args.resource
 * @param {string} [args.endpoint]
 */
export const apiDelete = ({ resource, endpoint = resource.endpoint('delete') }) => (
  (dispatch, getState) => {
    const options = {
      ...getState().api.apiConfig,
      method: 'DELETE',
    };

    dispatch(apiWillDelete(resource));
    return apiClient(endpoint, options).then((json) => {
      dispatch(apiDeleteDone(resource));
      return Promise.resolve(json);
    }).catch((error) => {
      const err = error;
      err.resource = resource;

      dispatch(apiDeleteFailed(err));
      return Promise.reject(err);
    });
  }
);

const apiWillIndex = createAction(ActionTypes.API_WILL_INDEX);
const apiIndexDone = createAction(ActionTypes.API_INDEX_DONE);
export const apiIndexClear = createAction(ActionTypes.API_INDEX_CLEAR);

export const apiIndexAsync = ({ hash, promise }) => (dispatch, getState) => {
  const indexExists = () => getState().api.indices[hash];

  if (indexExists() && indexExists().isFetching) return promise;

  dispatch(apiWillIndex(hash));

  return promise.then((resources) => {
    if (!indexExists()) return resources;
    dispatch(apiIndexDone({ hash, resources }));
    return resources;
  });
};
export const apiIndexSync = ({ hash, resources }) => (dispatch) => {
  dispatch(apiWillIndex(hash));
  dispatch(apiIndexDone({ hash, resources }));
};
