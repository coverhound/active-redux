import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { api } from 'active-redux';

export default (initialState) => createStore(
  combineReducers({ api: api.reducer }),
  initialState,
  applyMiddleware(thunk),
);
