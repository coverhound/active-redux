import * as ActionTypes from './constants';
import { createAction, apiClient } from './utils';

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

export const apiConfigure = createAction(ActionTypes.API_CONFIGURE);
export const apiClear = createAction(ActionTypes.API_CLEAR);
export const apiHydrate = createAction(ActionTypes.API_HYDRATE);

const apiWillCreate = createAction(ActionTypes.API_WILL_CREATE);
const apiCreateDone = createAction(ActionTypes.API_CREATE_DONE);
const apiCreateFailed = createAction(ActionTypes.API_CREATE_FAILED);
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
