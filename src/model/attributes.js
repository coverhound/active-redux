export const defineAttribute = ({ context, key, cast }) => {
  Object.defineProperty(context.prototype, key, {
    get() {
      return cast(this.data.attributes[key])
    },
  });
};
