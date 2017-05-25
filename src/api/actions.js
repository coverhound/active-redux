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
export const remoteClear = createAction(ActionTypes.REMOTE_CLEAR);
export const remoteHydrate = createAction(ActionTypes.REMOTE_HYDRATE);

const remoteWillCreate = createAction(ActionTypes.REMOTE_WILL_CREATE);
const remoteCreateDone = createAction(ActionTypes.REMOTE_CREATE_DONE);
const remoteCreateFailed = createAction(ActionTypes.REMOTE_CREATE_FAILED);
export const remoteCreate = ({ resource, endpoint = resource.type }) => (dispatch, getState) => {
  dispatch(remoteWillCreate(resource));
  return wrappedApiRequest({
    resource,
    options: {
      ...getState().remote.apiConfig,
      method: 'POST',
      data: { data: resource }
    },
    endpoint,
    dispatch,
    success: remoteCreateDone,
    failure: remoteCreateFailed,
  });
};

const remoteWillRead = createAction(ActionTypes.REMOTE_WILL_READ);
const remoteReadDone = createAction(ActionTypes.REMOTE_READ_DONE);
const remoteReadFailed = createAction(ActionTypes.REMOTE_READ_FAILED);
export const remoteRead = ({ resource, endpoint = resource.type }) => (dispatch, getState) => {
  dispatch(remoteWillRead(resource));
  return wrappedApiRequest({
    resource,
    options: {
      ...getState().remote.apiConfig,
      method: 'GET',
      data: { data: resource }
    },
    endpoint,
    dispatch,
    success: remoteReadDone,
    failure: remoteReadFailed,
  });
};

const remoteWillUpdate = createAction(ActionTypes.REMOTE_WILL_UPDATE);
const remoteUpdateDone = createAction(ActionTypes.REMOTE_UPDATE_DONE);
const remoteUpdateFailed = createAction(ActionTypes.REMOTE_UPDATE_FAILED);
export const remoteUpdate = ({ resource, endpoint = `${resource.type}${resource.id}` }) => (
  (dispatch, getState) => {
    dispatch(remoteWillUpdate(resource));
    return wrappedApiRequest({
      resource,
      options: {
        ...getState().remote.apiConfig,
        method: 'PATCH',
        data: { data: resource }
      },
      endpoint,
      dispatch,
      success: remoteUpdateDone,
      failure: remoteUpdateFailed,
    });
  }
);

const remoteWillDelete = createAction(ActionTypes.REMOTE_WILL_DELETE);
const remoteDeleteDone = createAction(ActionTypes.REMOTE_DELETE_DONE);
const remoteDeleteFailed = createAction(ActionTypes.REMOTE_DELETE_FAILED);
export const remoteDelete = ({ resource, endpoint = `${resource.type}${resource.id}` }) => (
  (dispatch, getState) => {
    const options = {
      ...getState().remote.apiConfig,
      method: 'DELETE',
    };

    dispatch(remoteWillDelete(resource));
    return apiClient(endpoint, options).then((json) => {
      dispatch(remoteDeleteDone(resource));
      return Promise.resolve(json);
    }).catch((error) => {
      const err = error;
      err.resource = resource;

      dispatch(remoteDeleteFailed(err));
      return Promise.reject(err);
    });
  }
);
