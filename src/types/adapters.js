const yup = () => ({
  cast(yupObject, object) {
    yup.schema(yupObject).cast(object)
  }
});

export default {
  yup,
};
