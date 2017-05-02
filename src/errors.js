export const missingStore = () => (
  new Error('A store has not been registered in the Registry')
);

export const invalidAttribute = (field) => (
  new Error(`${field} needs an attribute type`)
);
