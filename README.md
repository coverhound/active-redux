# Active Redux

## [Documentation](https://coverhound.github.io/active-redux/1.0.0)

The goal of this project is to stop bikeshedding API interactions on the
frontend. We want an Active Record for Redux that works nicely with other
reducers and doesn't require its own store.

This project depends on:
- A JSON-API spec backend
- `redux` and `redux-thunk`

## Core Ideas

#### Resources should have models

We want to be able to interact with objects that know about their relationships
with other objects, can house resource-specific information (how to read a date,
how to put `firstName` and `lastName` together) and are able to persist
themselves.

## Models

Models are an object that read from a JSON-API resource. They define their own
attributes, know their relationships and can both read and persist information.

Here's how you use models:


#### 1. Define the model

```js
// models/person.js
import AR, { Attr } from 'active-redux';

const Person = AR.define('people', class Person {
  static endpoints = {    // overridable API endpoints - defaults to type
    create: 'people',
    read: 'people',
    update: 'people/:id',
    delete: 'people/:id'
  };
  static attributes = {
    name: Attr.string({ default: 'Joe Schmoe '}),
    posts: Attr.hasMany('articles'), // The JSON-API type of the relation
    employer: Attr.hasOne('companies'),
  };

  get firstName() {
    return this.name.split(' ')[0] // this.name as well as other attributes are
  }                                // defined when the model is registered
});
```


#### 2. Bind Active Redux to the store

```js
// wherever the store is set
import { createStore, combineReducers } from 'redux';
import AR, { reducer: api } from 'active-redux';
import reducers from 'app/reducers';

const store = createStore(
  combineReducers({ api, ...reducers }),
);
AR.bind(store);
```

This gives models access to the store for querying.


#### Use the Model

```js
// anywhere
import Person from 'models/person';
const joe = Person.find(5)
// => Promise<Person>
```

## [The Reducers](https://coverhound.github.io/active-redux/1.0.0/module-active-redux_api.html)
