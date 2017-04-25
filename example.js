import types from 'ch-json-api';

const Person = {
  name: types.string({ default: 'foo' }),
  name: yup.string().default(''),
}
