import { Attr, Model } from '../../src';
import jsonApiData from '../fixtures/json-api-body';
const data = jsonApiData.data[0];
const [people, ...comments] = jsonApiData.included;

describe('Model', () => {
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
        static find = () => people;
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
        static findAll = () => comments;
      }

      expect(new Article(data).comments).toEqual(undefined);
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
