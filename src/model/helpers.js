const deepPartialEqual = (obj1, obj2) => (
  Object.entries(obj1).reduce((equal, [key, value]) => {
    if (equal === false) return equal;
    if (obj2 === undefined) return false;

    if (typeof value === 'object' && !Array.isArray(value)) {
      return deepPartialEqual(value, obj2[key]);
    }

    if (value !== obj2[key]) return false;

    return equal;
  }, true)
);

export const parseParams = (context, string) => {
  const regexp = /:[^/.]+/g;
  return string.replace(regexp, (match) => context[match.substring(1)]);
};

export const queryData = (entities, query) => (
  entities.filter((entity) => (
    Object.entries(query).reduce((match, [queryKey, queryValue]) => {
      if (match === false) return match;

      const entityValue = entity[queryKey];

      if (Array.isArray(queryValue)) {
        return queryValue.includes(entityValue);
      }
      if (typeof queryValue === 'object') {
        return deepPartialEqual(queryValue, entityValue);
      }
      return queryValue === entityValue;
    }, true)
  ))
);
