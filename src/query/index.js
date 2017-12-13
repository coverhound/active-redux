import { createSelector } from 'reselect';

import Store from '../store';
import { getProperty } from '../api/utils';
import { apiIndexAsync } from '../indexing';
import { apiRead } from '../api';
import { generateEndpoint, createQuerySelector } from './utils';

/**
 * @module active-redux/query
 */

const toModel = (Model) => (data = null) => (data ? new Model(data) : data);
const mapToModel = (Model) => (data = []) => {
  const result = data.map((item) => toModel(Model)(item));
  result.isFetching = data.isFetching;
  return result;
};

export default class QueryProxy {
  constructor(model) {
    this.store = Store;
    this.model = model;

    this.init = toModel(model);
    this.map = mapToModel(model);
  }

  get resource() {
    return this.model.type;
  }

  /**
   * @private
   */
  __peek = (id) => getProperty(this.store.state, this.resource, id);
  /**
   * Checks local store for resource with id
   * @param {Number|String} id
   * @return {Model}
   */
  peek = (id) => this.init(this.__peek(id));

  /**
   * @private
   */
  __find = (id) => (
    this.store.dispatch(apiRead({
      resource: this.model,
      endpoint: `${this.model.endpoint('read')}/${id}`,
    }))
  );
  /**
   * Makes async resquest for resource with id
   * @param {Number|String} id
   * @return {Promise<Model>}
   */
  find = (id) => this.__find(id).then(() => this.peek(id));

  /**
   * @private
   */
  __select = (id) => createSelector(
    () => this.__peek(id),
    (resource) => this.init(resource),
  );
  /**
   * Returns a selector creator
   * @param {Number|String} id
   * @return {QuerySelectorCreator}
   * @example
   * import { Comment } from '@models';
   * import View from './view';
   *
   * mapStateToProps = () => {
   *   const commentFind = Comment.select;
   *   return (state, props) => ({
   *     comment: commentFind(props.id)(state)
   *   });
   * };
   *
   * mapDispatchToProps = () => ({});
   *
   * export default connect(mapStateToProps, mapDispatchToProps)(View)
   */
  get select() {
    return createQuerySelector(this.find, this.__select);
  }

  __peekAll = () => Object.values(this.store.state[this.resource] || {});
  /**
   * Return all of that resource from store
   * @return {Array<Model>}
   */
  peekAll = () => this.map(this.__peekAll());

  __findAll = () => this.store.dispatch(apiRead({ resource: this.model }));
  /**
   * Fetch that resource from the API
   * @return {Promise<Array<Model>>}
   */
  findAll = () => this.__findAll().then(() => this.peekAll());

  __selectAll = () => createSelector(
    () => this.__peekAll(),
    (resource) => this.map(resource),
  );
  /**
   * Returns a selector creator for Resource#findAll
   * @return {QuerySelectorCreator<Promise<Array<Model>>>}
   * @example
   * import { Comment } from '@models';
   * import View from './view';
   *
   * mapStateToProps = () => {
   *   const commentFindAll = Comment.selectAll;
   *   return (state) => ({
   *     comments: commentFindAll()(state)
   *   });
   * };
   *
   * mapDispatchToProps = () => ({});
   *
   * export default connect(mapStateToProps, mapDispatchToProps)(View)
   */
  get selectAll() {
    return createQuerySelector(this.findAll, this.__selectAll);
  }

  __query = (query, { endpoint = this.model.endpoint('read') }) => {
    const queryEndpoint = generateEndpoint(endpoint, query);
    return this.store.dispatch(apiRead({
      resource: this.model,
      endpoint: queryEndpoint,
    })).then(({ data = [] }) => data);
  };
  /**
   * Fetch the resources via query to the API
   * @return {Promise<Array<Model>>}
   */
  query = (query, { endpoint } = {}) => (
    this.__query(query, { endpoint }).then(this.map)
  );

  __selectQuery = (query, { endpoint } = {}) => createSelector(
    (state) => state.api.indices[endpoint],
    (state) => state.api.resources[this.resource],
    (index = []) => {
      const results = index.map(({ id }) => this.peek(id));
      results.isFetching = index.isFetching;
      return results;
    },
  );
  __selectQueryPromise = (query, { endpoint } = {}) => {
    const promise = this.query(query, { endpoint });
    this.store.dispatch(apiIndexAsync({
      hash: endpoint,
      promise,
    }));
    return promise;
  };
  /**
   * Returns a selector creator for Resource#query
   * @return {QuerySelectorCreator<Promise<Array<Model>>>}
   * @example
   * import { Comment } from '@models';
   * import View from './view';
   *
   * mapStateToProps = () => {
   *   const commentQuery = Comment.selectQuery;
   *   return (state, props) => ({
   *     comments: commentFindAll(
   *       { page: props.page },
   *       { endpoint: `articles/${props.articleId}/comments` },
   *     )(state)
   *   });
   * };
   *
   * mapDispatchToProps = () => ({});
   *
   * export default connect(mapStateToProps, mapDispatchToProps)(View)
   */
  get selectQuery() {
    return createQuerySelector(this.__selectQueryPromise, this.__selectQuery);
  }
}
