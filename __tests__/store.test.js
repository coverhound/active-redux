import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { Attr, bind, define } from 'active-redux';
import Store from 'active-redux/store';
import createMockStore from 'fixtures/store';

describe('Store', () => {
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

  describe('#store', () => {
    test('is the bound store', () => {
      expect(Store.store).toBe(mockStore);
    });
  });

  describe('#dispatch', () => {
    test('provides a getter for store dispatch', () => {
      expect(Store.dispatch).toBe(mockStore.dispatch);
    });
  });

  describe('#state', () => {
    test('provides a getter for store dispatch', () => {
      expect(Store.state).toBe(mockStore.getState().api.resources);
    });
  });

  describe('#peek()', () => {
    it('returns the resource', () => {
      const response = Store.peek(5, { model: Comment });
      expect(response).toMatchSnapshot();
    });
  });

  describe('#find()', () => {
    const remoteComment = Object.assign({}, mockStore.getState().api.resources.comments['5'], {
      attributes: { body: '[redacted]' },
    });

    test('it resolves to all resources in the store', async () => {
      mockAxios.onGet().replyOnce(200, { data: remoteComment }, httpHeaders);
      const results = await Store.find(5, { model: Comment });
      expect(results).toMatchSnapshot();
    });

    describe('selector', () => {
      test('while fetching if the resource is not in the store, it resolves to null', () => {
        mockAxios.onGet().replyOnce(() => blankPromise);
        const response = Store.find(1, { model: Comment }).selector(mockStore.getState());
        expect(response).toBe(null);
      });

      test('while fetching if the resource is in the store, it returns that resource', () => {
        mockAxios.onGet().replyOnce(() => blankPromise);
        const response = Store.find(5, { model: Comment }).selector(mockStore.getState());
        expect(response).toMatchSnapshot();
      });

      test('after fetching it returns the fetched resource', async () => {
        mockAxios.onGet().replyOnce(200, { data: remoteComment }, httpHeaders);
        const promise = Store.find(5, { model: Comment });
        await promise;

        const response = promise.selector(mockStore.getState());
        expect(response.data).toEqual(remoteComment);
      });
    });
  });

  describe('#peekAll()', () => {
    it('returns the resources', () => {
      const response = Store.peekAll({ model: Person });
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
      const results = await Store.findAll({ model: Comment });
      expect(results).toMatchSnapshot();
    });

    describe('selector', () => {
      test('while fetching it returns what\'s in the store', () => {
        mockAxios.onGet().replyOnce(() => blankPromise);
        const response = Store.findAll({ model: Comment }).selector(mockStore.getState());
        expect(response).toMatchSnapshot();
      });

      test('after fetching returns what\'s in the store', async () => {
        mockAxios.onGet().replyOnce(200, { data: remoteComments }, httpHeaders);
        const promise = Store.findAll({ model: Comment });
        await promise;

        const results = promise.selector(mockStore.getState());
        expect(results).toMatchSnapshot();
      });
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
      const results = await Store.query(query, { model: Comment });
      expect(results).toMatchSnapshot();
    });

    describe('selector', () => {
      test('while fetching it returns what\'s in the store', () => {
        mockAxios.onGet(queryString).reply(() => blankPromise);
        const response = Store.query(query, { model: Comment }).selector(mockStore.getState());
        expect(response).toMatchSnapshot();
      });

      test('after fetching returns what\'s in the store', async () => {
        mockAxios.onGet(queryString).reply(200, { data: remoteComments }, httpHeaders);
        const promise = Store.query(query, { model: Comment });
        await promise;

        const results = promise.selector(mockStore.getState());
        expect(results).toMatchSnapshot();
        expect(results.isFetching).toBe(false);
      });
    });
  });
});
