import { defineRelationship } from '../../src/model/relationship';

describe('defineRelationship()', () => {
  let context;

  /* There has got to be a better way... */
  const userData = { type: 'users', id: 1 };
  const postsData = [
    { type: 'posts', id: 1 },
    { type: 'posts', id: 2 },
  ];
  const data = {
    relationships: {
      user: { data: userData },
      posts: { data: postsData },
    }
  };
  const user = {};
  const posts = [{}];
  const find = jest.fn(() => user);
  const findAll = jest.fn(() => posts);
  const lastCall = (mockFn) => mockFn.mock.calls[mockFn.mock.calls.length -1];

  class Example {
    static find = find;
    static findAll = findAll;
    constructor(data) { this.data = data; }
  }

  describe('hasOne', () => {
    const key = 'user';
    beforeEach(() => { context = class extends Example {} });

    test('reads the relationship', () => {
      defineRelationship({ context, key, array: false });
      expect(new context(data).user).toBe(user);
    });

    test('calls constructor.find() with the relationship', () => {
      defineRelationship({ context, key, array: false });
      expect(lastCall(find)[0]).toEqual(userData);
    });
  });

  describe('hasMany', () => {
    const key = 'posts';
    beforeEach(() => { context = class extends Example {} });

    test('reads the relationship', () => {
      defineRelationship({ context, key, array: true });
      expect(new context(data).posts).toBe(posts);
    });

    test('calls constructor.findAll() with the relationship', () => {
      defineRelationship({ context, key, array: true });
      expect(lastCall(findAll)[0]).toEqual(postsData);
    });
  });
});
