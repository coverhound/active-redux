import qs from 'qs';
import { createSelectorCreator, defaultMemoize } from 'reselect';

const isEqual = (a, b) => (
  typeof a === 'string' ?
    a === b :
    JSON.stringify(a) === JSON.stringify(b)
);

const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual,
);

/**
 * @alias module:active-redux.createQuerySelector
 * @function
 * @example
 *
 * import { createQuerySelector } from 'active-redux';
 * import { Comment } from '@models';
 *
 * const Comment = ({ comment }) => <p>{comment.body}</p>;
 *
 * // needed in order to have a unique selector per instance of the component
 * const mapStateToProps = () => {
 *   const querySelector = createQuerySelector(Comment, 'find');
 *   return (state, props) => ({
 *     // Arguments passed into querySelector are passed to `Comment#find`
 *     // and turned into a selector
 *     comments: querySelector(props.commentId)(state)
 *   });
 * };
 *
 * const mapDispatchToProps = () => ({});
 *
 * export default connect(mapStateToProps, mapDispatchToProps)(Comment);
 */
export const createQuerySelector = (promise, selector) => createDeepEqualSelector(
  (...args) => args,
  (args) => {
    promise(...args);
    const out = selector(...args);
    out.promise = promise;
    return out;
  }
);

export const generateEndpoint = (endpoint, query) => {
  let queryString = query;
  if (typeof query !== 'string') {
    queryString = qs.stringify(query);
  }
  return `${endpoint}?${queryString}`;
};
