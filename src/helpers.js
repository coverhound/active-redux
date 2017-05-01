export const deepPartialEqual = (obj1, obj2) =>
  Object.entries(obj1).reduce((equal, [key, value]) => {
    if (typeof value === 'object' && !Array.isArray(value)) {
      return deepPartialEqual(value, obj2[key]);
    }

    if (value !== obj2[key]) {
      return false;
    }

    return equal;
  }, true);
