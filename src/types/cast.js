export const serialize = {
  string: ({ default }) => (obj) => (
    yup.string().default(default).cast(obj)
  ),
  number: ({ default }) => (obj) => (
    yup.number().default(default).cast(obj)
  ),
  date: ({ default }) => (obj) => (
    yup.date().default(default).cast(obj)
  ),
  boolean: ({ default }) => (obj) => (
    yup.boolean().default(default).cast(obj)
  ),
  shape: ({ schema, default }) => (obj) => (
    yup.object().shape(obj).default(default).cast(obj)
  ),
  array: ({ type, default }) => (obj) => (
    yup.array().of(type).default(default).cast(obj)
  ),
};

const passThrough = (value) => value;

export const deserialize = {
  string: passThrough,
  number: passThrough,
  date: (value) => value.toISOString(),
  boolean: passThrough,
  shape: passThrough,
  array: passThrough,
};
