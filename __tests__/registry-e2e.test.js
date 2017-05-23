import Registry from '../src/registry';
import { Attr, Model } from '../src';
import mockStore from './fixtures/store';
import jsonApiData from './fixtures/json-api-body';

const data = jsonApiData.data[0];
const [_, ...comments] = jsonApiData.included;

describe('Registry Integration', () => {
  let subject;

  beforeAll(() => {
    class Article extends Model {
      static attributes = {
        comments: Attr.hasMany(),
      }
    }

    Registry.register(Article);
    const RegisteredArticle = Registry.get('Article');
    subject = new RegisteredArticle(data);
  });

  describe('Querying the store', () => {
    test('Registered model can query store', () => {
      Registry.store = mockStore;
      expect(subject.comments).toEqual(comments);
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
