import yup from 'yup';

export const string = ({ default: defaultValue } = {}) => (obj) => (
  yup.string().default(defaultValue).nullable().cast(obj)
);

export const number = ({ default: defaultValue } = {}) => (obj) => (
  yup.number().default(defaultValue).nullable().cast(obj)
);

export const date = ({ default: defaultValue } = {}) => (obj) => {
  if (obj === undefined) return defaultValue;
  if (obj === null) return obj;
  if (typeof obj === 'number') return new Date(obj);
  return yup.date().cast(obj)
};

export const boolean = ({ default: defaultValue } = {}) => (obj) => (
  typeof obj === 'string' ?
    Boolean(obj) :
    yup.boolean().default(defaultValue).nullable().cast(obj)
);

export const array = () => (obj) => (
  Array.isArray(obj) ? obj : [obj]
);

export const object = () => (obj) => (
  typeof obj === 'object' ? obj : {}
);

