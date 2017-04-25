import { find, where } from 'actions';

const transformRelationships = (relationships) => {
  const obj = {};
};

const relationshipLookup = (target) => {
  const relationship = target.relationships[name].data;

  if (!Array.isArray(relationship)) {
    return find(relationship.type, relationship.id);
  }

  const values = Object.values(relationship);
  const type = values[0].type;
  const id = values.map((value) => value.id);
  return where(type, values);
};

const cast = (type, name, value) => {
  const casting = findCast(type, name);
  return casting(value);
};

// one way to handle exposing an object is to create a proxy decorator
// we probably wouldn't need a model at all here, we could just do this with objects on read
// and also prevent writes by not having setters
const Model = (jsonApiData) => new Proxy(jsonApiData, {
  get(target, name) {
    const { type } = jsonApiData;
    if (target.relationships[name]) return relationshipLookup(target);
    if (target.attributes[name]) return cast(type, name, target.attributes[name]);

    return undefined;
  },
  set() {},
  bindFunction(name, fn) {
    this[name] = fn.bind(this);
  },
});

const fromRecord = (model) => {
};

const toRecord = (model) => {
};

const Model = Record({

}, 'Model');


state = {
  resources: {
    coverages: {
      1: <Coverage>,
      2: <Coverage>
    }
  }
}
