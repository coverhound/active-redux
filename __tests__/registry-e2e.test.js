import { Attr, Model } from 'active-redux';
import Registry from 'active-redux/registry';
import mockStore from 'fixtures/store';
import jsonApiData from 'fixtures/json-api-body';

const [person, ...comments] = jsonApiData.included;

describe('Registry Integration', () => {
  let subject;

  beforeAll(() => {
    class Person extends Model {
      static type = 'people';
      static attributes = {
        comments: Attr.hasMany(),
      }
    }
    class Comment extends Model {
      static type = 'comments';
    }

    Registry.register(Person);
    Registry.register(Comment);
    subject = new Person(person);
  });

  describe('Querying the store', () => {
    test('Registered model can query store', async () => {
      Registry.store = mockStore;
      const subjectComments = await subject.comments;
      expect(subjectComments.length).toEqual(comments.length);
    });

    test('should throw if store is not set', () => {
      Registry.store = undefined;

      try {
        // eslint-disable-next-line no-unused-expressions
        subject.comments;
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
  });
});
