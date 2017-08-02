// we can remove the yup dependency, in all likelyhood
import yup from 'yup';

export const hasOne = (resource) => ({
  type: 'relationship',
  array: false,
  resource,
});

export const hasMany = (resource) => ({
  type: 'relationship',
  array: true,
  resource,
});

export const string = ({ default: defaultValue } = {}) => ({
  type: 'attribute',
  cast: (obj) => yup.string().default(defaultValue).nullable().cast(obj),
});

export const number = ({ default: defaultValue } = {}) => ({
  type: 'attribute',
  cast: (obj) => yup.number().default(defaultValue).nullable().cast(obj),
});

export const date = ({ default: defaultValue } = {}) => ({
  type: 'attribute',
  cast: (obj) => {
    if (obj === undefined) return defaultValue;
    if (obj === null) return obj;
    if (typeof obj === 'number') return new Date(obj);
    return yup.date().cast(obj)
  },
});

export const boolean = ({ default: defaultValue } = {}) => ({
  type: 'attribute',
  cast: (obj) => (
    typeof obj === 'string' ?
      Boolean(obj) :
      yup.boolean().default(defaultValue).nullable().cast(obj)
  ),
});

export const array = () => ({
  type: 'attribute',
  cast: (obj) => Array.isArray(obj) ? obj : [obj],
});

export const object = () => ({
  type: 'attribute',
  cast: (obj) => (
    typeof obj === 'object' ? obj : {}
  ),
});
