# Active Redux

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

#### Resources can be local or remote

We should be able to have local and remote resources. Sometimes we want to be
able to interact with resources locally for an extended period of time before
persisting them via an API.

## Models

Models are an object that read from a JSON-API resource. They define their own
attributes, know their relationships and can both read and persist information.

Here's how you use models:


#### 1. Define and register the model

```js
// models/person.js
import { Registry, Model, Attr } from 'active-redux';

class Person extends Model {
  static type = 'people'; // corresponds to JSON-API type
  static api = {          // overridable API endpoints - defaults to type
    create: 'people',
    read: 'people',
    update: 'people/:id',
    delete: 'people/:id'
  };
  static attributes = {
    name: Attr.string({ default: 'Joe Schmoe '}),
    posts: Attr.hasMany('Post'), // The model this corresponds to
  };

  get firstName() {
    return this.name.split(' ')[0] // this.name as well as other attributes are
  }                                // defined when the model is registered
}

Registry.register(Person);
```

Models need to be registered to call hooks like defining attribute methods and
setting the store.

#### 2. Assign the store to the Registry

```js
// wherever the store is set
import { createStore } from 'redux';
import { Registry, reducers } from 'active-redux';
import myReducer from 'app/reducers';

const store = createStore(myReducer, ...reducers);
Registry.store = store;
```

This gives models access to the store for querying.


#### Use the Model
```
// anywhere
import { Registry } from 'active-redux';

const Person = Registry.get('Person');
const joe = Person.find(5)
// => <Person>
```

## The Reducers

(more to come)
