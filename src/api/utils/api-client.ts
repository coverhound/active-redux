import axios from 'axios';
import createError from 'axios/lib/core/createError';

const jsonContentTypes = [
  'application/json',
  'application/vnd.api+json',
];

const validateContentType = (response) => {
  const contentType = response.headers['content-type'].split(';')[0];
  if (jsonContentTypes.includes(contentType)) return;

  throw createError(
    'Invalid Content-Type in response',
    response.config,
    null,
    response
  );
};

const mergeDefaults = (url, options) => ({
  ...options,
  url,
  headers: {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    ...options.headers,
  },
});

export default (url, options = {}) => (
  axios(mergeDefaults(url, options)).then((response) => {
    if (response.status === 204) return response;
    validateContentType(response);
    return response.data;
  })
);
