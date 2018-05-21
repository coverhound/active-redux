/**
 * @module active-redux/api
 */

import imm from 'object-path-immutable';

import {
  createAction,
  apiClient,
  clearResources,
  decrementProperty,
  incrementProperty,
  markPendingResources,
  mergeResources,
  resourcesArray,
} from './utils';

import namespace from './namespace';

const initialState = {
  resources: {},
  apiConfig: {},
  isCreating: 0,
  isReading: 0,
  isUpdating: 0,
  isDeleting: 0,
};

/**
 * Action constants
 */
const API_CONFIGURE: string = 'AR_API_CONFIGURE';
const API_CLEAR: string = 'AR_API_CLEAR';
const API_HYDRATE: string = 'API_HYDRATE';

const API_WILL_READ: string = 'AR_API_WILL_READ';
const API_READ_DONE: string = 'AR_API_READ_DONE';
const API_READ_FAILED: string = 'AR_API_READ_FAILED';

const API_WILL_CREATE: string = 'AR_API_WILL_CREATE';
const API_CREATE_DONE: string = 'AR_API_CREATE_DONE';
const API_CREATE_FAILED: string = 'AR_API_CREATE_FAILED';

const API_WILL_UPDATE: string = 'AR_API_WILL_UPDATE';
const API_UPDATE_DONE: string = 'AR_API_UPDATE_DONE';
const API_UPDATE_FAILED: string = 'AR_API_UPDATE_FAILED';

const API_WILL_DELETE: string = 'AR_API_WILL_DELETE';
const API_DELETE_DONE: string = 'AR_API_DELETE_DONE';
const API_DELETE_FAILED: string = 'AR_API_DELETE_FAILED';

/**
 * Actions
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
export const apiConfigure = createAction(API_CONFIGURE);

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
export const apiClear = createAction(API_CLEAR);

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
export const apiHydrate = createAction(API_HYDRATE);

const apiWillCreate = createAction(API_WILL_CREATE);
const apiCreateDone = createAction(API_CREATE_DONE);
const apiCreateFailed = createAction(API_CREATE_FAILED);

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
      ...getState()[namespace.value].apiConfig,
      method: 'POST',
      data: { data: resource }
    },
    endpoint,
    dispatch,
    success: apiCreateDone,
    failure: apiCreateFailed,
  });
};

const apiWillRead = createAction(API_WILL_READ);
const apiReadDone = createAction(API_READ_DONE);
const apiReadFailed = createAction(API_READ_FAILED);

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
      ...getState()[namespace.value].apiConfig,
      method: 'GET',
      data: { data: resource }
    },
    endpoint,
    dispatch,
    success: apiReadDone,
    failure: apiReadFailed,
  });
};

const apiWillUpdate = createAction(API_WILL_UPDATE);
const apiUpdateDone = createAction(API_UPDATE_DONE);
const apiUpdateFailed = createAction(API_UPDATE_FAILED);

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
        ...getState()[namespace.value].apiConfig,
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

const apiWillDelete = createAction(API_WILL_DELETE);
const apiDeleteDone = createAction(API_DELETE_DONE);
const apiDeleteFailed = createAction(API_DELETE_FAILED);

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
      ...getState()[namespace.value].apiConfig,
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

const map = {
  [API_CONFIGURE]: (state, { payload: apiConfig }) => (
    imm(state).set('apiConfig', apiConfig).value()
  ),
  [API_CLEAR]: (state, { payload: type }) => (
    clearResources(state, type)
  ),
  [API_HYDRATE]: (state, { payload: resources }) => (
    mergeResources(state, resources)
  ),

  [API_WILL_CREATE]: (state) => (
    incrementProperty(state, 'isCreating')
  ),
  [API_CREATE_DONE]: (state, { payload: resources }) => {
    const newState = mergeResources(state, resources);
    return decrementProperty(newState, 'isCreating');
  },
  [API_CREATE_FAILED]: (state) => (
    decrementProperty(state, 'isCreating')
  ),

  [API_WILL_READ]: (state) => (
    incrementProperty(state, 'isReading')
  ),
  [API_READ_DONE]: (state, { payload: resources }) => {
    const newState = mergeResources(state, resources);
    return decrementProperty(newState, 'isReading');
  },
  [API_READ_FAILED]: (state) => (
    decrementProperty(state, 'isReading')
  ),

  [API_WILL_UPDATE]: (state, { payload: resources }) => {
    const newState = incrementProperty(state, 'isUpdating');
    return markPendingResources(newState, resources);
  },
  [API_UPDATE_DONE]: (state, { payload: resources }) => {
    const newState = mergeResources(state, resources);
    return decrementProperty(newState, 'isUpdating');
  },
  [API_UPDATE_FAILED]: (state) => (
    decrementProperty(state, 'isUpdating')
  ),

  [API_WILL_DELETE]: (state, { payload: resources }) => {
    const newState = incrementProperty(state, 'isDeleting');
    return markPendingResources(newState, resources);
  },
  [API_DELETE_DONE]: (state, { payload: resources }) => {
    const newState = clearResources(state, resourcesArray(resources.data));
    return decrementProperty(newState, 'isDeleting');
  },
  [API_DELETE_FAILED]: (state) => (
    decrementProperty(state, 'isDeleting')
  ),
};

export default { initialState, map };
