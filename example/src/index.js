import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import createStore from './configureStore';
import { Registry, Model } from '../../dist';

let store = createStore();
Registry.store = store;

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
