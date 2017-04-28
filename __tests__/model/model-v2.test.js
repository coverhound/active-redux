import { Attr, ModelV2 as Model } from '../../src';
import jsonApiData from '../fixtures/json-api-body';
import mockStore from '../fixtures/store';

const data = jsonApiData.data[0];
const [people, ...comments] = jsonApiData.included;

describe('Model', () => {
  beforeEach(() => {
    Model.store = mockStore;
  })

  describe('.__defineMethods__()', () => {
    test('defines attribute methods', () => {
      class Article extends Model {
        static attributes = {
          title: Attr.string()
        };
      }

      expect(new Article(data).title).toEqual(undefined);
      Article.__defineMethods__();
      expect(new Article(data).title).toEqual(data.attributes.title);
    });

    test('defines hasOne methods', () => {
      class Article extends Model {
        static attributes = {
          author: Attr.hasOne(),
        };
      }
      expect(new Article(data).author).toEqual(undefined);
      Article.__defineMethods__();
      expect(new Article(data).author).toEqual(people);
    });

    test('defines hasMany methods', () => {
      class Article extends Model {
        static attributes = {
          comments: Attr.hasMany(),
        }
      }

      Article.__defineMethods__();
      expect(new Article(data).comments).toEqual(comments);
    });
  });

  describe('#type', () => {
    test('gets the static type', () => {
      class Article extends Model { static type = 'articles'; }
      expect(new Article().type).toEqual('articles');
    });
  });
});
