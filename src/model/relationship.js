const defineHasOne = ({ context, key }) => {
  Object.defineProperty(context.prototype, key, {
    get() {
      const { data } = this.data.relationships[key];
      return this.constructor.find(data);
    },
  });
};

const defineHasMany = ({ context, key }) => {
  Object.defineProperty(context.prototype, key, {
    get() {
      const { data } = this.data.relationships[key];
      return this.constructor.findAll(data);
    },
  });
};

export const defineRelationship = ({ context, key, array }) => {
  array ? defineHasMany({ context, key }) : defineHasOne({ context, key });
};
