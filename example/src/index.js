import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { bind } from 'active-redux';

import './index.css';
import createStore from './configureStore';
import App from './app';

let store = createStore();
bind(store);

ReactDOM.render(
  <Provider store={store}><App /></Provider>,
  document.getElementById('root')
);
