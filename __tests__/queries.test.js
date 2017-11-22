import { bind, define } from 'active-redux';
import * as Queries from 'active-redux/queries';
import mockStore from 'fixtures/store';

bind(mockStore);

describe('Queries', () => {
  const { getState } = mockStore;
  const Person = define('people', class Person {});

  describe('.all()', () => {
    it('returns all of that model', async () => {
      const people = await Queries.all(Person)();
      expect(people).toMatchSnapshot();
    });

    it('s selector returns an index reference', () => {
      const promise = Queries.all(Person)();
      const selector = promise.selector;

      const before = selector(getState());
      expect(before.isFetching).toBe(true);
      expect(before).toMatchSnapshot();

      return promise.then(() => {
        const after = selector(getState());
        expect(after.isFetching).toBe(false);
        expect(after).toMatchSnapshot();
      });
    });
  });

  describe('.where()', () => {
    it('returns some of that model', async () => {
      const people = await Queries.where(Person)({ id: '9' });
      expect(people).toMatchSnapshot();
    });

    it('s selector returns an index reference', () => {
      const promise = Queries.where(Person)({ id: '9' });
      const selector = promise.selector;

      const before = selector(getState());
      expect(before.isFetching).toBe(true);
      expect(before).toMatchSnapshot();

      return promise.then(() => {
        const after = selector(getState());
        expect(after.isFetching).toBe(false);
        expect(after).toMatchSnapshot();
      });
    });
  });

  describe('.find()', () => {
    it('returns the record', async () => {
      const people = await Queries.find(Person)({ id: '9' });
      expect(people).toMatchSnapshot();
    });

    it('s selector returns a single record', () => {
      const promise = Queries.find(Person)({ id: '9' });
      const selector = promise.selector;

      const before = selector(getState());
      expect(before).toBe(undefined);

      return promise.then(() => {
        const after = selector(getState());
        expect(after).toMatchSnapshot();
      });
    });
  });
});
