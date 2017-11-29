import qs from 'qs';

export extension from './reducer';
export * from './reducer';

export const queryEndpoint = (endpoint, query) => {
  let queryString = query;
  if (typeof query !== 'string') {
    queryString = qs.stringify(query);
  }
  return `${endpoint}?${queryString}`;
};
