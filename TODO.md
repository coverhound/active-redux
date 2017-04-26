# Project Todo

## Objects

#### Model

`new` should return a Proxy object
`find` should return a Proxy object (and query the store)

`#unlock()` should return a local Proxy object

Should maybe have overrideable endpoint data?

Example:

```js
import { Registry, Model, Attr } from 'libname';

class Person extends Model {
  static type = 'people';
  static attributes = {
    name: Attr.string({ default: 'Joe Shmoe' }),
  }

  get firstName() {
    this.attributes.name.split(' ')[0]
  }
}

Registry.addModel(Person);
```

#### Registry

Thing that keeps track of Models, binds them to the store


#### Reducer

Manages local and remote state


#### Local Proxy

Has methods for attributes and relationships + querying, writes to local
entities

#### Remote Proxy

Readonly version of local proxy that reads from `remote`


## Actions

CRUD for local and remote
CRUD for API
