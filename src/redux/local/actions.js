import * as ActionTypes from './constants';
import { createAction } from '../utils';

export const localClear = createAction(ActionTypes.LOCAL_CLEAR);
export const localHydrate = createAction(ActionTypes.LOCAL_HYDRATE);
export const localCreate = createAction(ActionTypes.LOCAL_CREATE);
export const localRead = createAction(ActionTypes.LOCAL_READ);
export const localUpdate = createAction(ActionTypes.LOCAL_UPDATE);
export const localDelete = createAction(ActionTypes.LOCAL_DELETE);
