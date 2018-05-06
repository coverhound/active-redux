import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { Attr, bind, define } from 'active-redux';
import QueryProxy from 'active-redux/query';
import createMockStore from 'fixtures/store';

describe('QueryProxy', () => {
  let mockStore = createMockStore();

  beforeEach(() => {
    mockStore = createMockStore();
    bind(mockStore);
  });
  const mockAxios = new MockAdapter(axios);
  const blankPromise = new Promise(() => {});
  const httpHeaders = { 'content-type': 'application/json' };

  const Comment = define('comments', class Comment {});
  const Person = define('people', class Person {
    static attributes = { comments: Attr.hasMany('comments') }
  });
  const CommentProxy = new QueryProxy(Comment);
  const PersonProxy = new QueryProxy(Person);


  describe('#peek()', () => {
    it('returns the resource', () => {
      const result = CommentProxy.peek(5);
      expect(result).toMatchSnapshot();
    });
  });

  describe('#find()', () => {
    const remoteComment = Object.assign({}, mockStore.getState().api.resources.comments['5'], {
      attributes: { body: '[redacted]' },
    });

    test('it resolves to all resources in the store', async () => {
      mockAxios.onGet().replyOnce(200, { data: remoteComment }, httpHeaders);
      const results = await CommentProxy.find(5);
      expect(results).toMatchSnapshot();
    });
  });

  describe('#select()', () => {
    const remoteComment = Object.assign({}, mockStore.getState().api.resources.comments['5'], {
      attributes: { body: '[redacted]' },
    });

    test('while fetching if the resource is not in the store, it resolves to null', () => {
      mockAxios.onGet().replyOnce(() => blankPromise);
      const response = CommentProxy.select(1)(mockStore.getState());
      expect(response).toBe(null);
    });

    test('while fetching if the resource is in the store, it returns that resource', () => {
      mockAxios.onGet().replyOnce(() => blankPromise);
      const response = CommentProxy.select(5)(mockStore.getState());
      expect(response).toMatchSnapshot();
    });

    test('after fetching it returns the fetched resource', async () => {
      mockAxios.onGet().replyOnce(200, { data: remoteComment }, httpHeaders);
      const selector = CommentProxy.select(5);
      await new Promise((res) => setTimeout(res, 100));

      const response = selector(mockStore.getState());
      expect(response.data).toEqual(remoteComment);
    });
  });

  describe('#peekAll()', () => {
    it('returns the resources', () => {
      const response = PersonProxy.peekAll();
      expect(response).toMatchSnapshot();
    });
  });

  describe('#findAll()', () => {
    const remoteComments = [{
      type: 'comments',
      id: '132',
      attributes: { body: 'nice' },
    }, {
      type: 'comments',
      id: '215',
      attributes: { body: 'eh' },
    }];

    test('it resolves to the fetched resources', async () => {
      mockAxios.onGet().replyOnce(200, { data: remoteComments }, httpHeaders);
      const results = await CommentProxy.findAll();
      expect(results).toMatchSnapshot();
    });
  });

  describe('#selectAll()', () => {
    const remoteComments = [{
      type: 'comments',
      id: '132',
      attributes: { body: 'nice' },
    }, {
      type: 'comments',
      id: '215',
      attributes: { body: 'eh' },
    }];

    test('while fetching it returns what\'s in the store', () => {
      mockAxios.onGet().replyOnce(() => blankPromise);
      const response = CommentProxy.selectAll()(mockStore.getState());
      expect(response).toMatchSnapshot();
    });

    test('after fetching returns what\'s in the store', async () => {
      mockAxios.onGet().replyOnce(200, { data: remoteComments }, httpHeaders);
      const selector = CommentProxy.selectAll();
      await new Promise((res) => setTimeout(res, 100));

      const results = selector(mockStore.getState());
      expect(results).toMatchSnapshot();
    });
  });

  describe('#query()', () => {
    const remoteComments = [{
      type: 'comments',
      id: '140',
      attributes: { body: 'firetruck!' },
    }, {
      type: 'comments',
      id: '581',
      attributes: { body: 'fishing?' },
    }];
    const query = { page: 2, filter: { body: 'f*' } };
    const queryString = 'comments?page=2&filter%5Bbody%5D=f%2A';

    test('it resolves to the fetched resources', async () => {
      mockAxios.onGet(queryString).reply(200, { data: remoteComments }, httpHeaders);
      const results = await CommentProxy.query(query);
      expect(results).toMatchSnapshot();
    });
  });

  describe('#selectQuery()', () => {
    const remoteComments = [{
      type: 'comments',
      id: '140',
      attributes: { body: 'firetruck!' },
    }, {
      type: 'comments',
      id: '581',
      attributes: { body: 'fishing?' },
    }];
    const query = { page: 2, filter: { body: 'f*' } };
    const queryString = 'comments?page=2&filter%5Bbody%5D=f%2A';

    test('while fetching it returns what\'s in the store', () => {
      mockAxios.onGet(queryString).reply(() => blankPromise);
      const response = CommentProxy.selectQuery(query)(mockStore.getState());
      expect(response).toMatchSnapshot();
    });

    test('after fetching returns what\'s in the store', async () => {
      mockAxios.onGet(queryString).reply(200, { data: remoteComments }, httpHeaders);
      const selector = CommentProxy.selectQuery(query);
      await new Promise((res) => setTimeout(res, 100));

      const results = selector(mockStore.getState());
      expect(results).toMatchSnapshot();
      expect(results.isFetching).toBe(false);
    });
  });
});
